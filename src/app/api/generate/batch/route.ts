import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { generateWithStableDiffusion } from '@/lib/ai/replicate';
import { generateWithDALLE3 } from '@/lib/ai/openai';
import { canGenerateImage, decrementGenerations } from '@/lib/utils/subscription';

// Схема валидации для batch-генерации
const batchGenerateSchema = z.object({
  prompts: z.array(z.string().min(3, 'Промпт слишком короткий')).min(1).max(10), // Максимум 10 промптов
  model: z.enum(['STABLE_DIFFUSION', 'DALL_E_3']).default('STABLE_DIFFUSION'),
  width: z.number().int().positive().default(1024),
  height: z.number().int().positive().default(1024),
  negativePrompt: z.string().optional(),
  guidanceScale: z.number().min(1).max(20).default(7.5),
  steps: z.number().int().min(10).max(100).default(50),
});

/**
 * POST /api/generate/batch
 * Batch-генерация изображений (несколько промптов одновременно)
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Валидация данных
    const body = await request.json();
    const validatedData = batchGenerateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Некорректные данные',
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      prompts,
      model,
      width,
      height,
      negativePrompt,
      guidanceScale,
      steps,
    } = validatedData.data;

    // Проверяем лимиты для каждого промпта
    const canGenerate = await canGenerateImage(userId);
    
    if (!canGenerate.canGenerate) {
      return NextResponse.json(
        { error: canGenerate.reason || 'Превышен лимит генераций' },
        { status: 403 }
      );
    }

    // Проверяем роль пользователя - администраторы имеют полный доступ
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Администраторы не ограничены лимитами
    if (user?.role !== 'ADMIN') {
      // Проверяем, хватает ли генераций только для обычных пользователей
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
        select: { generationsLeft: true },
      });

      if (!subscription || subscription.generationsLeft < prompts.length) {
        return NextResponse.json(
          { 
            error: `Недостаточно генераций. Доступно: ${subscription?.generationsLeft || 0}, требуется: ${prompts.length}`,
          },
          { status: 403 }
        );
      }
    }

    // Типы результатов генерации
    type GenerationResult = {
      success: boolean;
      images?: string[];
      model?: string;
      error?: string;
    };

    // Генерируем изображения для всех промптов параллельно
    const results = await Promise.allSettled(
      prompts.map(async (prompt) => {
        try {
          // Генерация
          let result: GenerationResult;

          if (model === 'DALL_E_3') {
            let size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
            if (width === 1792 && height === 1024) size = '1792x1024';
            else if (width === 1024 && height === 1792) size = '1024x1792';

            result = await generateWithDALLE3({
              prompt,
              size,
              quality: 'standard',
              style: 'vivid',
              numOutputs: 1,
            });
          } else {
            result = await generateWithStableDiffusion({
              prompt,
              negativePrompt,
              width,
              height,
              numOutputs: 1,
              guidanceScale,
              steps,
            });
          }

          // Получаем URL изображения из результата
          if (!result.success || !result.images || result.images.length === 0) {
            throw new Error(result.error || 'Не удалось получить URL изображения');
          }
          
          const imageUrl = result.images[0];

          // Сохраняем в БД
          const generation = await prisma.generation.create({
            data: {
              userId,
              prompt,
              negativePrompt,
              model,
              width,
              height,
              numOutputs: 1,
              imageUrl,
              thumbnailUrl: imageUrl,
              guidanceScale,
              steps,
            },
          });

          // Уменьшаем счётчик генераций
          await decrementGenerations(userId);

          return {
            success: true,
            prompt,
            generation,
          };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Ошибка генерации для промпта "${prompt}":`, error);
          }
          const errorMessage = error instanceof Error ? error.message : 'Ошибка генерации';
          return {
            success: false,
            prompt,
            error: errorMessage,
          };
        }
      })
    );

    // Подсчёт результатов
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

    // Формируем ответ
    const generations = results.map((r) => {
      if (r.status === 'fulfilled') {
        return r.value;
      } else {
        return {
          success: false,
          error: r.reason?.message || 'Неизвестная ошибка',
        };
      }
    });

    return NextResponse.json({
      success: true,
      message: `Успешно: ${successful.length}/${prompts.length}`,
      total: prompts.length,
      successful: successful.length,
      failed: failed.length,
      generations,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Batch generation error:', error);
    }
    return NextResponse.json(
      { error: 'Не удалось выполнить генерацию' },
      { status: 500 }
    );
  }
}

