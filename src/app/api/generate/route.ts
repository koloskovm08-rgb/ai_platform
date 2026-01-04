import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { generateImageSchema } from '@/lib/utils/validation';
import { generateWithStableDiffusion } from '@/lib/ai/replicate';
import { generateWithDALLE3 } from '@/lib/ai/openai';
import { canGenerateImage, decrementGenerations } from '@/lib/utils/subscription';

/**
 * Улучшает промпт в зависимости от типа контента
 */
function enhancePromptForContentType(
  prompt: string,
  contentType?: string
): { enhancedPrompt: string; enhancedNegativePrompt: string } {
  let enhancedPrompt = prompt;
  let enhancedNegativePrompt = 'blurry, low quality, distorted, ugly, bad anatomy';

  switch (contentType) {
    case 'business-card':
      enhancedPrompt = `Professional business card design, ${prompt}, clean layout, modern typography, high-end corporate style, elegant and minimalist, professional color scheme, suitable for printing`;
      enhancedNegativePrompt += ', cluttered, messy, unprofessional, childish, cartoon, 3d render, photo, person, face';
      break;

    case 'poster':
      enhancedPrompt = `Eye-catching poster design, ${prompt}, bold typography, striking visual composition, professional graphic design, suitable for printing`;
      enhancedNegativePrompt += ', blurry text, unreadable, cluttered';
      break;

    case 'logo':
      enhancedPrompt = `Professional logo design, ${prompt}, clean vector style, simple and memorable, scalable, iconic, modern branding`;
      enhancedNegativePrompt += ', complex, detailed photo, 3d, realistic, cluttered, text';
      break;

    case 'sticker':
      enhancedPrompt = `Cute sticker design, ${prompt}, vibrant colors, clean edges, die-cut style, fun and playful, isolated on white background`;
      enhancedNegativePrompt += ', blurry edges, complex background, realistic photo';
      break;

    case 'greeting-card':
      enhancedPrompt = `Beautiful greeting card design, ${prompt}, warm and inviting, elegant composition, suitable for special occasions`;
      enhancedNegativePrompt += ', dark, gloomy, inappropriate';
      break;

    case 'label':
      enhancedPrompt = `Product label design, ${prompt}, clean and professional, clear typography, attractive packaging design`;
      enhancedNegativePrompt += ', cluttered, unreadable text, unprofessional';
      break;

    case 'product-card':
      enhancedPrompt = `E-commerce product card design, ${prompt}, clean white background, professional product photography style, high-quality commercial image`;
      enhancedNegativePrompt += ', cluttered background, unprofessional, low resolution';
      break;

    default:
      // Для 'general' или undefined оставляем промпт как есть
      break;
  }

  return {
    enhancedPrompt,
    enhancedNegativePrompt,
  };
}

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
    const validatedData = generateImageSchema.safeParse(body);

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
      prompt,
      negativePrompt,
      model,
      width,
      height,
      numOutputs,
      guidanceScale,
      steps,
      contentType,
    } = validatedData.data;

    // Улучшаем промпт в зависимости от типа контента
    const { enhancedPrompt, enhancedNegativePrompt } = enhancePromptForContentType(
      prompt,
      contentType
    );

    // Используем улучшенный промпт или оригинальный negativePrompt если он был указан
    const finalPrompt = contentType && contentType !== 'general' ? enhancedPrompt : prompt;
    const finalNegativePrompt = contentType && contentType !== 'general' 
      ? enhancedNegativePrompt 
      : (negativePrompt || enhancedNegativePrompt);

    // Генерация изображения в зависимости от модели
    let result;

    if (model === 'DALL_E_3') {
      // DALL-E 3 поддерживает только определенные размеры
      let size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
      
      if (width === 1792 && height === 1024) size = '1792x1024';
      else if (width === 1024 && height === 1792) size = '1024x1792';

      result = await generateWithDALLE3({
        prompt: finalPrompt,
        size,
        quality: 'standard',
        style: 'vivid',
        numOutputs,
      });
    } else {
      // Stable Diffusion (по умолчанию)
      result = await generateWithStableDiffusion({
        prompt: finalPrompt,
        negativePrompt: finalNegativePrompt,
        width,
        height,
        numOutputs,
        guidanceScale,
        steps,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Ошибка генерации' },
        { status: 500 }
      );
    }

    // Сохранение результатов в БД
    const generations = await Promise.all(
      (result.images || []).map(async (imageUrl) => {
        return await prisma.generation.create({
          data: {
            userId,
            prompt: finalPrompt, // Сохраняем улучшенный промпт
            negativePrompt: finalNegativePrompt,
            model,
            width,
            height,
            numOutputs: 1,
            imageUrl,
            guidanceScale,
            steps,
          },
        });
      })
    );

    // Уменьшение счетчика генераций
    await decrementGenerations(userId);

    return NextResponse.json({
      success: true,
      generations,
      message: 'Изображение успешно сгенерировано',
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Generation API error:', error);
    }
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

/**
 * GET: Получить историю генераций пользователя
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const favoritesOnly = searchParams.get('favorites') === 'true';

    const whereClause: {
      userId: string;
      isFavorite?: boolean;
    } = { userId: session.user.id };
    if (favoritesOnly) {
      whereClause.isFavorite = true;
    }

    // Оптимизация: получаем только нужные поля
    const generations = await prisma.generation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        upscaledUrl: true,
        createdAt: true,
        model: true,
        isFavorite: true,
        isPublic: true,
        shareToken: true,
        // Не загружаем ненужные поля: negativePrompt, style, width, height, seed, etc.
      },
    });

    const total = await prisma.generation.count({
      where: whereClause,
    });

    const response = NextResponse.json({
      generations,
      total,
      limit,
      offset,
    });

    // Кэширование только на клиенте (персональные данные)
    // Короткое время кэширования, т.к. данные могут часто меняться
    response.headers.set(
      'Cache-Control',
      'private, max-age=10, stale-while-revalidate=30'
    );

    return response;
  } catch (error) {
    console.error('Get generations error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения истории' },
      { status: 500 }
    );
  }
}

