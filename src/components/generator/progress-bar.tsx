'use client';

import * as React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress?: number; // 0-100
  status?: 'idle' | 'generating' | 'processing' | 'completed' | 'error';
  message?: string;
  className?: string;
  showDetails?: boolean;
}

export function ProgressBar({ 
  progress = 0, 
  status = 'idle',
  message,
  className,
  showDetails = true,
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = React.useState(0);
  const progressRef = React.useRef(progress);

  React.useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  React.useEffect(() => {
    if (status === 'generating' || status === 'processing') {
      // Плавная анимация прогресса с реальными обновлениями
      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          const target = progressRef.current;
          if (prev < target) {
            // Плавное увеличение с ускорением
            const diff = target - prev;
            const step = Math.max(1, Math.ceil(diff / 10));
            return Math.min(prev + step, target);
          }
          return prev;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, status]);

  if (status === 'idle') {
    return null;
  }

  const statusMessages = {
    generating: 'Генерация изображения...',
    processing: 'Обработка...',
    completed: 'Готово!',
    error: 'Произошла ошибка',
  };

  const displayMessage = message || statusMessages[status] || '';

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {status === 'generating' || status === 'processing' ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : status === 'completed' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : status === 'error' ? (
            <XCircle className="h-4 w-4 text-destructive" />
          ) : null}
          <span className={cn(
            'text-muted-foreground',
            status === 'completed' && 'text-green-600',
            status === 'error' && 'text-destructive'
          )}>
            {displayMessage}
          </span>
        </div>
        {(status === 'generating' || status === 'processing' || status === 'completed') && (
          <span className="font-medium text-primary">
            {Math.round(displayProgress)}%
          </span>
        )}
      </div>
      
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            status === 'error' 
              ? 'bg-destructive' 
              : status === 'completed'
              ? 'bg-green-500'
              : 'bg-primary'
          )}
          style={{ width: `${displayProgress}%` }}
        />
        {/* Анимация загрузки */}
        {status === 'generating' || status === 'processing' ? (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        ) : null}
      </div>

      {showDetails && (status === 'generating' || status === 'processing') && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Это может занять несколько минут...</span>
        </div>
      )}

      {status === 'completed' && showDetails && (
        <div className="text-xs text-green-600">
          Изображение успешно сгенерировано
        </div>
      )}

      {status === 'error' && showDetails && (
        <div className="text-xs text-destructive">
          Попробуйте снова или обратитесь в поддержку
        </div>
      )}
    </div>
  );
}

