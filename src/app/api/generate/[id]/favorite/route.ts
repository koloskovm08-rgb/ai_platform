import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * PATCH: Добавить/убрать генерацию из избранного
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: generationId } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Проверка, что генерация принадлежит пользователю
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

    // Переключение статуса избранного
    const updated = await prisma.generation.update({
      where: { id: generationId },
      data: {
        isFavorite: !generation.isFavorite,
      },
    });

    return NextResponse.json({
      success: true,
      isFavorite: updated.isFavorite,
      message: updated.isFavorite 
        ? 'Добавлено в избранное' 
        : 'Удалено из избранного',
    });
  } catch (error) {
    console.error('Favorite API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

