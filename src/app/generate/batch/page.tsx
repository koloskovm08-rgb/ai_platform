'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BatchGenerationForm } from '@/components/generator/batch-generation-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Страница batch-генерации изображений
 * Позволяет генерировать несколько изображений одновременно
 */
export default function BatchGeneratePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Проверка авторизации
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/generate/batch');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <main className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-4 text-4xl">⏳</div>
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main id="main-content" className="container py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <Link href="/generate">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К одиночной генерации
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Batch генерация</h1>
            <p className="text-muted-foreground">
              Создайте до 10 изображений одновременно с разными промптами
            </p>
          </div>
        </div>
      </div>

      {/* Инфо-блок */}
      <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Как это работает
        </h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Введите до 10 разных промптов</li>
          <li>• Все изображения будут сгенерированы параллельно</li>
          <li>• Экономьте время на массовой генерации</li>
          <li>• Каждая генерация расходует 1 кредит</li>
        </ul>
      </div>

      {/* Форма */}
      <BatchGenerationForm />
    </main>
  );
}

