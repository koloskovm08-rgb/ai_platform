'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PricingCard } from '@/components/subscription/pricing-card';
import { SubscriptionStatus } from '@/components/subscription/subscription-status';
import { CheckCircle } from 'lucide-react';

interface Subscription {
  plan: string;
  status: string;
  generationsLeft: number;
  generationsLimit: number;
  currentPeriodEnd: string;
}

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Для начинающих',
    features: [
      '10 генераций в месяц',
      'Базовые шаблоны',
      'Редактор изображений',
      'Разрешение до 1024px',
    ],
  },
  {
    name: 'Pro',
    price: 990,
    description: 'Для профессионалов',
    features: [
      '100 генераций в месяц',
      'Премиум шаблоны',
      'Все AI модели',
      'Разрешение до 2048px',
      'Приоритетная генерация',
    ],
    isPopular: true,
  },
  {
    name: 'Premium',
    price: 2990,
    description: 'Без ограничений',
    features: [
      'Безлимит генераций',
      'Все шаблоны',
      'Все AI модели',
      'Разрешение до 4096px',
      'Приоритетная поддержка',
      'API доступ',
    ],
  },
];

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [processingPlan, setProcessingPlan] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planName: string) => {
    if (planName === 'Free') {
      // Бесплатный план - ничего не делаем
      return;
    }

    try {
      setProcessingPlan(planName);

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания подписки');
      }

      // Перенаправить на страницу оплаты ЮKassa
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="container py-8">
      {/* Уведомление об успешной оплате */}
      {success && (
        <div className="mb-8 rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-950 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">
              Оплата прошла успешно! Ваша подписка активирована.
            </p>
          </div>
        </div>
      )}

      {/* Заголовок */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Тарифные планы</h1>
        <p className="text-muted-foreground">
          Выберите план, который подходит именно вам
        </p>
      </div>

      {/* Текущая подписка */}
      {!loading && subscription && (
        <div className="mb-8 max-w-2xl mx-auto">
          <SubscriptionStatus
            plan={subscription.plan}
            status={subscription.status}
            generationsLeft={subscription.generationsLeft}
            generationsLimit={subscription.generationsLimit}
            currentPeriodEnd={new Date(subscription.currentPeriodEnd)}
          />
        </div>
      )}

      {/* Планы */}
      <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            isPopular={plan.isPopular}
            isCurrent={subscription?.plan === plan.name.toUpperCase()}
            onSelect={() => handleSelectPlan(plan.name)}
            loading={processingPlan === plan.name}
          />
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Часто задаваемые вопросы
        </h2>
        
        <div className="space-y-4">
          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-semibold">
              Как работает биллинг?
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Оплата списывается ежемесячно. Лимиты генераций обновляются каждый месяц.
              Вы можете отменить подписку в любое время.
            </p>
          </details>

          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-semibold">
              Что если я исчерпаю лимит генераций?
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Вы можете обновить план до Premium для безлимитных генераций или дождаться
              начала следующего месяца для обновления лимитов.
            </p>
          </details>

          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-semibold">
              Могу ли я понизить план?
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Да, вы можете понизить план в любое время. Изменения вступят в силу
              в начале следующего расчетного периода.
            </p>
          </details>

        </div>
      </div>
    </div>
  );
}

