'use client';

import * as React from 'react';
import { Check, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  onSelect: () => void;
  loading?: boolean;
  className?: string;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  isPopular,
  isCurrent,
  onSelect,
  loading,
  className,
}: PricingCardProps) {
  return (
    <Card className={cn(
      'relative flex flex-col',
      isPopular && 'border-primary shadow-lg scale-105',
      className
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            <Crown className="h-3 w-3" />
            Популярный
          </span>
        </div>
      )}

      <CardHeader className={cn(isPopular && 'pt-6')}>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">
            {price === 0 ? 'Бесплатно' : `₽${price.toLocaleString()}`}
          </span>
          {price > 0 && (
            <span className="text-muted-foreground">/месяц</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrent ? 'outline' : isPopular ? 'default' : 'outline'}
          onClick={onSelect}
          disabled={isCurrent || loading}
        >
          {isCurrent ? (
            'Текущий план'
          ) : loading ? (
            <>
              <Zap className="mr-2 h-4 w-4 animate-pulse" />
              Загрузка...
            </>
          ) : (
            `Выбрать ${name}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

