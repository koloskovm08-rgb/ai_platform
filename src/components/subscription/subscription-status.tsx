'use client';

import * as React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SubscriptionStatusProps {
  plan: string;
  status: string;
  generationsLeft: number;
  generationsLimit: number;
  currentPeriodEnd: Date;
  className?: string;
}

export function SubscriptionStatus({
  plan,
  status,
  generationsLeft,
  generationsLimit,
  currentPeriodEnd,
  className,
}: SubscriptionStatusProps) {
  const isActive = status === 'ACTIVE';
  const isPremium = plan === 'PREMIUM';
  const percentage = isPremium ? 100 : (generationsLeft / generationsLimit) * 100;
  const daysLeft = Math.ceil(
    (new Date(currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isActive ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              Подписка активна
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Подписка неактивна
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Текущий план */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Текущий план</span>
            <span className="text-2xl font-bold">{plan}</span>
          </div>
        </div>

        {/* Лимит генераций */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Генерации в этом месяце</span>
            <span className="text-muted-foreground">
              {isPremium ? '∞' : `${generationsLeft} / ${generationsLimit}`}
            </span>
          </div>
          
          {!isPremium && (
            <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  'h-full transition-all',
                  percentage > 50 ? 'bg-green-600' :
                  percentage > 20 ? 'bg-amber-600' :
                  'bg-red-600'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Дата окончания */}
        {!isPremium && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Обновление через {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}
            </span>
          </div>
        )}

        {/* Предупреждение */}
        {!isPremium && generationsLeft === 0 && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mb-1 inline h-4 w-4" />
            {' '}Лимит генераций исчерпан. Обновите план для продолжения.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

