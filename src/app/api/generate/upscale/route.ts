import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { upscaleImage } from '@/lib/ai/replicate';
import { z } from 'zod';

const upscaleSchema = z.object({
  generationId: z.string(),
  scale: z.enum(['2', '4']).optional(),
  faceEnhance: z.boolean().optional(),
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

    // Валидация данных
    const body = await request.json();
    const validatedData = upscaleSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Некорректные данные',
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { generationId, scale, faceEnhance } = validatedData.data;

    // Получить генерацию
    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
      },
    });

    if (!generation) {
      return NextResponse.json(
        { error: 'Генерация не найдена' },
        { status: 404 }
      );
    }

    // Увеличение разрешения
    const result = await upscaleImage({
      imageUrl: generation.imageUrl,
      scale: scale === '4' ? 4 : 2,
      faceEnhance: faceEnhance || false,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Ошибка увеличения разрешения' },
        { status: 500 }
      );
    }

    // Сохранение upscaled URL в БД
    const updated = await prisma.generation.update({
      where: { id: generationId },
      data: {
        upscaledUrl: result.imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      generation: updated,
      upscaledUrl: result.imageUrl,
      message: 'Разрешение успешно увеличено',
    });
  } catch (error) {
    console.error('Upscale API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

