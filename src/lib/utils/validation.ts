/**
 * Валидация данных для редактора визиток
 */

import { z } from 'zod';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Валидация размеров визитки
 */
export function validateCardSize(
  width: number,
  height: number
): ValidationResult {
  const errors: string[] = [];

  if (width < 50 || width > 200) {
    errors.push('Ширина должна быть от 50 до 200 мм');
  }

  if (height < 50 || height > 200) {
    errors.push('Высота должна быть от 50 до 200 мм');
  }

  if (width / height > 2 || height / width > 2) {
    errors.push('Соотношение сторон не должно превышать 2:1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Валидация имени проекта
 */
export function validateProjectName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Название проекта не может быть пустым');
  }

  if (name.length > 100) {
    errors.push('Название проекта не должно превышать 100 символов');
  }

  // Проверка на недопустимые символы
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    errors.push('Название проекта содержит недопустимые символы');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Валидация email
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email) {
    return { valid: true, errors: [] };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Некорректный формат email');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Валидация URL
 */
export function validateURL(url: string): ValidationResult {
  const errors: string[] = [];

  if (!url) {
    return { valid: true, errors: [] };
  }

  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    errors.push('Некорректный формат URL');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Валидация телефона
 */
export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = [];

  if (!phone) {
    return { valid: true, errors: [] };
  }

  // Удаляем все нецифровые символы для проверки
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    errors.push('Телефон должен содержать от 10 до 15 цифр');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Валидация canvas данных
 */
export function validateCanvasData(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data) {
    errors.push('Данные canvas отсутствуют');
    return { valid: false, errors };
  }

  if (typeof data !== 'object') {
    errors.push('Данные canvas должны быть объектом');
  }

  if (!Array.isArray(data.objects)) {
    errors.push('Данные canvas должны содержать массив объектов');
  }

  // Проверка размера данных (не более 10MB)
  const dataSize = JSON.stringify(data).length;
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (dataSize > maxSize) {
    errors.push('Размер данных canvas превышает 10MB');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Схема валидации для генерации изображений
 */
export const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Промпт не может быть пустым').max(1000, 'Промпт слишком длинный'),
  negativePrompt: z.string().max(1000, 'Негативный промпт слишком длинный').optional(),
  model: z.enum(['STABLE_DIFFUSION', 'DALL_E_3', 'MIDJOURNEY']).default('STABLE_DIFFUSION'),
  width: z.number().int().min(256).max(2048).default(1024),
  height: z.number().int().min(256).max(2048).default(1024),
  numOutputs: z.number().int().min(1).max(4).default(1),
  guidanceScale: z.number().min(1).max(20).default(7.5).optional(),
  steps: z.number().int().min(10).max(150).default(50).optional(),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;

/**
 * Схема валидации для создания шаблона
 */
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Название не может быть пустым').max(100, 'Название слишком длинное'),
  description: z.string().max(500, 'Описание слишком длинное').optional(),
  type: z.enum(['STICKER', 'BUSINESS_CARD', 'LABEL', 'BANNER', 'PRODUCT_CARD', 'SOCIAL_POST', 'FLYER', 'OTHER']),
  category: z.string().max(50).optional(),
  previewUrl: z.string().url('Некорректный URL превью'),
  thumbnailUrl: z.string().url('Некорректный URL миниатюры').optional(),
  config: z.any(), // JSON конфигурация
  isPremium: z.boolean().default(false),
  isPublic: z.boolean().default(true),
});
