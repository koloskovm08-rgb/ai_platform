import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/profile/activity
 * Получение последней активности пользователя:
 * - Последние генерации (5 шт)
 * - Последние редактирования (5 шт)
 */
export async function GET(req: NextRequest) {
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

    // Параметры из query (опционально)
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // Параллельно получаем последние активности
    const [recentGenerations, recentEdits] = await Promise.all([
      // Последние генерации
      prisma.generation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          prompt: true,
          imageUrl: true,
          thumbnailUrl: true,
          model: true,
          isFavorite: true,
          isPublic: true,
          createdAt: true,
        },
      }),
      
      // Последние редактирования
      prisma.edit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          originalImageUrl: true,
          editedImageUrl: true,
          thumbnailUrl: true,
          operations: true,
          createdAt: true,
        },
      }),
    ]);

    // Объединяем и сортируем по дате
    const activities = [
      ...recentGenerations.map((gen) => ({
        id: gen.id,
        type: 'generation' as const,
        data: gen,
        createdAt: gen.createdAt,
      })),
      ...recentEdits.map((edit) => ({
        id: edit.id,
        type: 'edit' as const,
        data: edit,
        createdAt: edit.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit * 2); // Показываем в 2 раза больше для разнообразия

    return NextResponse.json({
      success: true,
      activities,
      recentGenerations,
      recentEdits,
    });
  } catch (error) {
    console.error('Ошибка получения активности:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить активность' },
      { status: 500 }
    );
  }
}

