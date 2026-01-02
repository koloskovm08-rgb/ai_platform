'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Избегаем гидратации SSR - ждём монтирования на клиенте
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // До монтирования используем светлую тему (совпадает с серверным рендером)
  const isDark = mounted && resolvedTheme === 'dark';

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* SVG Логотип с градиентом */}
      <svg
        className={cn('transition-all duration-300 hover:scale-110', sizeClasses[size])}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Градиент для светлой темы */}
          <linearGradient id="logoGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          
          {/* Градиент для тёмной темы */}
          <linearGradient id="logoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          
          {/* Эффект свечения */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Абстрактная форма - стилизованная волна/кристалл */}
        <path
          d="M32 8L48 16V32L32 40L16 32V16L32 8Z"
          fill={isDark ? 'url(#logoGradientDark)' : 'url(#logoGradientLight)'}
          filter="url(#glow)"
          className="transition-all duration-500"
        />
        <path
          d="M32 24L40 28V36L32 40L24 36V28L32 24Z"
          fill={isDark ? 'url(#logoGradientDark)' : 'url(#logoGradientLight)'}
          opacity="0.8"
        />
        <circle
          cx="32"
          cy="32"
          r="4"
          fill={isDark ? 'url(#logoGradientDark)' : 'url(#logoGradientLight)'}
          opacity="0.9"
        />
      </svg>
      
      {/* Текст логотипа */}
      {showText && (
        <span
          className={cn(
            'font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent transition-all duration-300',
            textSizeClasses[size]
          )}
        >
          ArtiGen
        </span>
      )}
    </div>
  );
}

