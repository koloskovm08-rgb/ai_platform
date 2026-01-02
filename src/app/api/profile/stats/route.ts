import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/profile/stats
 * Получение статистики пользователя:
 * - Общее количество генераций
 * - Количество избранных
 * - Количество редактирований
 * - Количество созданных шаблонов
 */
export async function GET() {
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

    // Параллельно получаем все статистики
    const [
      totalGenerations,
      favoritesCount,
      editsCount,
      templatesCount,
      publicGenerations,
    ] = await Promise.all([
      // Общее количество генераций
      prisma.generation.count({
        where: { userId },
      }),
      
      // Количество избранных
      prisma.generation.count({
        where: { userId, isFavorite: true },
      }),
      
      // Количество редактирований
      prisma.edit.count({
        where: { userId },
      }),
      
      // Количество созданных шаблонов
      prisma.template.count({
        where: { userId },
      }),
      
      // Количество публичных генераций
      prisma.generation.count({
        where: { userId, isPublic: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalGenerations,
        favoritesCount,
        editsCount,
        templatesCount,
        publicGenerations,
      },
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить статистику' },
      { status: 500 }
    );
  }
}

