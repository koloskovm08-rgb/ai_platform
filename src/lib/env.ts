/**
 * Валидация и проверка environment variables
 * Используется для проверки наличия обязательных переменных окружения
 */

import { z } from 'zod';

/**
 * Схема валидации для обязательных переменных окружения
 * В production все обязательные переменные должны быть установлены
 * В development некоторые могут отсутствовать (с fallback значениями)
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL должен быть валидным URL'),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL должен быть валидным URL').optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET должен быть минимум 32 символа').optional(),
  
  // AI Services
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY обязателен').optional(),
  REPLICATE_API_TOKEN: z.string().min(1, 'REPLICATE_API_TOKEN обязателен').optional(),
  
  // Payment (YooKassa) - опционально, если платежи не используются
  YOOKASSA_SHOP_ID: z.string().optional(),
  YOOKASSA_SECRET_KEY: z.string().optional(),
  
  // Storage (S3 или Cloudinary - хотя бы один должен быть настроен)
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
  
  // Public variables
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL должен быть валидным URL').optional(),
  
  // Optional
  CRON_SECRET: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Тип для валидированных переменных окружения
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Валидация переменных окружения
 * Выбрасывает ошибку, если обязательные переменные отсутствуют или невалидны
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(
        `Ошибка валидации environment variables:\n${missingVars.join('\n')}\n\n` +
        `Убедитесь, что все обязательные переменные установлены в Vercel Dashboard или .env файле.`
      );
    }
    throw error;
  }
}

/**
 * Безопасное получение переменной окружения с fallback
 */
export function getEnv(key: keyof Env, fallback?: string): string {
  const value = process.env[key];
  if (!value && fallback) {
    return fallback;
  }
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Проверка критических переменных окружения
 * Используется при старте приложения для предупреждения о проблемах
 */
export function checkRequiredEnv(): void {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ];

  const missing: string[] = [];
  const invalid: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else if (varName.includes('URL') && !value.startsWith('http')) {
      invalid.push(varName);
    }
  }

  if (missing.length > 0 || invalid.length > 0) {
    const errors: string[] = [];
    if (missing.length > 0) {
      errors.push(`Отсутствуют: ${missing.join(', ')}`);
    }
    if (invalid.length > 0) {
      errors.push(`Невалидные: ${invalid.join(', ')}`);
    }

    const message = `⚠️ Environment variables issues:\n${errors.join('\n')}\n\n` +
      `Убедитесь, что все переменные установлены в Vercel Dashboard.`;

    if (process.env.NODE_ENV === 'production') {
      // В production это критично
      console.error('❌', message);
      throw new Error(message);
    } else {
      // В development только предупреждаем
      console.warn('⚠️', message);
    }
  }
}

