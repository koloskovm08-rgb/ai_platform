import { prisma, safePrismaQuery } from '@/lib/db/prisma';
import { SubscriptionPlan } from '@prisma/client';

/**
 * Получить подписку пользователя
 * Использует safePrismaQuery для автоматических повторов при ошибках подключения
 */
export async function getUserSubscription(userId: string) {
  return await safePrismaQuery(() =>
    prisma.subscription.findUnique({
      where: { userId },
    })
  );
}

/**
 * Проверить, имеет ли пользователь доступ к премиум функциям
 * Администраторы всегда имеют доступ к премиум функциям
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  // Проверяем роль пользователя - администраторы имеют полный доступ
  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
  );

  // Администраторы имеют доступ ко всем премиум функциям
  if (user?.role === 'ADMIN') {
    return true;
  }

  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.status !== 'ACTIVE') {
    return false;
  }

  // PRO и PREMIUM планы имеют доступ к премиум функциям
  return subscription.plan === 'PRO' || subscription.plan === 'PREMIUM';
}

/**
 * Проверить, может ли пользователь генерировать изображения
 */
export async function canGenerateImage(userId: string): Promise<{
  canGenerate: boolean;
  reason?: string;
}> {
  // Проверяем роль пользователя - администраторы имеют полный доступ
  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
  );

  // Администраторы имеют доступ ко всем функциям без подписки
  if (user?.role === 'ADMIN') {
    return { canGenerate: true };
  }

  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      canGenerate: false,
      reason: 'Подписка не найдена',
    };
  }

  if (subscription.status !== 'ACTIVE') {
    return {
      canGenerate: false,
      reason: 'Подписка неактивна',
    };
  }

  // Для PREMIUM подписки - безлимит
  if (subscription.plan === 'PREMIUM') {
    return { canGenerate: true };
  }

  // Проверка периода подписки
  const now = new Date();
  if (now > subscription.currentPeriodEnd) {
    // Период истек - сбрасываем лимиты
    await resetSubscriptionPeriod(userId);
    return { canGenerate: true };
  }

  // Проверка лимитов
  if (subscription.generationsLeft <= 0) {
    return {
      canGenerate: false,
      reason: 'Исчерпан лимит генераций',
    };
  }

  return { canGenerate: true };
}

/**
 * Уменьшить счетчик оставшихся генераций
 */
export async function decrementGenerations(userId: string) {
  // Проверяем роль пользователя - администраторы не учитывают лимиты
  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
  );

  // Администраторы не учитывают лимиты
  if (user?.role === 'ADMIN') {
    return;
  }

  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.plan === 'PREMIUM') {
    return; // Для PREMIUM не уменьшаем
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      generationsLeft: Math.max(0, subscription.generationsLeft - 1),
    },
  });
}

/**
 * Сбросить период подписки (новый месяц)
 */
export async function resetSubscriptionPeriod(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (!subscription) return;

  const now = new Date();
  const nextPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.subscription.update({
    where: { userId },
    data: {
      currentPeriodStart: now,
      currentPeriodEnd: nextPeriodEnd,
      generationsLeft: subscription.generationsLimit,
    },
  });
}

/**
 * Получить лимиты для тарифного плана
 */
export function getPlanLimits(plan: SubscriptionPlan) {
  const limits = {
    FREE: {
      generationsPerMonth: 10,
      maxImageSize: 1024,
      premiumTemplates: false,
      prioritySupport: false,
    },
    PRO: {
      generationsPerMonth: 100,
      maxImageSize: 2048,
      premiumTemplates: true,
      prioritySupport: false,
    },
    PREMIUM: {
      generationsPerMonth: Infinity,
      maxImageSize: 4096,
      premiumTemplates: true,
      prioritySupport: true,
    },
  };

  return limits[plan];
}

/**
 * Обновить план подписки
 */
export async function updateSubscriptionPlan(
  userId: string,
  newPlan: SubscriptionPlan,
  paymentId?: string
) {
  const limits = getPlanLimits(newPlan);

  return await prisma.subscription.update({
    where: { userId },
    data: {
      plan: newPlan,
      status: 'ACTIVE',
      generationsLimit: limits.generationsPerMonth === Infinity ? 999999 : limits.generationsPerMonth,
      generationsLeft: limits.generationsPerMonth === Infinity ? 999999 : limits.generationsPerMonth,
      paymentId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

