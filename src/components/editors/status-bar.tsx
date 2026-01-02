'use client';

import * as React from 'react';
import { Check, AlertCircle, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'idle' | 'saving' | 'saved' | 'error';

interface StatusBarProps {
  status: StatusType;
  message?: string;
  lastSaved?: Date;
  className?: string;
}

export function StatusBar({
  status,
  message,
  lastSaved,
  className,
}: StatusBarProps) {
  const statusConfig = {
    idle: {
      icon: null,
      text: 'Готов',
      color: 'text-muted-foreground',
    },
    saving: {
      icon: Loader2,
      text: 'Сохранение...',
      color: 'text-primary',
    },
    saved: {
      icon: Check,
      text: 'Сохранено',
      color: 'text-green-600',
    },
    error: {
      icon: AlertCircle,
      text: 'Ошибка',
      color: 'text-destructive',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-muted/50 border-t text-sm',
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn('h-4 w-4', config.color, status === 'saving' && 'animate-spin')}
        />
      )}
      <span className={cn('font-medium', config.color)}>
        {message || config.text}
      </span>
      {lastSaved && status === 'saved' && (
        <span className="text-xs text-muted-foreground ml-auto">
          {lastSaved.toLocaleTimeString('ru-RU')}
        </span>
      )}
    </div>
  );
}

