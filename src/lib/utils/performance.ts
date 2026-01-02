/**
 * Утилиты для определения производительности устройства
 * и оптимизации для слабых ПК
 */

export interface DevicePerformance {
  isLowEnd: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
  connectionType?: string;
  score: number; // 0-100, где 0 - очень слабое устройство
}

/**
 * Определяет производительность устройства на основе доступных API
 */
export function detectDevicePerformance(): DevicePerformance {
  // Проверка на серверный рендеринг
  if (typeof window === 'undefined') {
    // Возвращаем значения по умолчанию для SSR
    return {
      isLowEnd: false,
      hardwareConcurrency: 4,
      score: 50,
    };
  }

  // Базовые значения
  let score = 50; // Средний балл по умолчанию
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
  const deviceMemory = nav.deviceMemory; // В GB, доступно не везде
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  // Оценка по количеству ядер CPU
  if (hardwareConcurrency >= 8) {
    score += 20;
  } else if (hardwareConcurrency >= 4) {
    score += 10;
  } else if (hardwareConcurrency <= 2) {
    score -= 20; // Слабое устройство
  }

  // Оценка по объему RAM (если доступно)
  if (deviceMemory) {
    if (deviceMemory >= 8) {
      score += 20;
    } else if (deviceMemory >= 4) {
      score += 10;
    } else if (deviceMemory <= 2) {
      score -= 20; // Мало памяти
    }
  }

  // Оценка по типу соединения (если доступно)
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === '4g') {
      score += 5;
    } else if (effectiveType === '3g' || effectiveType === '2g') {
      score -= 10; // Медленное соединение
    }
  }

  // Проверка на мобильное устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  if (isMobile) {
    score -= 10; // Мобильные устройства обычно слабее
  }

  // Проверка на старый браузер
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    const chromeVersion = parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || '0');
    if (chromeVersion < 90) {
      score -= 10; // Старый браузер
    }
  }

  // Нормализация score в диапазоне 0-100
  score = Math.max(0, Math.min(100, score));

  const isLowEnd = score < 40; // Устройство считается слабым если score < 40

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
  // Проверка системной настройки prefers-reduced-motion
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return true;
    }

    // Проверка производительности устройства
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
    return 10; // Минимум для слабых устройств
  }
  
  if (performance.score < 60) {
    return 20; // Средние устройства
  }
  
  if (performance.score < 80) {
    return 30; // Хорошие устройства
  }
  
  return 40; // Мощные устройства
}

/**
 * Определяет оптимальное количество градиентных орбов
 */
export function getOptimalOrbCount(): number {
  const performance = detectDevicePerformance();
  
  if (performance.isLowEnd) {
    return 0; // Отключить на слабых устройствах
  }
  
  if (performance.score < 60) {
    return 1; // Минимум
  }
  
  if (performance.score < 80) {
    return 2; // Средние устройства
  }
  
  return 4; // Мощные устройства
}

/**
 * Проверяет, можно ли безопасно загрузить тяжелый компонент (например, Fabric.js)
 */
export function canLoadHeavyComponent(): boolean {
  const performance = detectDevicePerformance();
  // Разрешаем загрузку если score >= 30
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

