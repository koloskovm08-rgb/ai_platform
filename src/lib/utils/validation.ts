import { z } from 'zod';

// Схемы валидации для различных форм

export const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно быть минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

export const generateImageSchema = z.object({
  prompt: z.string().min(3, 'Промпт должен быть минимум 3 символа'),
  negativePrompt: z.string().optional(),
  model: z.enum(['STABLE_DIFFUSION', 'DALL_E_3', 'MIDJOURNEY']).default('STABLE_DIFFUSION'),
  width: z.number().int().min(256).max(4096).default(1024),
  height: z.number().int().min(256).max(4096).default(1024),
  numOutputs: z.number().int().min(1).max(4).default(1),
  guidanceScale: z.number().min(1).max(20).default(7.5),
  steps: z.number().int().min(1).max(150).default(50),
});

export const createTemplateSchema = z.object({
  name: z.string().min(2, 'Название должно быть минимум 2 символа'),
  description: z.string().optional(),
  type: z.enum([
    'STICKER',
    'BUSINESS_CARD',
    'LABEL',
    'BANNER',
    'PRODUCT_CARD',
    'SOCIAL_POST',
    'FLYER',
    'OTHER',
  ]),
  category: z.string().optional(),
  previewUrl: z.string().url('Некорректный URL'),
  thumbnailUrl: z.string().url('Некорректный URL').optional(),
  config: z.record(z.any()),
  isPremium: z.boolean().default(false),
  isPublic: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateImageInput = z.infer<typeof generateImageSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

