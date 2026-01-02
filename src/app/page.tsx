import Link from 'next/link';
import { Sparkles, Wand2, Edit3, Layout, Zap, Shield, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
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
  name: 'ArtiGen',
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
  name: 'ArtiGen',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: 'Профессиональная платформа для создания изображений с помощью AI',
  sameAs: [],
};

const softwareApplicationData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ArtiGen',
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
      <section className="relative container flex flex-col items-center justify-center gap-8 pb-12 pt-8 md:py-16 md:pb-16 lg:py-32 lg:pb-24 overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center">
          <div className="animate-fade-in-up flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-md px-4 py-1.5 text-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" aria-hidden="true" />
            <span className="font-medium gradient-text">
              Powered by AI
            </span>
          </div>
          
          <div className="mb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Logo size="lg" showText={true} />
          </div>
          
          <h1 className="animate-fade-in-up text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl xl:text-7xl" style={{ animationDelay: '0.2s' }}>
            Создавайте потрясающие изображения с помощью{' '}
            <span className="gradient-text">
              искусственного интеллекта
            </span>
          </h1>
          
          <p className="animate-fade-in-up max-w-[750px] text-base text-muted-foreground sm:text-lg md:text-xl" style={{ animationDelay: '0.3s' }}>
            Генерируйте уникальные изображения, редактируйте их в мощном редакторе
            и используйте готовые шаблоны для любых задач. Все в одной платформе.
          </p>
          
          <div className="animate-fade-in-up flex flex-wrap items-center justify-center gap-4 pt-6" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              asChild
              className="group relative overflow-hidden bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Link href="/register" prefetch={true} className="relative z-10">
                Начать бесплатно
                <Zap className="ml-2 h-4 w-4 group-hover:animate-pulse" aria-hidden="true" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="hover:bg-accent hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Link href="/templates" prefetch={true}>Посмотреть примеры</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-8 py-12 md:py-16 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl">
            Все инструменты в одном месте
          </h2>
          <p className="max-w-[750px] text-base text-muted-foreground sm:text-lg">
            Мощная платформа для работы с изображениями, созданная с использованием
            передовых AI-моделей
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Генерация */}
          <Card className="card-3d group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/25 border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="relative z-10">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 group-hover:from-primary/30 group-hover:to-purple-500/30 transition-all duration-300 shadow-lg group-hover:shadow-primary/30">
                <Wand2 className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-xl mb-2">AI Генерация</CardTitle>
              <CardDescription className="text-sm">
                Создавайте уникальные изображения из текстового описания
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-2.5 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
                  Stable Diffusion & DALL-E 3
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
                  Различные стили и модели
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
                  Высокое разрешение до 4K
                </li>
              </ul>
              <Button className="mt-4 w-full group/btn" asChild>
                <Link href="/generate" prefetch={true} className="relative overflow-hidden">
                  <span className="relative z-10">Создать изображение</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Редактор */}
          <Card className="card-3d group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 border-2 hover:border-purple-500/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="relative z-10">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300 shadow-lg group-hover:shadow-purple-500/30">
                <Edit3 className="h-7 w-7 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-xl mb-2">Редактор изображений</CardTitle>
              <CardDescription className="text-sm">
                Профессиональный редактор прямо в браузере
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-2.5 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-purple-600 shadow-sm shadow-purple-600/50" />
                  Обрезка, фильтры, эффекты
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-purple-600 shadow-sm shadow-purple-600/50" />
                  Работа со слоями
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-purple-600 shadow-sm shadow-purple-600/50" />
                  Текст и фигуры
                </li>
              </ul>
              <Button className="mt-4 w-full group/btn" variant="outline" asChild>
                <Link href="/edit" prefetch={false} className="relative overflow-hidden">
                  <span className="relative z-10">Открыть редактор</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/10 to-purple-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Шаблоны */}
          <Card className="card-3d group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/25 border-2 hover:border-orange-500/50 sm:col-span-2 lg:col-span-1 bg-card/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="relative z-10">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 group-hover:from-orange-500/30 group-hover:to-pink-500/30 transition-all duration-300 shadow-lg group-hover:shadow-orange-500/30">
                <Layout className="h-7 w-7 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-xl mb-2">Готовые шаблоны</CardTitle>
              <CardDescription className="text-sm">
                Библиотека шаблонов для любых задач
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-2.5 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-orange-600 shadow-sm shadow-orange-600/50" />
                  Стикеры, визитки, баннеры
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-orange-600 shadow-sm shadow-orange-600/50" />
                  Карточки товаров
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-orange-600 shadow-sm shadow-orange-600/50" />
                  Социальные сети
                </li>
              </ul>
              <Button className="mt-4 w-full group/btn" variant="outline" asChild>
                <Link href="/templates" prefetch={true} className="relative overflow-hidden">
                  <span className="relative z-10">Смотреть шаблоны</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-white/10 to-orange-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container space-y-8 bg-muted/30 py-12 md:py-16 lg:py-24 rounded-3xl my-8">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl">
            Простые и прозрачные цены
          </h2>
          <p className="max-w-[750px] text-base text-muted-foreground sm:text-lg">
            Начните бесплатно. Обновитесь, когда будете готовы.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {/* Free */}
          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 hover:border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">Free</CardTitle>
              <CardDescription>Для начинающих</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽0</span>
                <span className="text-muted-foreground">/месяц</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>10 генераций/месяц</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Базовые шаблоны</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Редактор изображений</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/register" prefetch={true}>Начать бесплатно</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/25 border-2 border-primary/50 shadow-lg hover:scale-105">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
              Популярный
            </div>
            <CardHeader className="pt-6">
              <CardTitle className="text-xl">Pro</CardTitle>
              <CardDescription>Для профессионалов</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽990</span>
                <span className="text-muted-foreground">/месяц</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>100 генераций/месяц</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Премиум шаблоны</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Разрешение до 2K</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Приоритетная генерация</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" asChild>
                <Link href="/subscription" prefetch={true}>Выбрать Pro</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 hover:border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">Premium</CardTitle>
              <CardDescription>Без ограничений</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽2990</span>
                <span className="text-muted-foreground">/месяц</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5">
                  <Infinity className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Безлимит генераций</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Все шаблоны</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Разрешение до 4K</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Приоритетная поддержка</span>
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
      <footer className="border-t bg-background/50 backdrop-blur-sm py-8 md:py-6">
        <div className="container flex flex-col items-center justify-between gap-6 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-relaxed text-muted-foreground md:text-left">
            © 2025 ArtiGen. Все права защищены.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors duration-300 hover:underline">
              О нас
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors duration-300 hover:underline">
              Политика конфиденциальности
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors duration-300 hover:underline">
              Условия использования
            </Link>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
