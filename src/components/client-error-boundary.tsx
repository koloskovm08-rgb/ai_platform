'use client';

import * as React from 'react';
import { ErrorBoundary } from './error-boundary';

/**
 * Обёртка для ErrorBoundary, которая безопасно работает с серверными компонентами Next.js 15
 * ErrorBoundary помечен как 'use client', поэтому безопасен для SSR
 */
export function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Глобальный обработчик для некритических DOM ошибок
    // Эти ошибки возникают во время гидратации React и не должны ломать UI
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      if (
        error?.name === 'NotFoundError' &&
        (error?.message?.includes('removeChild') ||
         error?.message?.includes('insertBefore') ||
         error?.message?.includes('replaceChild') ||
         error?.message?.includes('The node before which the new node is to be inserted'))
      ) {
        // Подавляем некритические DOM ошибки, связанные с гидратацией
        event.preventDefault();
        if (process.env.NODE_ENV === 'development') {
          console.warn('[ClientErrorBoundary] Suppressed DOM hydration error:', error.message);
        }
        return false;
      }
    };

    // Обработчик для unhandled promise rejections, которые могут содержать DOM ошибки
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (
        error?.name === 'NotFoundError' &&
        (error?.message?.includes('removeChild') ||
         error?.message?.includes('insertBefore') ||
         error?.message?.includes('replaceChild') ||
         error?.message?.includes('The node before which the new node is to be inserted'))
      ) {
        event.preventDefault();
        if (process.env.NODE_ENV === 'development') {
          console.warn('[ClientErrorBoundary] Suppressed DOM hydration rejection:', error.message);
        }
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Всегда рендерим ErrorBoundary для консистентной структуры DOM
  // Это предотвращает hydration mismatch ошибки
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

