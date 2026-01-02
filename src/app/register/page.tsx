'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

// Схема валидации для регистрации
const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно быть минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Регистрация через API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setFieldErrors(result.errors);
        }
        setError(result.error || 'Произошла ошибка при регистрации');
        setIsLoading(false);
        return;
      }

      // После успешной регистрации автоматически входим
      const loginResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Если автоматический вход не удался, редиректим на страницу входа
        router.push('/login?registered=true');
        return;
      }

      // Успешная регистрация и вход - редирект на главную
      router.push('/');
      router.refresh();
    } catch {
      setError('Произошла ошибка при регистрации');
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
          OAuthSignin: 'Ошибка регистрации через Google. Проверьте настройки OAuth в Google Console.',
          OAuthCallback: 'Ошибка обработки ответа от Google.',
          OAuthCreateAccount: 'Не удалось создать аккаунт через Google.',
          Callback: 'Ошибка обработки ответа от Google.',
          Default: 'Произошла ошибка при регистрации через Google. Попробуйте еще раз.',
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
      setError('Не удалось начать процесс регистрации через Google. Проверьте настройки OAuth.');
      setIsGoogleLoading(false);
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Произошла ошибка при регистрации через Google. Проверьте настройки OAuth.');
      setIsGoogleLoading(false);
    }
  };

  // Объединяем ошибки валидации формы и ошибки с сервера
  const getFieldError = (fieldName: keyof RegisterFormData) => {
    return (
      errors[fieldName]?.message ||
      (fieldErrors[fieldName] && fieldErrors[fieldName][0])
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Создать аккаунт</CardTitle>
          <CardDescription>
            Заполните форму для регистрации нового аккаунта
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
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Иван Иванов"
                {...register('name')}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={getFieldError('name') ? 'true' : 'false'}
              />
              {getFieldError('name') && (
                <p className="text-sm text-destructive" role="alert">
                  {getFieldError('name')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                {...register('email')}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={getFieldError('email') ? 'true' : 'false'}
              />
              {getFieldError('email') && (
                <p className="text-sm text-destructive" role="alert">
                  {getFieldError('email')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={getFieldError('password') ? 'true' : 'false'}
              />
              {getFieldError('password') && (
                <p className="text-sm text-destructive" role="alert">
                  {getFieldError('password')}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Зарегистрироваться
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
            Зарегистрироваться через Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Войти
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

