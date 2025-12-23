import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toaster';
import { AuthSessionProvider } from '@/components/session-provider';
import { AnimatedBackground } from '@/components/animated-background';
import { Navbar } from '@/components/navbar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap', // Показывать fallback шрифт пока загружается основной
  preload: true, // Preload критичных шрифтов
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'], // Fallback шрифты
  adjustFontFallback: true, // Автоматическая настройка fallback
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AI Image Platform - Генерация и редактирование изображений',
    template: '%s | AI Image Platform',
  },
  description: 'Создавайте потрясающие изображения с помощью искусственного интеллекта. Используйте Stable Diffusion и DALL-E 3, профессиональный редактор и готовые шаблоны для любых задач.',
  keywords: [
    'AI генерация изображений',
    'DALL-E 3',
    'Stable Diffusion',
    'редактор изображений',
    'шаблоны дизайна',
    'нейросеть',
    'генерация картинок',
    'AI art',
  ],
  authors: [{ name: 'AI Image Platform' }],
  creator: 'AI Image Platform',
  publisher: 'AI Image Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    title: 'AI Image Platform - Генерация и редактирование изображений',
    description: 'Создавайте потрясающие изображения с помощью искусственного интеллекта',
    siteName: 'AI Image Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Image Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Platform - Генерация и редактирование изображений',
    description: 'Создавайте потрясающие изображения с помощью искусственного интеллекта',
    images: ['/og-image.png'],
    creator: '@aiimageplatform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Preload критичных шрифтов */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnimatedBackground />
            <AuthSessionProvider>
              <ToastProvider>
                <Navbar />
                <main id="main-content" tabIndex={-1} className="relative z-10">
                  {children}
                </main>
              </ToastProvider>
            </AuthSessionProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
