import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/edits
 * Получение истории редактирований пользователя с пагинацией
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Получаем редактирования с пагинацией
    const [edits, totalCount] = await Promise.all([
      prisma.edit.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
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
      prisma.edit.count({
        where: { userId: session.user.id },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      edits,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Ошибка получения истории редактирований:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить историю' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/edits?id=xxx
 * Удаление редактирования
 */
export async function DELETE(req: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const editId = searchParams.get('id');

    if (!editId) {
      return NextResponse.json(
        { error: 'ID редактирования не предоставлен' },
        { status: 400 }
      );
    }

    // Проверяем существование и права доступа
    const edit = await prisma.edit.findUnique({
      where: { id: editId },
      select: { userId: true },
    });

    if (!edit) {
      return NextResponse.json(
        { error: 'Редактирование не найдено' },
        { status: 404 }
      );
    }

    if (edit.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Доступ запрещён' },
        { status: 403 }
      );
    }

    // Удаляем редактирование
    await prisma.edit.delete({
      where: { id: editId },
    });

    return NextResponse.json({
      success: true,
      message: 'Редактирование удалено',
    });
  } catch (error) {
    console.error('Ошибка удаления редактирования:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить редактирование' },
      { status: 500 }
    );
  }
}

