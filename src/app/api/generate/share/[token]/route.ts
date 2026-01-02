import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET: Получить публичное изображение по токену
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const generation = await prisma.generation.findFirst({
      where: {
        shareToken: token,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!generation) {
      return NextResponse.json(
        { error: 'Изображение не найдено или доступ запрещен' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      generation: {
        id: generation.id,
        prompt: generation.prompt,
        imageUrl: generation.imageUrl,
        upscaledUrl: generation.upscaledUrl,
        model: generation.model,
        createdAt: generation.createdAt,
        author: generation.user.name || 'Анонимный пользователь',
      },
    });
  } catch (error) {
    console.error('Share token API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

