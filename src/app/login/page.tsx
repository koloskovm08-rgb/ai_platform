'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Схема валидации для входа
const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Функция для получения сообщения об ошибке
  const getErrorMessage = React.useCallback((errorCode: string | null): string | null => {
    if (!errorCode) return null;
    
    const errorMessages: Record<string, string> = {
      Configuration: 'Ошибка конфигурации сервера. Обратитесь к администратору.',
      AccessDenied: 'Доступ запрещен. Проверьте права доступа.',
      Verification: 'Ошибка верификации. Попробуйте еще раз.',
      OAuthSignin: 'Ошибка входа через OAuth. Проверьте настройки Google OAuth.',
      OAuthCallback: 'Ошибка обработки ответа от OAuth провайдера.',
      OAuthCreateAccount: 'Не удалось создать аккаунт через OAuth.',
      EmailCreateAccount: 'Не удалось создать аккаунт.',
      Callback: 'Ошибка обработки ответа от провайдера аутентификации.',
      OAuthAccountNotLinked: 'Этот аккаунт уже связан с другим пользователем.',
      EmailSignin: 'Ошибка отправки email.',
      CredentialsSignin: 'Неверный email или пароль.',
      SessionRequired: 'Требуется авторизация.',
      Default: 'Произошла ошибка при входе. Попробуйте еще раз.',
    };
    
    return errorMessages[errorCode] || errorMessages.Default;
  }, []);
  
  // Получаем ошибку из URL параметров
  const errorParam = searchParams.get('error');
  const urlError = getErrorMessage(errorParam);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(urlError);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  
  // Обновляем ошибку при изменении параметров URL
  React.useEffect(() => {
    const currentError = getErrorMessage(searchParams.get('error'));
    if (currentError) {
      setError(currentError);
    } else if (error && urlError === null) {
      // Очищаем ошибку, если её нет в URL
      setError(null);
    }
  }, [searchParams, getErrorMessage, error, urlError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Неверный email или пароль');
        setIsLoading(false);
        return;
      }

      // Успешный вход - редирект на главную
      router.push('/');
      router.refresh();
    } catch {
      setError('Произошла ошибка при входе');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      // В NextAuth v5 для OAuth провайдеров нужно использовать прямой редирект
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false, // Не делаем автоматический редирект, делаем вручную
      });
      
      // Если результат содержит ошибку
      if (result?.error) {
        console.error('Google sign in error:', result.error);
        // Более детальные сообщения об ошибках
        const errorMessages: Record<string, string> = {
          Configuration: 'Ошибка конфигурации Google OAuth. Обратитесь к администратору.',
          AccessDenied: 'Доступ запрещен. Проверьте права доступа к Google аккаунту.',
          OAuthSignin: 'Ошибка входа через Google. Проверьте настройки OAuth в Google Console.',
          OAuthCallback: 'Ошибка обработки ответа от Google.',
          OAuthCreateAccount: 'Не удалось создать аккаунт через Google.',
          Callback: 'Ошибка обработки ответа от Google.',
          Default: 'Произошла ошибка при входе через Google. Попробуйте еще раз.',
        };
        setError(errorMessages[result.error] || errorMessages.Default);
        setIsGoogleLoading(false);
        return;
      }
      
      // Если есть URL для редиректа (OAuth flow)
      if (result?.url) {
        window.location.href = result.url;
        // Не сбрасываем loading, так как происходит редирект
        return;
      }
      
      // Если нет URL, значит что-то пошло не так
      console.error('Google sign in: no redirect URL returned');
      setError('Не удалось начать процесс входа через Google. Проверьте настройки OAuth.');
      setIsGoogleLoading(false);
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Произошла ошибка при входе через Google. Проверьте настройки OAuth.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Вход в аккаунт</CardTitle>
          <CardDescription>
            Введите свои данные для входа в систему
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                {...register('email')}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Забыли пароль?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                или продолжить с
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 52.6 94.3 256s164.2 203.4 152.5 183.1c26.2-9.6 48.2-25.1 65.7-43.4H248v-96h240v96z"
              />
            </svg>
            Войти через Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Зарегистрироваться
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

