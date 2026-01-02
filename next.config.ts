import type { NextConfig } from 'next';

// Bundle Analyzer - условная загрузка только при необходимости
// require() здесь безопасен, так как Next.js поддерживает CommonJS в конфиге
let withBundleAnalyzer: (config: NextConfig) => NextConfig = (config) => config;

if (process.env.ANALYZE === 'true') {
  // Динамическая загрузка bundle analyzer только когда нужен анализ
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bundleAnalyzer = require('@next/bundle-analyzer');
  withBundleAnalyzer = bundleAnalyzer({
    enabled: true,
  });
}

const nextConfig: NextConfig = {
  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'replicate.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.vkcs.cloud',
      },
      {
        protocol: 'https',
        hostname: 'vkcs.cloud',
      },
      {
        protocol: 'https',
        hostname: 'hb.vkcs.cloud',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Экспериментальные функции
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Ускорение компиляции в dev режиме
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Профилирование трассировки SWC (только в dev для отладки производительности)
    // Генерирует файлы swc-trace-profile-*.json в .next/ для анализа через Chrome DevTools
    swcTraceProfiling: process.env.NODE_ENV === 'development',
    
    // Другие доступные экспериментальные функции (закомментированы для безопасности):
    // 
    // afterStaticGeneration: true, // Оптимизация статической генерации (если доступно)
    // ppr: true, // Partial Prerendering - предварительный рендеринг частей страницы (если доступно)
    // turbo: {...}, // Turbopack конфигурация (если планируется использование)
  },

  // Оптимизация для dev-сервера
  onDemandEntries: {
    // Период в мс, в течение которого страница остаётся в памяти
    maxInactiveAge: 25 * 1000,
    // Количество страниц, которые должны храниться одновременно
    pagesBufferLength: 2,
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },

  // Редиректы
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites для API
  async rewrites() {
    return [
      {
        source: '/healthz',
        destination: '/api/health',
      },
    ];
  },

  // Настройки производительности
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false, // Отключаем source maps в продакшене

  // ESLint: проверяем ошибки при сборке для качества кода
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Webpack конфигурация
  webpack: (config, { isServer, dev }) => {
    // Игнорируем fs для клиентской части
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Исправление проблемы с кэшем и readlink на Windows (только для dev)
    // На Vercel (Linux) эта проблема не возникает
    // В production используем стандартные настройки webpack для оптимальной производительности
    if (dev && (process.platform === 'win32' || process.env.DISABLE_WEBPACK_CACHE === 'true')) {
      // Отключаем кэш только в dev режиме на Windows
      config.cache = false;
      config.resolve.symlinks = false;
      
      if (config.resolve) {
        config.resolve.unsafeCache = false;
        config.resolve.cache = false;
      }
      
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
        poll: false,
      };
      
      if (!config.resolveLoader) {
        config.resolveLoader = {};
      }
      config.resolveLoader.symlinks = false;
      config.resolveLoader.cache = false;
      
      if (config.module) {
        config.module.unsafeCache = false;
      }
    }

    // Оптимизация для продакшена
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }

    return config;
  },

  // Переменные окружения для клиента
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
};

export default withBundleAnalyzer(nextConfig);
