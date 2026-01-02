import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { generateVariations } from '@/lib/ai/replicate';
import { canGenerateImage, decrementGenerations } from '@/lib/utils/subscription';
import { z } from 'zod';

const variationsSchema = z.object({
  generationId: z.string(),
  prompt: z.string().optional(),
  strength: z.number().min(0).max(1).optional(),
  numOutputs: z.number().int().min(1).max(4).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Проверка лимитов подписки
    const canGenerate = await canGenerateImage(userId);
    
    if (!canGenerate.canGenerate) {
      return NextResponse.json(
        { error: canGenerate.reason || 'Превышен лимит генераций' },
        { status: 403 }
      );
    }

    // Валидация данных
    const body = await request.json();
    const validatedData = variationsSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Некорректные данные',
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { generationId, prompt, strength, numOutputs } = validatedData.data;

    // Получить оригинальную генерацию
    const originalGeneration = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
      },
    });

    if (!originalGeneration) {
      return NextResponse.json(
        { error: 'Генерация не найдена' },
        { status: 404 }
      );
    }

    // Генерация вариаций
    const result = await generateVariations({
      imageUrl: originalGeneration.imageUrl,
      prompt: prompt || originalGeneration.prompt,
      negativePrompt: originalGeneration.negativePrompt || undefined,
      strength: strength || 0.7,
      guidanceScale: originalGeneration.guidanceScale || 7.5,
      steps: originalGeneration.steps || 50,
      numOutputs: numOutputs || 1,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Ошибка генерации вариаций' },
        { status: 500 }
      );
    }

    // Сохранение вариаций в БД
    const variations = await Promise.all(
      (result.images || []).map(async (imageUrl) => {
        return await prisma.generation.create({
          data: {
            userId,
            prompt: prompt || originalGeneration.prompt,
            negativePrompt: originalGeneration.negativePrompt,
            model: originalGeneration.model,
            width: originalGeneration.width,
            height: originalGeneration.height,
            numOutputs: 1,
            imageUrl,
            guidanceScale: originalGeneration.guidanceScale,
            steps: originalGeneration.steps,
            parentId: generationId, // Связь с оригиналом
          },
        });
      })
    );

    // Уменьшение счетчика генераций
    await decrementGenerations(userId);

    return NextResponse.json({
      success: true,
      variations,
      message: 'Вариации успешно созданы',
    });
  } catch (error) {
    console.error('Variations API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

