import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * GET: Получить проект визитки по ID
 */
export async function GET(
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

    const project = await prisma.businessCardProject.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            previewUrl: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Проект не найден' },
        { status: 404 }
      );
    }

    // Проверка доступа
    if (project.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get business card project error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения проекта' },
      { status: 500 }
    );
  }
}

/**
 * PUT: Обновить проект визитки
 */
export async function PUT(
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
    const { name, canvasData, config, thumbnailUrl, templateId } = body;

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

    // Обновление проекта
    const project = await prisma.businessCardProject.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(canvasData !== undefined && { canvasData }),
        ...(config !== undefined && { config }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(templateId !== undefined && { templateId: templateId || null }),
      },
    });

    return NextResponse.json({
      project,
      message: 'Проект успешно обновлен',
    });
  } catch (error) {
    console.error('Update business card project error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления проекта' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Удалить проект визитки
 */
export async function DELETE(
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

    await prisma.businessCardProject.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Проект успешно удален',
    });
  } catch (error) {
    console.error('Delete business card project error:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления проекта' },
      { status: 500 }
    );
  }
}

