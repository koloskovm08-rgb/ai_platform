'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';

/**
 * Клиентский компонент для верификации email
 * Содержит всю интерактивную логику
 */
export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');
  const [alreadyVerified, setAlreadyVerified] = React.useState(false);

  const verifyEmail = React.useCallback(async (token: string) => {
    try {
      setStatus('loading');

      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка верификации');
      }

      setStatus('success');
      setMessage(data.message);
      setAlreadyVerified(data.alreadyVerified || false);

      // Перенаправляем на профиль через 3 секунды
      if (!data.alreadyVerified) {
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      }
    } catch (error: unknown) {
      setStatus('error');
      setMessage(
        error instanceof Error 
          ? error.message 
          : 'Не удалось подтвердить email'
      );
    }
  }, [router]);

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен верификации отсутствует');
      return;
    }

    // Автоматическая верификация при загрузке
    verifyEmail(token);
  }, [token, verifyEmail]);

  return (
    <main className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center space-y-6">
          {/* Иконка статуса */}
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
            )}
          </div>

          {/* Заголовок */}
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {status === 'loading' && 'Проверка email...'}
              {status === 'success' && (alreadyVerified ? 'Email уже подтверждён' : 'Email подтверждён!')}
              {status === 'error' && 'Ошибка верификации'}
            </h1>
            <p className="text-muted-foreground">
              {status === 'loading' && 'Пожалуйста, подождите...'}
              {status === 'success' && message}
              {status === 'error' && message}
            </p>
          </div>

          {/* Действия */}
          {status === 'success' && !alreadyVerified && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Вы будете автоматически перенаправлены в личный кабинет...
              </p>
              <Button asChild className="w-full">
                <Link href="/profile">Перейти в профиль</Link>
              </Button>
            </div>
          )}

          {status === 'success' && alreadyVerified && (
            <Button asChild className="w-full">
              <Link href="/profile">Перейти в профиль</Link>
            </Button>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <ResendVerificationForm />
              <Button variant="outline" asChild className="w-full">
                <Link href="/">На главную</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}

/**
 * Форма повторной отправки верификации
 */
function ResendVerificationForm() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: 'error', text: 'Введите email' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage(null);

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки');
      }

      setMessage({ type: 'success', text: 'Письмо отправлено! Проверьте вашу почту.' });
      setEmail('');
    } catch (error: unknown) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Не удалось отправить письмо' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">Отправить письмо повторно</p>
      </div>
      <form onSubmit={handleResend} className="space-y-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {message && (
          <p
            className={`text-xs ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message.text}
          </p>
        )}
        <Button type="submit" disabled={isLoading} className="w-full" size="sm">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Отправка...
            </>
          ) : (
            'Отправить повторно'
          )}
        </Button>
      </form>
    </div>
  );
}

