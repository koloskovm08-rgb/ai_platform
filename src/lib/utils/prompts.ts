/**
 * Библиотека промптов и стилей для генерации изображений
 */

export interface PromptPreset {
  id: string;
  name: string;
  category: string;
  prompt: string;
  negativePrompt?: string;
  description: string;
  preview?: string;
}

export const promptStyles = [
  {
    id: 'realistic',
    name: 'Реалистичный',
    suffix: ', realistic, photorealistic, highly detailed, 8k uhd, high quality',
    negativePrompt: 'cartoon, anime, painting, drawing, illustration, lowres, bad anatomy',
  },
  {
    id: 'anime',
    name: 'Аниме',
    suffix: ', anime style, manga, cel shaded, vibrant colors',
    negativePrompt: 'realistic, photo, 3d render, lowres',
  },
  {
    id: 'digital-art',
    name: 'Цифровое искусство',
    suffix: ', digital art, concept art, trending on artstation, highly detailed',
    negativePrompt: 'photo, realistic, lowres, blurry',
  },
  {
    id: 'oil-painting',
    name: 'Масляная живопись',
    suffix: ', oil painting, brush strokes, canvas texture, classical art',
    negativePrompt: 'photo, digital, 3d, lowres',
  },
  {
    id: 'watercolor',
    name: 'Акварель',
    suffix: ', watercolor painting, soft colors, artistic',
    negativePrompt: 'photo, digital, 3d, lowres',
  },
  {
    id: '3d-render',
    name: '3D рендер',
    suffix: ', 3d render, octane render, unreal engine, highly detailed',
    negativePrompt: 'photo, 2d, flat, lowres',
  },
  {
    id: 'cyberpunk',
    name: 'Киберпанк',
    suffix: ', cyberpunk style, neon lights, futuristic, dystopian',
    negativePrompt: 'medieval, fantasy, nature, lowres',
  },
  {
    id: 'fantasy',
    name: 'Фэнтези',
    suffix: ', fantasy art, magical, ethereal, enchanted',
    negativePrompt: 'modern, realistic, lowres',
  },
];

export const promptPresets: PromptPreset[] = [
  // Пейзажи
  {
    id: 'sunset-mountains',
    name: 'Горы на закате',
    category: 'Пейзажи',
    prompt: 'Majestic mountains at sunset with dramatic clouds and golden light',
    description: 'Величественные горы на закате с драматичными облаками',
  },
  {
    id: 'ocean-waves',
    name: 'Океанские волны',
    category: 'Пейзажи',
    prompt: 'Powerful ocean waves crashing on rocky shore, dramatic seascape',
    description: 'Мощные океанские волны на скалистом берегу',
  },
  {
    id: 'forest-path',
    name: 'Лесная тропа',
    category: 'Пейзажи',
    prompt: 'Mystical forest path with sunbeams through trees, magical atmosphere',
    description: 'Мистическая лесная тропа с лучами солнца',
  },

  // Портреты
  {
    id: 'cyberpunk-character',
    name: 'Киберпанк персонаж',
    category: 'Портреты',
    prompt: 'Cyberpunk character with neon lights, futuristic fashion, portrait',
    description: 'Персонаж в стиле киберпанк с неоновым освещением',
  },
  {
    id: 'fantasy-warrior',
    name: 'Фэнтези воин',
    category: 'Портреты',
    prompt: 'Epic fantasy warrior in ornate armor, heroic pose, detailed',
    description: 'Эпичный воин в богатой броне',
  },
  {
    id: 'elegant-portrait',
    name: 'Элегантный портрет',
    category: 'Портреты',
    prompt: 'Elegant portrait, soft lighting, professional photography',
    description: 'Элегантный портрет с мягким освещением',
  },

  // Животные
  {
    id: 'majestic-lion',
    name: 'Величественный лев',
    category: 'Животные',
    prompt: 'Majestic lion with flowing mane, golden hour lighting, wildlife photography',
    description: 'Величественный лев с развевающейся гривой',
  },
  {
    id: 'cute-cat',
    name: 'Милый кот',
    category: 'Животные',
    prompt: 'Adorable fluffy cat, big eyes, soft fur, cute and cozy',
    description: 'Очаровательный пушистый кот с большими глазами',
  },

  // Архитектура
  {
    id: 'futuristic-city',
    name: 'Город будущего',
    category: 'Архитектура',
    prompt: 'Futuristic city skyline with flying cars, neon lights, sci-fi',
    description: 'Футуристический город с летающими машинами',
  },
  {
    id: 'ancient-temple',
    name: 'Древний храм',
    category: 'Архитектура',
    prompt: 'Ancient temple ruins overgrown with vines, mystical atmosphere',
    description: 'Древние руины храма, заросшие лианами',
  },

  // Абстракция
  {
    id: 'colorful-abstract',
    name: 'Цветная абстракция',
    category: 'Абстракция',
    prompt: 'Vibrant colorful abstract art, flowing shapes, modern',
    description: 'Яркая цветная абстракция с плавными формами',
  },
  {
    id: 'geometric-patterns',
    name: 'Геометрические узоры',
    category: 'Абстракция',
    prompt: 'Complex geometric patterns, mathematical art, symmetrical',
    description: 'Сложные геометрические узоры',
  },
];

/**
 * Улучшить промпт с помощью стиля
 */
export function enhancePrompt(
  prompt: string,
  styleId?: string
): { prompt: string; negativePrompt: string } {
  if (!styleId) {
    return { prompt, negativePrompt: '' };
  }

  const style = promptStyles.find((s) => s.id === styleId);
  
  if (!style) {
    return { prompt, negativePrompt: '' };
  }

  return {
    prompt: prompt + style.suffix,
    negativePrompt: style.negativePrompt || '',
  };
}

/**
 * Получить промпт по категории
 */
export function getPresetsByCategory(category: string) {
  return promptPresets.filter((preset) => preset.category === category);
}

/**
 * Получить все категории
 */
export function getCategories() {
  const categories = new Set(promptPresets.map((p) => p.category));
  return Array.from(categories);
}

