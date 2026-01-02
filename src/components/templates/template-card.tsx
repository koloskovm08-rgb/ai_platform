'use client';

import * as React from 'react';
import Image from 'next/image';
import { Eye, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  id: string;
  name: string;
  description?: string;
  previewUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  usageCount: number;
  type: string;
  category?: string;
  onPreview: (id: string) => void;
  className?: string;
  priority?: boolean; // Для above-the-fold изображений
}

export const TemplateCard = React.memo(function TemplateCard({
  id,
  name,
  description,
  previewUrl,
  thumbnailUrl,
  isPremium,
  usageCount,
  type,
  category,
  onPreview,
  className,
  priority = false,
}: TemplateCardProps) {
  return (
    <Card className={cn('group overflow-hidden transition-all hover:shadow-lg', className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={thumbnailUrl || previewUrl}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
        
        {/* Premium badge */}
        {isPremium && (
          <div className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white shadow-lg">
            <Crown className="mr-1 inline h-3 w-3" />
            Premium
          </div>
        )}

        {/* Overlay при наведении */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            onClick={() => onPreview(id)}
            aria-label={`Предпросмотр шаблона ${name}`}
          >
            <Eye className="mr-2 h-4 w-4" />
            Предпросмотр
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {type}
          </span>
          {category && (
            <span className="text-xs text-muted-foreground">
              {category}
            </span>
          )}
        </div>
        
        <h3 className="mb-1 font-semibold line-clamp-1">{name}</h3>
        
        {description && (
          <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>👁️ {usageCount} использований</span>
        </div>
      </CardContent>
    </Card>
  );
});

