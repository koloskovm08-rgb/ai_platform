import * as React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Key, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Страница документации API
 */
export default async function ApiDocsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/api-docs');
  }

  return (
    <main className="container py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Code className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">API Документация</h1>
            <p className="text-muted-foreground">
              Интегрируйте AI Image Platform в ваши приложения
            </p>
          </div>
        </div>
      </div>

      {/* Быстрый старт */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Быстрый старт
        </h2>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-2">
            <span className="font-semibold text-primary">1.</span>
            <span>
              <Link href="/profile" className="text-primary hover:underline">
                Создайте API ключ
              </Link>
              {' '}в настройках профиля
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">2.</span>
            <span>Добавьте ключ в заголовок Authorization ваших запросов</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">3.</span>
            <span>Начните делать запросы к API endpoints</span>
          </li>
        </ol>
      </Card>

      {/* Аутентификация */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Аутентификация</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Все API запросы требуют авторизации через API ключ в заголовке:
        </p>
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY`}
        </pre>
      </Card>

      {/* Endpoints */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Доступные Endpoints</h2>

        {/* POST /api/v1/generate */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Генерация изображения</h3>
              <code className="text-sm text-muted-foreground">
                POST /api/v1/generate
              </code>
            </div>
            <Badge>POST</Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Создаёт новое изображение на основе текстового описания
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Request Body:</h4>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "prompt": "A beautiful sunset over mountains",
  "model": "STABLE_DIFFUSION",
  "width": 1024,
  "height": 1024,
  "negativePrompt": "blurry, low quality"
}`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Response:</h4>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "success": true,
  "imageUrl": "https://...",
  "generationId": "clxxxx..."
}`}
              </pre>
            </div>
          </div>
        </Card>

        {/* GET /api/v1/generations */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Получить генерации</h3>
              <code className="text-sm text-muted-foreground">
                GET /api/v1/generations
              </code>
            </div>
            <Badge variant="secondary">GET</Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Возвращает список ваших генераций
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Query Parameters:</h4>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`limit: number (default: 20)
offset: number (default: 0)`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Response:</h4>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "success": true,
  "generations": [...],
  "total": 100
}`}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      {/* Лимиты */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Rate Limits</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>FREE план: 1000 запросов в месяц</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>PRO план: 10,000 запросов в месяц</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>PREMIUM план: неограниченно</span>
          </li>
        </ul>
      </Card>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link href="/profile">
          <Button size="lg">
            <Key className="mr-2 h-5 w-5" />
            Создать API ключ
          </Button>
        </Link>
      </div>
    </main>
  );
}

export const metadata = {
  title: 'API Документация | AI Image Platform',
  description: 'Интегрируйте AI генерацию изображений в ваши приложения',
};

