import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toaster';
import { AuthSessionProvider } from '@/components/session-provider';
import { AnimatedBackground } from '@/components/animated-background';
import { Navbar } from '@/components/navbar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { DevToolsController } from '@/components/devtools-controller';
import { ClientErrorBoundary } from '@/components/client-error-boundary';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: false, // Отключаем preload, чтобы избежать ошибок 404
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
  variable: '--font-inter',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ArtiGen - Генерация и редактирование изображений с AI',
    template: '%s | ArtiGen',
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
    'ArtiGen',
  ],
  authors: [{ name: 'ArtiGen' }],
  creator: 'ArtiGen',
  publisher: 'ArtiGen',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    title: 'ArtiGen - Генерация и редактирование изображений с AI',
    description: 'Создавайте потрясающие изображения с помощью искусственного интеллекта',
    siteName: 'ArtiGen',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ArtiGen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArtiGen - Генерация и редактирование изображений с AI',
    description: 'Создавайте потрясающие изображения с помощью искусственного интеллекта',
    images: ['/og-image.png'],
    creator: '@artigen',
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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientErrorBoundary>
            <AnimatedBackground />
            <AuthSessionProvider>
              <DevToolsController />
              <ToastProvider>
                <Navbar />
                <main id="main-content" tabIndex={-1} className="relative z-10">
                  {children}
                </main>
              </ToastProvider>
            </AuthSessionProvider>
          </ClientErrorBoundary>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
