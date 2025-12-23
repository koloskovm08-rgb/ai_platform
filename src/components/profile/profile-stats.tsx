'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, Heart, Wand2, FileImage, Share2 } from 'lucide-react';

interface ProfileStatsProps {
  stats: {
    totalGenerations: number;
    favoritesCount: number;
    editsCount: number;
    templatesCount: number;
    publicGenerations: number;
  } | null;
  isLoading?: boolean;
}

/**
 * Компонент статистики профиля
 * Показывает карточки с основными метриками пользователя
 */
export function ProfileStats({ stats, isLoading }: ProfileStatsProps) {
  const statCards = [
    {
      label: 'Всего генераций',
      value: stats?.totalGenerations || 0,
      icon: Image,
      description: 'Созданных изображений',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Избранное',
      value: stats?.favoritesCount || 0,
      icon: Heart,
      description: 'Любимых изображений',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Редактирований',
      value: stats?.editsCount || 0,
      icon: Wand2,
      description: 'Отредактированных',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Шаблонов',
      value: stats?.templatesCount || 0,
      icon: FileImage,
      description: 'Созданных шаблонов',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Публичных',
      value: stats?.publicGenerations || 0,
      icon: Share2,
      description: 'Опубликованных работ',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((_, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

