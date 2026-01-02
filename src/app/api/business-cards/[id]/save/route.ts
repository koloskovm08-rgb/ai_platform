import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

/**
 * POST: Быстрое автосохранение проекта (только canvasData, без метаданных)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { canvasData, thumbnailUrl } = body;

    if (!canvasData) {
      return NextResponse.json(
        { error: 'Отсутствует canvasData' },
        { status: 400 }
      );
    }

    // Проверка существования проекта и доступа
    const existingProject = await prisma.businessCardProject.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Проект не найден' },
        { status: 404 }
      );
    }

    if (existingProject.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Быстрое обновление только данных canvas
    await prisma.businessCardProject.update({
      where: { id },
      data: {
        canvasData: canvasData as Prisma.InputJsonValue,
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Проект сохранен',
    });
  } catch (error) {
    console.error('Auto-save business card project error:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения проекта' },
      { status: 500 }
    );
  }
}

