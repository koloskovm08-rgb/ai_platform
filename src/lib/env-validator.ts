/**
 * Валидация environment variables при старте приложения
 * Вызывается отдельно при необходимости (например, в middleware или API routes)
 */

import { checkRequiredEnv } from './env';

/**
 * Инициализация валидации env переменных
 * Вызывается один раз при старте сервера
 */
let envValidated = false;

export function validateEnvOnStartup(): void {
  if (envValidated) return;
  
  if (typeof window === 'undefined') {
    try {
      checkRequiredEnv();
      envValidated = true;
    } catch (error) {
      // В production ошибка валидации должна остановить деплой
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      // В development только предупреждаем
      console.warn('⚠️ Environment variables validation warning:', error);
    }
  }
}

