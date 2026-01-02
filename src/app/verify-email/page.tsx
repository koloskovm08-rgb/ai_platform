import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Метаданные страницы
 * Экспортируются только из Server Components
 */
export const metadata = {
  title: 'Подтверждение Email | AI Image Platform',
  description: 'Подтвердите ваш email адрес',
};

/**
 * Страница верификации email
 * Server Component - экспортирует metadata и рендерит Client Component
 * Обернута в Suspense для использования useSearchParams
 */
export default function VerifyEmailPage() {
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
      <VerifyEmailClient />
    </Suspense>
  );
}

