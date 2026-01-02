import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * GET: Получить список всех проектов визиток пользователя
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const projects = await prisma.businessCardProject.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.businessCardProject.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      projects,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get business card projects error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения проектов' },
      { status: 500 }
    );
  }
}

/**
 * POST: Создать новый проект визитки
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, canvasData, config, thumbnailUrl, templateId } = body;

    if (!name || !canvasData || !config) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля: name, canvasData, config' },
        { status: 400 }
      );
    }

    const project = await prisma.businessCardProject.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        canvasData,
        config,
        thumbnailUrl: thumbnailUrl || null,
        templateId: templateId || null,
      },
    });

    return NextResponse.json(
      { project, message: 'Проект успешно создан' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create business card project error:', error);
    return NextResponse.json(
      { error: 'Ошибка создания проекта' },
      { status: 500 }
    );
  }
}

