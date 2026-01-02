'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2, Image as ImageIcon, Heart, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'generation' | 'edit';
  data: Record<string, unknown>;
  createdAt: Date | string;
}

interface ProfileActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

/**
 * Компонент истории активности пользователя
 * Показывает последние генерации и редактирования
 */
export function ProfileActivity({ activities, isLoading }: ProfileActivityProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Нет активности</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Начните создавать изображения, и ваша активность появится здесь
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Создать первое изображение
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard key={`${activity.type}-${activity.id}`} activity={activity} />
      ))}
    </div>
  );
}

/**
 * Карточка одной активности
 */
function ActivityCard({ activity }: { activity: Activity }) {
  const isGeneration = activity.type === 'generation';
  const data = activity.data;

  // Форматирование даты
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: ru,
  });

  // URL изображения
  const imageUrl = isGeneration
    ? (typeof data.thumbnailUrl === 'string' ? data.thumbnailUrl : typeof data.imageUrl === 'string' ? data.imageUrl : null)
    : (typeof data.thumbnailUrl === 'string' ? data.thumbnailUrl : typeof data.editedImageUrl === 'string' ? data.editedImageUrl : null);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        {/* Превью изображения */}
        <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={isGeneration ? 'Генерация' : 'Редактирование'}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isGeneration ? (
              <Wand2 className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <ImageIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
            )}
            <Badge variant={isGeneration ? 'default' : 'secondary'}>
              {isGeneration ? 'Генерация' : 'Редактирование'}
            </Badge>
            {isGeneration && typeof data.isFavorite === 'boolean' && data.isFavorite && (
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            )}
          </div>

          {isGeneration ? (
            <p className="text-sm text-foreground line-clamp-2 mb-1">
              {typeof data.prompt === 'string' ? data.prompt : 'Без описания'}
            </p>
          ) : (
            <p className="text-sm text-foreground mb-1">
              Отредактировано изображение
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            {isGeneration && typeof data.model === 'string' && data.model && (
              <Badge variant="outline" className="text-xs">
                {data.model}
              </Badge>
            )}
          </div>
        </div>

        {/* Ссылка на просмотр */}
        <Link
          href={isGeneration ? `/generate?view=${data.id}` : `/edit?view=${data.id}`}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Посмотреть"
        >
          <ExternalLink className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
    </Card>
  );
}

