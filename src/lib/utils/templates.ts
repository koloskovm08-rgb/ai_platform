import { TemplateType } from '@prisma/client';

/**
 * Информация о типах шаблонов
 */
export const templateTypes = [
  {
    id: 'STICKER' as TemplateType,
    name: 'Стикеры',
    description: 'Стикеры для мессенджеров и соцсетей',
    emoji: '😊',
    sizes: ['512x512', '1024x1024'],
  },
  {
    id: 'BUSINESS_CARD' as TemplateType,
    name: 'Визитки',
    description: 'Бизнес-карточки и визитки',
    emoji: '💼',
    sizes: ['1050x600', '2100x1200'],
  },
  {
    id: 'LABEL' as TemplateType,
    name: 'Наклейки',
    description: 'Этикетки и наклейки для товаров',
    emoji: '🏷️',
    sizes: ['800x800', '1000x1000'],
  },
  {
    id: 'BANNER' as TemplateType,
    name: 'Баннеры',
    description: 'Баннеры для сайтов и рекламы',
    emoji: '📢',
    sizes: ['1200x628', '1920x1080'],
  },
  {
    id: 'PRODUCT_CARD' as TemplateType,
    name: 'Карточки товара',
    description: 'Карточки для интернет-магазинов',
    emoji: '🛍️',
    sizes: ['800x1000', '1000x1250'],
  },
  {
    id: 'SOCIAL_POST' as TemplateType,
    name: 'Посты для соцсетей',
    description: 'Instagram, Facebook, VK',
    emoji: '📱',
    sizes: ['1080x1080', '1080x1350'],
  },
  {
    id: 'FLYER' as TemplateType,
    name: 'Флаеры',
    description: 'Листовки и флаеры',
    emoji: '📄',
    sizes: ['1240x1754', 'A4'],
  },
  {
    id: 'OTHER' as TemplateType,
    name: 'Другое',
    description: 'Прочие шаблоны',
    emoji: '📋',
    sizes: ['custom'],
  },
];

/**
 * Категории шаблонов
 */
export const templateCategories = [
  { id: 'business', name: 'Бизнес', emoji: '💼' },
  { id: 'social', name: 'Соцсети', emoji: '📱' },
  { id: 'marketing', name: 'Маркетинг', emoji: '📢' },
  { id: 'ecommerce', name: 'E-commerce', emoji: '🛍️' },
  { id: 'events', name: 'События', emoji: '🎉' },
  { id: 'education', name: 'Образование', emoji: '📚' },
  { id: 'food', name: 'Еда', emoji: '🍔' },
  { id: 'fashion', name: 'Мода', emoji: '👗' },
  { id: 'tech', name: 'Технологии', emoji: '💻' },
  { id: 'creative', name: 'Креатив', emoji: '🎨' },
];

/**
 * Получить информацию о типе шаблона
 */
export function getTemplateTypeInfo(type: TemplateType) {
  return templateTypes.find((t) => t.id === type);
}

/**
 * Получить информацию о категории
 */
export function getTemplateCategoryInfo(categoryId: string) {
  return templateCategories.find((c) => c.id === categoryId);
}

/**
 * Примеры шаблонов (для демонстрации)
 */
export const sampleTemplates = [
  {
    type: 'BUSINESS_CARD' as TemplateType,
    category: 'business',
    name: 'Минималистичная визитка',
    description: 'Элегантная визитка в минималистичном стиле',
    config: {
      width: 1050,
      height: 600,
      backgroundColor: '#ffffff',
      elements: [
        {
          type: 'text',
          content: 'Иван Иванов',
          fontSize: 32,
          fontWeight: 'bold',
          color: '#000000',
          x: 50,
          y: 100,
        },
        {
          type: 'text',
          content: 'Web Developer',
          fontSize: 18,
          color: '#666666',
          x: 50,
          y: 150,
        },
        {
          type: 'text',
          content: '+7 (999) 123-45-67',
          fontSize: 14,
          color: '#333333',
          x: 50,
          y: 200,
        },
        {
          type: 'text',
          content: 'email@example.com',
          fontSize: 14,
          color: '#333333',
          x: 50,
          y: 230,
        },
      ],
    },
  },
  {
    type: 'SOCIAL_POST' as TemplateType,
    category: 'social',
    name: 'Пост для Instagram',
    description: 'Яркий шаблон для постов в Instagram',
    config: {
      width: 1080,
      height: 1080,
      backgroundColor: '#FF6B9D',
      elements: [
        {
          type: 'text',
          content: 'Заголовок поста',
          fontSize: 48,
          fontWeight: 'bold',
          color: '#ffffff',
          x: 540,
          y: 400,
          textAlign: 'center',
        },
        {
          type: 'text',
          content: 'Ваш текст здесь',
          fontSize: 24,
          color: '#ffffff',
          x: 540,
          y: 500,
          textAlign: 'center',
        },
      ],
    },
  },
  {
    type: 'PRODUCT_CARD' as TemplateType,
    category: 'ecommerce',
    name: 'Карточка товара',
    description: 'Стильная карточка для интернет-магазина',
    config: {
      width: 800,
      height: 1000,
      backgroundColor: '#f5f5f5',
      elements: [
        {
          type: 'rectangle',
          width: 760,
          height: 600,
          x: 20,
          y: 20,
          fill: '#ffffff',
        },
        {
          type: 'text',
          content: 'Название товара',
          fontSize: 28,
          fontWeight: 'bold',
          color: '#000000',
          x: 50,
          y: 650,
        },
        {
          type: 'text',
          content: '1 999 ₽',
          fontSize: 36,
          fontWeight: 'bold',
          color: '#2563eb',
          x: 50,
          y: 700,
        },
      ],
    },
  },
];

