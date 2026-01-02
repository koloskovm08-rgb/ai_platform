import * as React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProfileStats } from '@/components/profile/profile-stats';
import { ProfileActivity } from '@/components/profile/profile-activity';
import { ProfileSubscriptionInfo } from '@/components/profile/profile-subscription-info';
import { User } from 'lucide-react';

/**
 * Страница профиля пользователя
 * Показывает информацию о пользователе, статистику, историю активности
 */
export default async function ProfilePage() {
  // Проверяем авторизацию
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/profile');
  }

  // Загружаем данные профиля на сервере
  const [profileData, statsData, activityData] = await Promise.all([
    fetchProfile(session.user.id),
    fetchStats(session.user.id),
    fetchActivity(session.user.id),
  ]);

  return (
    <main id="main-content" className="container py-8 space-y-8">
      {/* Заголовок */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <p className="text-muted-foreground">
            Управление профилем и просмотр статистики
          </p>
        </div>
      </div>

      {/* Статистика */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-xl font-semibold mb-4">
          Ваша статистика
        </h2>
        <ProfileStats stats={statsData} />
      </section>

      {/* Основная сетка */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Левая колонка - Активность */}
        <div className="lg:col-span-2 space-y-6">
          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="text-xl font-semibold mb-4">
              Последняя активность
            </h2>
            <ProfileActivity activities={activityData} />
          </section>
        </div>

        {/* Правая колонка - Подписка */}
        <div className="space-y-6">
          <section aria-labelledby="subscription-heading">
            <h2 id="subscription-heading" className="text-xl font-semibold mb-4">
              Подписка
            </h2>
            <ProfileSubscriptionInfo subscription={profileData.subscription} />
          </section>
        </div>
      </div>
    </main>
  );
}

/**
 * Получение данных профиля (серверная функция)
 */
async function fetchProfile(userId: string) {
  try {
    const { prisma } = await import('@/lib/db/prisma');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            generationsLeft: true,
            generationsLimit: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return user;
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    throw error;
  }
}

/**
 * Получение статистики (серверная функция)
 */
async function fetchStats(userId: string) {
  try {
    const { prisma } = await import('@/lib/db/prisma');

    const [
      totalGenerations,
      favoritesCount,
      editsCount,
      templatesCount,
      publicGenerations,
    ] = await Promise.all([
      prisma.generation.count({ where: { userId } }),
      prisma.generation.count({ where: { userId, isFavorite: true } }),
      prisma.edit.count({ where: { userId } }),
      prisma.template.count({ where: { userId } }),
      prisma.generation.count({ where: { userId, isPublic: true } }),
    ]);

    return {
      totalGenerations,
      favoritesCount,
      editsCount,
      templatesCount,
      publicGenerations,
    };
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    return {
      totalGenerations: 0,
      favoritesCount: 0,
      editsCount: 0,
      templatesCount: 0,
      publicGenerations: 0,
    };
  }
}

/**
 * Получение последней активности (серверная функция)
 */
async function fetchActivity(userId: string) {
  try {
    const { prisma } = await import('@/lib/db/prisma');

    const limit = 5;

    const [recentGenerations, recentEdits] = await Promise.all([
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

    // Объединяем и сортируем
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
      .slice(0, limit * 2);

    return activities;
  } catch (error) {
    console.error('Ошибка загрузки активности:', error);
    return [];
  }
}

/**
 * Метаданные страницы
 */
export const metadata = {
  title: 'Личный кабинет | AI Image Platform',
  description: 'Управление профилем, просмотр статистики и истории генераций',
};

