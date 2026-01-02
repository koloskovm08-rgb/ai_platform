'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Фильтруем DOM ошибки, которые не критичны для React рендеринга
    // Эти ошибки часто возникают из-за race conditions и гидратации и не должны ломать UI
    if (
      error.name === 'NotFoundError' &&
      (error.message.includes('removeChild') ||
       error.message.includes('insertBefore') ||
       error.message.includes('replaceChild') ||
       error.message.includes('The node before which the new node is to be inserted'))
    ) {
      // Это DOM ошибка гидратации - не критична, просто логируем
      if (process.env.NODE_ENV === 'development') {
        console.warn('DOM hydration error caught (non-critical):', error.message);
      }
      // Не показываем ошибку пользователю для таких случаев
      return { hasError: false, error: null };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Не логируем DOM ошибки как критические
    if (
      error.name === 'NotFoundError' &&
      (error.message.includes('removeChild') ||
       error.message.includes('insertBefore') ||
       error.message.includes('replaceChild') ||
       error.message.includes('The node before which the new node is to be inserted'))
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('DOM hydration error (handled gracefully):', error.message);
      }
      return;
    }
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Сбрасываем ошибку при изменении children
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Используем setTimeout для безопасного обновления
    setTimeout(() => {
      window.location.reload();
    }, 0);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container flex min-h-[400px] items-center justify-center py-8">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Что-то пошло не так</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Произошла ошибка при загрузке этого компонента. Попробуйте
                обновить страницу.
              </p>
              {this.state.error && process.env.NODE_ENV === 'development' && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-mono text-destructive">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <Button
                onClick={this.handleReset}
                className="w-full"
              >
                Обновить страницу
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

