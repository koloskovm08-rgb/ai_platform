# 🚀 Руководство по деплою AI Image Platform

## Чеклист перед деплоем

### ✅ Обязательные шаги

- [ ] Все зависимости установлены (`npm install`)
- [ ] База данных настроена и миграции применены
- [ ] Переменные окружения настроены
- [ ] Приложение работает локально (`npm run dev`)
- [ ] Нет ошибок линтера (`npm run lint`)
- [ ] Проект собирается (`npm run build`)
- [ ] API ключи (Replicate, OpenAI) валидны
- [ ] ЮKassa настроена (для платежей)

### 📋 Опциональные шаги

- [ ] Тестовые данные добавлены (seed)
- [ ] Создан админ-аккаунт
- [ ] Загружены примеры шаблонов
- [ ] Настроен Cloudinary (для загрузки изображений)
- [ ] Google OAuth настроен

---

## Деплой на Vercel

### Шаг 1: Подготовка репозитория

```bash
# Инициализируйте Git (если еще не сделано)
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub
# Затем подключите его
git remote add origin https://github.com/ваш-username/ai-image-platform.git
git push -u origin main
```

### Шаг 2: Подключение к Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "Add New" → "Project"
3. Import вашего GitHub репозитория
4. Configure Project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Шаг 3: Переменные окружения

Добавьте в Settings → Environment Variables:

```env
# База данных (Vercel Postgres)
DATABASE_URL=ваш_database_url

# NextAuth
NEXTAUTH_URL=https://ваш-домен.vercel.app
NEXTAUTH_SECRET=генерируйте_новый_для_продакшена

# AI APIs
REPLICATE_API_TOKEN=r8_ваш_токен
OPENAI_API_KEY=sk-ваш_ключ

# ЮKassa
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_secret_key

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=ваш_client_id
GOOGLE_CLIENT_SECRET=ваш_client_secret

# Cloudinary (опционально)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ваше_облако
CLOUDINARY_API_KEY=ваш_api_key
CLOUDINARY_API_SECRET=ваш_api_secret
```

### Шаг 4: База данных

#### Вариант А: Vercel Postgres

1. В проекте Vercel → Storage → Create Database
2. Выберите Postgres
3. Скопируйте `DATABASE_URL` в Environment Variables

#### Вариант Б: Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Settings → Database → Connection String
3. Скопируйте `DATABASE_URL`

### Шаг 5: Миграции

После первого деплоя:

```bash
# Применить миграции через Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

Или настройте автоматические миграции в `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Шаг 6: Деплой

```bash
# Через CLI
vercel --prod

# Или через Git
git push origin main
```

### Шаг 7: Webhook ЮKassa

После деплоя настройте webhook:

```
https://ваш-домен.vercel.app/api/subscription/webhook
```

---

## Оптимизация для продакшена

### 1. Оптимизация изображений

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};
```

### 2. Кэширование

```typescript
// app/api/templates/route.ts
export const revalidate = 3600; // Кэш на 1 час
```

### 3. Bundle Analyzer

```bash
npm install @next/bundle-analyzer
```

```typescript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Запуск: `ANALYZE=true npm run build`

### 4. Loading States

Добавьте `loading.tsx` в каждую папку маршрута:

```typescript
// app/generate/loading.tsx
export default function Loading() {
  return <div>Загрузка...</div>;
}
```

### 5. Error Boundaries

```typescript
// app/generate/error.tsx
'use client';

export default function Error({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Что-то пошло не так!</h2>
      <button onClick={() => reset()}>Попробовать снова</button>
    </div>
  );
}
```

---

## Мониторинг и аналитика

### Sentry (ошибки)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

<SpeedInsights />
```

---

## Безопасность

### 1. Rate Limiting

Установите `@upstash/ratelimit`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// В API route
const identifier = request.ip ?? 'anonymous';
const { success } = await ratelimit.limit(identifier);
if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
```

### 2. CORS

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}
```

### 3. CSP

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
          },
        ],
      },
    ];
  },
};
```

---

## SEO

### 1. Metadata

```typescript
// app/page.tsx
export const metadata = {
  title: 'AI Image Platform - Генерация изображений с помощью AI',
  description: 'Создавайте уникальные изображения с помощью Stable Diffusion и DALL-E',
  openGraph: {
    title: 'AI Image Platform',
    description: 'Генерация и редактирование изображений с AI',
    url: 'https://ваш-домен.vercel.app',
    siteName: 'AI Image Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};
```

### 2. Sitemap

```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://ваш-домен.vercel.app',
      lastModified: new Date(),
    },
    {
      url: 'https://ваш-домен.vercel.app/generate',
      lastModified: new Date(),
    },
    // ...
  ];
}
```

### 3. robots.txt

```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: 'https://ваш-домен.vercel.app/sitemap.xml',
  };
}
```

---

## Резервное копирование

### База данных

```bash
# Экспорт
pg_dump -U username -d ai_platform > backup.sql

# Импорт
psql -U username -d ai_platform < backup.sql
```

### Автоматический бэкап (Vercel Postgres)

Settings → Backups → Enable Automated Backups

---

## Масштабирование

### Кэш (Redis)

```bash
# Upstash Redis
npm install @upstash/redis
```

### Очередь задач (Bull)

Для длительных AI генераций:

```bash
npm install bull
```

### CDN для изображений

Используйте Cloudinary или Vercel Blob Storage

---

## Troubleshooting

### Ошибка подключения к БД

- Проверьте `DATABASE_URL`
- Убедитесь, что IP Vercel добавлен в whitelist
- Проверьте SSL настройки

### AI генерация не работает

- Проверьте API ключи
- Проверьте лимиты API
- Проверьте логи в Vercel

### Webhook не вызывается

- Проверьте URL webhook в ЮKassa
- Проверьте логи в Vercel Functions
- Используйте ngrok для локальной отладки

---

## Полезные ссылки

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [ЮKassa Webhook](https://yookassa.ru/developers/using-api/webhooks)

