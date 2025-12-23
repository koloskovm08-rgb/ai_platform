'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress?: number; // 0-100
  status?: 'idle' | 'generating' | 'processing' | 'completed' | 'error';
  message?: string;
  className?: string;
}

export function ProgressBar({ 
  progress = 0, 
  status = 'idle',
  message,
  className 
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = React.useState(0);

  React.useEffect(() => {
    if (status === 'generating' || status === 'processing') {
      // Плавная анимация прогресса
      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          if (prev < progress) {
            return Math.min(prev + 1, progress);
          }
          return prev;
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, status]);

  if (status === 'idle' || status === 'completed') {
    return null;
  }

  const statusMessages = {
    generating: 'Генерация изображения...',
    processing: 'Обработка...',
    error: 'Произошла ошибка',
  };

  const displayMessage = message || statusMessages[status] || '';

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{displayMessage}</span>
        {status !== 'error' && (
          <span className="font-medium">{Math.round(displayProgress)}%</span>
        )}
      </div>
      
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            status === 'error' 
              ? 'bg-destructive' 
              : 'bg-primary'
          )}
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {status === 'generating' || status === 'processing' ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Это может занять несколько минут...</span>
        </div>
      ) : null}
    </div>
  );
}

