/**
 * Утилиты для мониторинга и оптимизации производительности
 */

import { useEffect, useRef } from 'react';
import { devLog } from './logger';

/**
 * Хук для измерения времени рендера компонента
 * Использовать только в development для отладки
 */
export function useRenderTime(componentName: string, enabled: boolean = process.env.NODE_ENV === 'development') {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);

  if (enabled) {
    startTime.current = performance.now();
    renderCount.current += 1;
  }

  useEffect(() => {
    if (enabled) {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      
      if (renderTime > 16) { // Больше 1 фрейма (60fps)
        devLog(
          `⚠️ [Performance] ${componentName} render #${renderCount.current} took ${renderTime.toFixed(2)}ms`
        );
      }
    }
  });
}

/**
 * Хук для отслеживания причин ререндера
 * Показывает, какие пропсы изменились и вызвали ререндер
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any> | undefined>(undefined);

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        devLog(`[WhyDidYouUpdate] ${name}`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * Измеряет производительность функции
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  warnThreshold: number = 100
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > warnThreshold) {
    devLog(`⚠️ [Performance] ${name} took ${duration.toFixed(2)}ms (threshold: ${warnThreshold}ms)`);
  }

  return result;
}

/**
 * Асинхронная версия measurePerformance
 */
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>,
  warnThreshold: number = 100
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > warnThreshold) {
    devLog(`⚠️ [Performance] ${name} took ${duration.toFixed(2)}ms (threshold: ${warnThreshold}ms)`);
  }

  return result;
}

/**
 * Debounce функция для оптимизации частых вызовов
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle функция для ограничения частоты вызовов
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Проверяет, поддерживает ли браузер определённую функцию
 */
export function checkBrowserSupport(): {
  webgl: boolean;
  webgl2: boolean;
  webworkers: boolean;
  offscreenCanvas: boolean;
  intersectionObserver: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      webgl: false,
      webgl2: false,
      webworkers: false,
      offscreenCanvas: false,
      intersectionObserver: false,
    };
  }

  const canvas = document.createElement('canvas');
  
  return {
    webgl: !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    webgl2: !!canvas.getContext('webgl2'),
    webworkers: typeof Worker !== 'undefined',
    offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    intersectionObserver: 'IntersectionObserver' in window,
  };
}

// Интерфейс для старой совместимости
export interface DevicePerformance {
  isLowEnd: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
  connectionType?: string;
  score: number;
}

/**
 * Определяет производительность устройства на основе доступных API
 */
export function detectDevicePerformance(): DevicePerformance {
  if (typeof window === 'undefined') {
    return {
      isLowEnd: false,
      hardwareConcurrency: 4,
      score: 50,
    };
  }

  let score = 50;
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  
  interface NavigatorWithMemory extends Navigator {
    deviceMemory?: number;
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
  interface NetworkInformation {
    effectiveType?: string;
    downlink?: number;
  }
  const nav = navigator as NavigatorWithMemory;
  const deviceMemory = nav.deviceMemory;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (hardwareConcurrency >= 8) {
    score += 20;
  } else if (hardwareConcurrency >= 4) {
    score += 10;
  } else if (hardwareConcurrency <= 2) {
    score -= 20;
  }

  if (deviceMemory) {
    if (deviceMemory >= 8) {
      score += 20;
    } else if (deviceMemory >= 4) {
      score += 10;
    } else if (deviceMemory <= 2) {
      score -= 20;
    }
  }

  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === '4g') {
      score += 5;
    } else if (effectiveType === '3g' || effectiveType === '2g') {
      score -= 10;
    }
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  if (isMobile) {
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));
  const isLowEnd = score < 40;

  return {
    isLowEnd,
    hardwareConcurrency,
    deviceMemory,
    connectionType: connection?.effectiveType,
    score,
  };
}

/**
 * Проверяет, нужно ли отключить анимации для данного устройства
 */
export function shouldDisableAnimations(): boolean {
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return true;
    }

    const performance = detectDevicePerformance();
    return performance.isLowEnd;
  }

  return false;
}

/**
 * Определяет оптимальное количество частиц для анимации
 */
export function getOptimalParticleCount(): number {
  const performance = detectDevicePerformance();
  
  if (performance.isLowEnd) {
    return 10;
  }
  
  if (performance.score < 60) {
    return 20;
  }
  
  if (performance.score < 80) {
    return 30;
  }
  
  return 40;
}

/**
 * Определяет оптимальное количество градиентных орбов
 */
export function getOptimalOrbCount(): number {
  const performance = detectDevicePerformance();
  
  if (performance.isLowEnd) {
    return 0;
  }
  
  if (performance.score < 60) {
    return 1;
  }
  
  if (performance.score < 80) {
    return 2;
  }
  
  return 4;
}

/**
 * Проверяет, можно ли безопасно загрузить тяжелый компонент
 */
export function canLoadHeavyComponent(): boolean {
  const performance = detectDevicePerformance();
  return performance.score >= 30;
}

/**
 * Получает сохраненную настройку пользователя для анимаций
 */
export function getAnimationPreference(): boolean | null {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem('disableAnimations');
  if (saved === null) return null;
  
  return saved === 'true';
}

/**
 * Сохраняет настройку пользователя для анимаций
 */
export function setAnimationPreference(disable: boolean): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('disableAnimations', disable.toString());
}

/**
 * Получает информацию о производительности устройства (новая версия)
 */
export function getDevicePerformance(): {
  memory?: number;
  cores?: number;
  connection?: string;
  devicePixelRatio: number;
  isMobile: boolean;
  isLowEnd: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      devicePixelRatio: 1,
      isMobile: false,
      isLowEnd: false,
    };
  }

  const perf = detectDevicePerformance();
  
  return {
    memory: perf.deviceMemory,
    cores: perf.hardwareConcurrency,
    connection: perf.connectionType,
    devicePixelRatio: window.devicePixelRatio || 1,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isLowEnd: perf.isLowEnd,
  };
}

/**
 * Lazy load изображения с placeholder
 */
export function lazyLoadImage(
  src: string,
  placeholder?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(src);
    img.onerror = reject;
    
    if (placeholder) {
      img.src = placeholder;
    }
    
    img.src = src;
  });
}

/**
 * Проверяет, виден ли элемент в viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Оптимизирует canvas для лучшей производительности
 */
export function optimizeCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Отключаем сглаживание для лучшей производительности
  ctx.imageSmoothingEnabled = false;
  
  // Используем hardware acceleration
  canvas.style.transform = 'translateZ(0)';
  canvas.style.willChange = 'transform';
}

/**
 * Рассчитывает оптимальный размер canvas на основе устройства
 */
export function getOptimalCanvasSize(
  desiredWidth: number,
  desiredHeight: number
): { width: number; height: number } {
  const { isLowEnd, devicePixelRatio } = getDevicePerformance();
  
  // На слабых устройствах уменьшаем разрешение
  const scale = isLowEnd ? 0.5 : Math.min(devicePixelRatio, 2);
  
  return {
    width: Math.floor(desiredWidth * scale),
    height: Math.floor(desiredHeight * scale),
  };
}
