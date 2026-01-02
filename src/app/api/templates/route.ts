import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { createTemplateSchema } from '@/lib/utils/validation';
import type { TemplateType, Prisma } from '@prisma/client';

// Кэширование для GET запросов - revalidate каждые 60 секунд
export const revalidate = 60;

/**
 * GET: Получить список шаблонов с фильтрацией
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const category = searchParams.get('category');
    const isPremium = searchParams.get('premium');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Prisma.TemplateWhereInput = {
      isPublic: true,
    };

    if (typeParam) {
      // Проверяем, что тип является валидным значением enum TemplateType
      const validTypes: TemplateType[] = [
        'STICKER',
        'BUSINESS_CARD',
        'LABEL',
        'BANNER',
        'PRODUCT_CARD',
        'SOCIAL_POST',
        'FLYER',
        'OTHER',
      ];
      if (validTypes.includes(typeParam as TemplateType)) {
        where.type = typeParam as TemplateType;
      }
    }

    if (category) {
      where.category = category;
    }

    if (isPremium !== null) {
      where.isPremium = isPremium === 'true';
    }

    // Оптимизация: получаем только нужные поля
    const templates = await prisma.template.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        category: true,
        previewUrl: true,
        thumbnailUrl: true,
        isPremium: true,
        usageCount: true,
        config: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        // Не загружаем createdAt, updatedAt, userId если не нужны
      },
    });

    const total = await prisma.template.count({ where });

    const response = NextResponse.json({
      templates,
      total,
      limit,
      offset,
    });

    // Кэширование на клиенте и CDN
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    return response;
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения шаблонов' },
      { status: 500 }
    );
  }
}

/**
 * POST: Создать новый шаблон
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
    const validatedData = createTemplateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Некорректные данные',
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        ...validatedData.data,
        userId: session.user.id,
        config: validatedData.data.config ?? {},
      },
    });

    return NextResponse.json(
      { template, message: 'Шаблон успешно создан' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Ошибка создания шаблона' },
      { status: 500 }
    );
  }
}

