'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

// Схема валидации
const forgotPasswordSchema = z.object({
  email: z.string().email('Некорректный email'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Страница запроса сброса пароля
 * Отправляет письмо со ссылкой для сброса
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось отправить письмо');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="max-w-md w-full p-8">
        {!success ? (
          <div className="space-y-6">
            {/* Заголовок */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Забыли пароль?</h1>
              <p className="text-sm text-muted-foreground">
                Введите ваш email, и мы отправим вам ссылку для сброса пароля
              </p>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Ошибка */}
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
                </div>
              )}

              {/* Кнопка отправки */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Отправить ссылку
                  </>
                )}
              </Button>
            </form>

            {/* Ссылка назад */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Вернуться к входу
              </Link>
            </div>
          </div>
        ) : (
          // Сообщение об успехе
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Письмо отправлено!</h2>
              <p className="text-sm text-muted-foreground">
                Проверьте вашу почту и следуйте инструкциям для сброса пароля.
                Ссылка будет действительна в течение 1 часа.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Вернуться к входу</Link>
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
}

