import { prisma } from '@/lib/db/prisma';
import { SubscriptionPlan } from '@prisma/client';

/**
 * Получить подписку пользователя
 */
export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findUnique({
    where: { userId },
  });
}

/**
 * Проверить, может ли пользователь генерировать изображения
 */
export async function canGenerateImage(userId: string): Promise<{
  canGenerate: boolean;
  reason?: string;
}> {
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

