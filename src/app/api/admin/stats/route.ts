import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

// Динамический route - использует auth() который требует headers
export const dynamic = 'force-dynamic';

// Кэширование статистики - revalidate каждые 30 секунд
export const revalidate = 30;

/**
 * GET: Получить статистику для админ-панели
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Параллельное получение всех статистик
    const [
      totalUsers,
      totalGenerations,
      totalTemplates,
      activeSubscriptions,
      recentUsers,
      popularTemplates,
      modelUsage,
      subscriptionBreakdown,
    ] = await Promise.all([
      // Общее количество пользователей
      prisma.user.count(),
      
      // Общее количество генераций
      prisma.generation.count(),
      
      // Общее количество шаблонов
      prisma.template.count(),
      
      // Активные подписки (не FREE)
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          plan: { not: 'FREE' },
        },
      }),
      
      // Последние зарегистрированные пользователи (5 штук)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      
      // Популярные шаблоны (топ 5)
      prisma.template.findMany({
        take: 5,
        orderBy: { usageCount: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
          usageCount: true,
        },
      }),
      
      // Статистика по AI моделям
      prisma.generation.groupBy({
        by: ['model'],
        _count: { model: true },
      }),
      
      // Разбивка по подпискам
      prisma.subscription.groupBy({
        by: ['plan'],
        _count: { plan: true },
        where: { status: 'ACTIVE' },
      }),
    ]);

    // Доход за последний месяц (примерный расчет)
    const revenue = activeSubscriptions * 990; // Упрощенный подсчет

    const response = NextResponse.json({
      overview: {
        totalUsers,
        totalGenerations,
        totalTemplates,
        activeSubscriptions,
        revenue,
      },
      recentUsers,
      popularTemplates,
      modelUsage: modelUsage.map((m) => ({
        model: m.model,
        count: m._count.model,
      })),
      subscriptionBreakdown: subscriptionBreakdown.map((s) => ({
        plan: s.plan,
        count: s._count.plan,
      })),
    });

    // Кэширование на клиенте и CDN (короче для админки, т.к. данные меняются чаще)
    response.headers.set(
      'Cache-Control',
      'private, s-maxage=30, stale-while-revalidate=60'
    );

    return response;
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статистики' },
      { status: 500 }
    );
  }
}

