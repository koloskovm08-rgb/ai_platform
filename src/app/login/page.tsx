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
  const [isGoogleAvailable, setIsGoogleAvailable] = React.useState<boolean | null>(null);
  const [isVkLoading, setIsVkLoading] = React.useState(false);
  const [isVkAvailable, setIsVkAvailable] = React.useState<boolean | null>(null);
  
  // Провайдеры считаем "проверенными", когда оба значения уже не null
  const providersChecked = isGoogleAvailable !== null && isVkAvailable !== null;
  const googleEnabled = isGoogleAvailable === true;
  const vkEnabled = isVkAvailable === true;
  const showOAuthSection = providersChecked && (googleEnabled || vkEnabled);
  
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

  // Проверяем доступность OAuth провайдеров при монтировании компонента
  React.useEffect(() => {
    const checkOAuthProviders = async () => {
      try {
        const response = await fetch('/api/auth/providers');
        if (!response.ok) {
          setIsGoogleAvailable(false);
          setIsVkAvailable(false);
          return;
        }
        const providers = await response.json();
        setIsGoogleAvailable(!!providers.google);
        setIsVkAvailable(!!providers.vk);
      } catch (error) {
        console.error('Failed to check OAuth providers:', error);
        setIsGoogleAvailable(false);
        setIsVkAvailable(false);
      }
    };
    
    checkOAuthProviders();
  }, []);

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
    } catch (error) {
      console.error('Login error:', error);
      setError('Произошла ошибка при входе');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Проверяем доступность провайдера перед попыткой входа
    if (isGoogleAvailable !== true) {
      setError('Google OAuth не настроен. Пожалуйста, используйте вход по email.');
      return;
    }

    setIsGoogleLoading(true);
    setError(null);

    try {
      // В NextAuth v5 для OAuth провайдеров нужно использовать прямой редирект
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false, // Не делаем автоматический редирект, делаем вручную
      });
      
      // Проверяем результат
      if (!result) {
        console.error('Google sign in: no result returned');
        setError('Google OAuth не настроен. Обратитесь к администратору.');
        setIsGoogleLoading(false);
        return;
      }
      
      // Если результат содержит ошибку
      if (result.error) {
        console.error('Google sign in error:', result.error);
        // Более детальные сообщения об ошибках
        const errorMessages: Record<string, string> = {
          Configuration: 'Ошибка конфигурации Google OAuth. Пожалуйста, используйте вход по email.',
          AccessDenied: 'Доступ запрещен. Вы отклонили доступ к своему Google аккаунту.',
          OAuthSignin: 'Ошибка входа через Google. Попробуйте позже или используйте вход по email.',
          OAuthCallback: 'Ошибка обработки ответа от Google. Попробуйте еще раз.',
          OAuthCreateAccount: 'Не удалось создать аккаунт через Google. Попробуйте регистрацию по email.',
          Callback: 'Ошибка обработки ответа от Google. Попробуйте еще раз.',
          Default: 'Произошла ошибка при входе через Google. Попробуйте еще раз.',
        };
        setError(errorMessages[result.error] || errorMessages.Default);
        setIsGoogleLoading(false);
        return;
      }
      
      // Если есть URL для редиректа (OAuth flow)
      if (result.url) {
        window.location.href = result.url;
        // Не сбрасываем loading, так как происходит редирект
        return;
      }
      
      // Если нет URL и нет ошибки, но результат ok: false
      if (result.ok === false) {
        console.error('Google sign in: signIn returned ok: false');
        setError('Google OAuth не настроен или провайдер недоступен. Проверьте настройки OAuth.');
        setIsGoogleLoading(false);
        return;
      }
      
      // Если нет URL, значит что-то пошло не так
      console.error('Google sign in: no redirect URL returned', result);
      setError('Не удалось начать процесс входа через Google. Проверьте настройки OAuth (GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env.local).');
      setIsGoogleLoading(false);
    } catch (error) {
      console.error('Google sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(`Произошла ошибка при входе через Google: ${errorMessage}. Проверьте настройки OAuth.`);
      setIsGoogleLoading(false);
    }
  };

  const handleVkSignIn = async () => {
    // Проверяем доступность провайдера перед попыткой входа
    if (isVkAvailable !== true) {
      setError('VK OAuth не настроен. Пожалуйста, используйте вход по email.');
      return;
    }

    setIsVkLoading(true);
    setError(null);

    try {
      // В NextAuth v5 для OAuth провайдеров нужно использовать прямой редирект
      const result = await signIn('vk', { 
        callbackUrl: '/',
        redirect: false,
      });
      
      // Проверяем результат
      if (!result) {
        console.error('VK sign in: no result returned');
        setError('VK OAuth не настроен. Обратитесь к администратору.');
        setIsVkLoading(false);
        return;
      }
      
      // Если результат содержит ошибку
      if (result.error) {
        console.error('VK sign in error:', result.error);
        const errorMessages: Record<string, string> = {
          Configuration: 'Ошибка конфигурации VK OAuth. Пожалуйста, используйте вход по email.',
          AccessDenied: 'Доступ запрещен. Вы отклонили доступ к своему VK аккаунту.',
          OAuthSignin: 'Ошибка входа через VK. Попробуйте позже или используйте вход по email.',
          OAuthCallback: 'Ошибка обработки ответа от VK. Попробуйте еще раз.',
          OAuthCreateAccount: 'Не удалось создать аккаунт через VK. Попробуйте регистрацию по email.',
          Callback: 'Ошибка обработки ответа от VK. Попробуйте еще раз.',
          Default: 'Произошла ошибка при входе через VK. Попробуйте еще раз.',
        };
        setError(errorMessages[result.error] || errorMessages.Default);
        setIsVkLoading(false);
        return;
      }
      
      // Если есть URL для редиректа (OAuth flow)
      if (result.url) {
        window.location.href = result.url;
        // Не сбрасываем loading, так как происходит редирект
        return;
      }
      
      // Если нет URL и нет ошибки, но результат ok: false
      if (result.ok === false) {
        console.error('VK sign in: signIn returned ok: false');
        setError('VK OAuth недоступен. Пожалуйста, используйте вход по email.');
        setIsVkLoading(false);
        return;
      }
      
      // Если нет URL, значит что-то пошло не так
      console.error('VK sign in: no redirect URL returned', result);
      setError('Не удалось начать процесс входа через VK. Проверьте настройки OAuth (VK_CLIENT_ID и VK_CLIENT_SECRET в .env.local).');
      setIsVkLoading(false);
    } catch (error) {
      console.error('VK sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(`Произошла ошибка при входе через VK: ${errorMessage}. Проверьте настройки OAuth.`);
      setIsVkLoading(false);
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
                disabled={isLoading || isGoogleLoading || isVkLoading}
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
                disabled={isLoading || isGoogleLoading || isVkLoading}
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
              disabled={isLoading || isGoogleLoading || isVkLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
          </form>

          {/* Показываем OAuth провайдеры только если хотя бы один доступен */}
          {showOAuthSection && (
            <>
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

              <div className="space-y-3">
                {googleEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isGoogleLoading || isVkLoading}
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
                )}

                {vkEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleVkSignIn}
                    disabled={isLoading || isGoogleLoading || isVkLoading}
                  >
                    {isVkLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <svg
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                      focusable="false"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.426.132-.426s-.02-1.299.567-1.489c.579-.187 1.322 1.256 2.11 1.811.596.42 1.05.328 1.05.328l2.108-.03s1.103-.07.579-.963c-.043-.073-.306-.663-1.575-1.876-1.328-1.27-1.15-1.064.449-3.259.973-1.335 1.362-2.148 1.24-2.497-.116-.333-.832-.245-.832-.245l-2.372.015s-.176-.025-.307.056c-.128.079-.21.263-.21.263s-.377 1.036-.88 1.918c-1.059 1.86-1.483 1.959-1.657 1.843-.404-.27-.303-1.083-.303-1.662 0-1.806.266-2.559-.518-2.754-.26-.065-.452-.108-1.117-.115-.853-.009-1.575.003-1.984.209-.272.137-.482.443-.354.461.158.022.516.1.706.366.245.344.236 1.118.236 1.118s.141 2.127-.329 2.391c-.324.182-.768-.189-1.722-1.88-.488-.864-.857-1.82-.857-1.82s-.071-.182-.198-.279c-.154-.118-.37-.156-.37-.156l-2.254.015s-.338.01-.462.161c-.11.134-.009.412-.009.412s1.771 4.269 3.773 6.419c1.835 1.973 3.917 1.843 3.917 1.843h.945z"/>
                    </svg>
                    Войти через ВКонтакте
                  </Button>
                )}
              </div>
            </>
          )}
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

