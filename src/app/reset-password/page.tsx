'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

// Схема валидации
const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Компонент формы сброса пароля (использует useSearchParams)
 */
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tokenValid, setTokenValid] = React.useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Проверка токена при загрузке
  React.useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Токен сброса пароля отсутствует');
      return;
    }

    // Можно добавить проверку токена на сервере
    setTokenValid(true);
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Токен отсутствует');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось сбросить пароль');
      }

      setSuccess(true);

      // Перенаправляем на страницу входа через 3 секунды
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // Невалидный токен
  if (tokenValid === false) {
    return (
      <main className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="max-w-md w-full p-8">
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Недействительная ссылка</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/forgot-password">Запросить новую ссылку</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Вернуться к входу</Link>
              </Button>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  // Успешный сброс
  if (success) {
    return (
      <main className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="max-w-md w-full p-8">
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Пароль изменён!</h2>
              <p className="text-sm text-muted-foreground">
                Ваш пароль успешно изменён. Вы будете перенаправлены на страницу входа...
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Войти с новым паролем</Link>
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // Форма сброса пароля
  return (
    <main className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="max-w-md w-full p-8">
        <div className="space-y-6">
          {/* Заголовок */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Новый пароль</h1>
            <p className="text-sm text-muted-foreground">
              Введите новый пароль для вашего аккаунта
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Новый пароль */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Новый пароль
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Ошибка */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
              </div>
            )}

            {/* Кнопка сброса */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить новый пароль'
              )}
            </Button>
          </form>
        </div>
      </Card>
    </main>
  );
}

/**
 * Страница сброса пароля
 * Принимает токен из URL и позволяет установить новый пароль
 * Обернута в Suspense для использования useSearchParams
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
          <Card className="max-w-md w-full p-8">
            <div className="text-center space-y-6">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Загрузка...</p>
            </div>
          </Card>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

