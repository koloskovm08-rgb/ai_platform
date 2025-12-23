'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Crown, Sparkles, TrendingUp } from 'lucide-react';

interface ProfileSubscriptionInfoProps {
  subscription: {
    plan: 'FREE' | 'PRO' | 'PREMIUM';
    status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING';
    generationsLeft: number;
    generationsLimit: number;
    currentPeriodEnd: Date;
  } | null;
}

/**
 * Компонент информации о подписке в профиле
 */
export function ProfileSubscriptionInfo({ subscription }: ProfileSubscriptionInfoProps) {
  if (!subscription) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Нет активной подписки</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Выберите тариф для начала работы
            </p>
          </div>
          <Button asChild>
            <Link href="/subscription">Выбрать тариф</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const planInfo = {
    FREE: {
      name: 'Бесплатный',
      icon: Sparkles,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      badgeVariant: 'secondary' as const,
    },
    PRO: {
      name: 'Pro',
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      badgeVariant: 'default' as const,
    },
    PREMIUM: {
      name: 'Premium',
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      badgeVariant: 'default' as const,
    },
  };

  const statusInfo = {
    ACTIVE: { label: 'Активна', color: 'text-green-500' },
    CANCELED: { label: 'Отменена', color: 'text-red-500' },
    PAST_DUE: { label: 'Просрочена', color: 'text-orange-500' },
    TRIALING: { label: 'Пробная', color: 'text-blue-500' },
  };

  const plan = planInfo[subscription.plan];
  const status = statusInfo[subscription.status];
  const Icon = plan.icon;

  // Процент использованных генераций
  const usedPercentage =
    ((subscription.generationsLimit - subscription.generationsLeft) /
      subscription.generationsLimit) *
    100;

  // Форматирование даты
  const endDate = new Date(subscription.currentPeriodEnd);
  const formattedDate = endDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Заголовок с планом */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-3 ${plan.bgColor}`}>
              <Icon className={`h-6 w-6 ${plan.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Тариф {plan.name}</h3>
              <Badge variant={plan.badgeVariant} className="mt-1">
                {status.label}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/subscription">Изменить</Link>
          </Button>
        </div>

        {/* Прогресс генераций */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Генерации</span>
            <span className="font-medium">
              {subscription.generationsLeft} / {subscription.generationsLimit}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${usedPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Осталось {subscription.generationsLeft} генераций в этом месяце
          </p>
        </div>

        {/* Дата окончания периода */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Следующее списание</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
        </div>

        {/* Рекомендация по улучшению */}
        {subscription.plan === 'FREE' && subscription.generationsLeft < 3 && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
            <p className="text-sm text-primary font-medium">
              💡 Генерации заканчиваются!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Перейдите на Pro или Premium для неограниченных генераций
            </p>
            <Button size="sm" className="mt-3 w-full" asChild>
              <Link href="/subscription">Улучшить тариф</Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

