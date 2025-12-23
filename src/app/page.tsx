import Link from 'next/link';
import { Sparkles, Wand2, Edit3, Layout, Zap, Shield, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Image Platform',
  description: 'Платформа для генерации и редактирования изображений с помощью искусственного интеллекта',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/templates?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Image Platform',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: 'Профессиональная платформа для создания изображений с помощью AI',
  sameAs: [],
};

const softwareApplicationData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Image Platform',
  applicationCategory: 'DesignApplication',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'RUB',
      name: 'Free Plan',
    },
    {
      '@type': 'Offer',
      price: '990',
      priceCurrency: 'RUB',
      name: 'Pro Plan',
    },
    {
      '@type': 'Offer',
      price: '2990',
      priceCurrency: 'RUB',
      name: 'Premium Plan',
    },
  ],
  operatingSystem: 'Any',
  description: 'Генерируйте уникальные изображения, редактируйте их в мощном редакторе и используйте готовые шаблоны',
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationData) }}
      />

      <div className="flex flex-col">
        {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-12 md:pb-12 lg:py-24 lg:pb-20">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Powered by AI</span>
          </div>
          
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
            Создавайте потрясающие изображения с помощью{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              искусственного интеллекта
            </span>
          </h1>
          
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Генерируйте уникальные изображения, редактируйте их в мощном редакторе
            и используйте готовые шаблоны для любых задач. Все в одной платформе.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/register" prefetch={true}>
                Начать бесплатно
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/templates" prefetch={true}>Посмотреть примеры</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
            Все инструменты в одном месте
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Мощная платформа для работы с изображениями, созданная с использованием
            передовых AI-моделей
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Генерация */}
          <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI Генерация</CardTitle>
              <CardDescription>
                Создавайте уникальные изображения из текстового описания
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Stable Diffusion & DALL-E 3
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Различные стили и модели
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Высокое разрешение до 4K
                </li>
              </ul>
              <Button className="mt-4 w-full" asChild>
                <Link href="/generate" prefetch={true}>Создать изображение</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Редактор */}
          <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Edit3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Редактор изображений</CardTitle>
              <CardDescription>
                Профессиональный редактор прямо в браузере
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                  Обрезка, фильтры, эффекты
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                  Работа со слоями
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                  Текст и фигуры
                </li>
              </ul>
              <Button className="mt-4 w-full" variant="outline" asChild>
                <Link href="/edit" prefetch={false}>Открыть редактор</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Шаблоны */}
          <Card className="group relative overflow-hidden transition-all hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                <Layout className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Готовые шаблоны</CardTitle>
              <CardDescription>
                Библиотека шаблонов для любых задач
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                  Стикеры, визитки, баннеры
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                  Карточки товаров
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                  Социальные сети
                </li>
              </ul>
              <Button className="mt-4 w-full" variant="outline" asChild>
                <Link href="/templates" prefetch={true}>Смотреть шаблоны</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container space-y-6 bg-muted/50 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
            Простые и прозрачные цены
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Начните бесплатно. Обновитесь, когда будете готовы.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {/* Free */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Для начинающих</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽0</span>
                <span className="text-muted-foreground">/месяц</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  10 генераций/месяц
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Базовые шаблоны
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Редактор изображений
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/register" prefetch={true}>Начать бесплатно</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-primary shadow-lg">
            <CardHeader>
              <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                Популярный
              </div>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Для профессионалов</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽990</span>
                <span className="text-muted-foreground">/месяц</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  100 генераций/месяц
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Премиум шаблоны
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Разрешение до 2K
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Приоритетная генерация
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/subscription" prefetch={true}>Выбрать Pro</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>Без ограничений</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽2990</span>
                <span className="text-muted-foreground">/месяц</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Infinity className="h-4 w-4 text-primary" />
                  Безлимит генераций
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Все шаблоны
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Разрешение до 4K
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Приоритетная поддержка
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/subscription" prefetch={true}>Выбрать Premium</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 AI Image Platform. Все права защищены.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              О нас
            </Link>
            <Link href="#" className="hover:text-foreground">
              Политика конфиденциальности
            </Link>
            <Link href="#" className="hover:text-foreground">
              Условия использования
            </Link>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
