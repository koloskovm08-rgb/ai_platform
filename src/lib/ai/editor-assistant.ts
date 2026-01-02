import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * AI предложения по макету визитки
 */
export interface LayoutSuggestion {
  layout: 'minimal' | 'modern' | 'classic' | 'creative' | 'corporate';
  description: string;
  elements: {
    position: { x: number; y: number };
    type: 'text' | 'image' | 'shape';
    content?: string;
    style?: Record<string, any>;
  }[];
  colorScheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export async function suggestLayouts(
  businessInfo: {
    name?: string;
    position?: string;
    industry?: string;
    style?: string;
  }
): Promise<LayoutSuggestion[]> {
  try {
    const prompt = `Ты профессиональный дизайнер визиток. Предложи 3 варианта макета визитки для:
Имя: ${businessInfo.name || 'не указано'}
Должность: ${businessInfo.position || 'не указано'}
Индустрия: ${businessInfo.industry || 'не указано'}
Стиль: ${businessInfo.style || 'современный'}

Верни JSON массив с 3 вариантами макетов. Каждый вариант должен содержать:
- layout: тип макета (minimal, modern, classic, creative, corporate)
- description: краткое описание макета
- elements: массив элементов с позициями (x, y в процентах от 0 до 100), типом и стилем
- colorScheme: цветовая схема с primary, secondary, background, text (hex цвета)

Формат ответа: JSON массив, только данные, без markdown.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Ты профессиональный дизайнер визиток. Отвечай только валидным JSON без markdown разметки.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Пустой ответ от AI');
    }

    // Парсим JSON из ответа (может быть обернут в markdown)
    let parsed;
    try {
      // Пытаемся найти JSON в ответе
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
    } catch {
      // Если не удалось распарсить, возвращаем дефолтные
      return getDefaultLayouts();
    }
    
    return Array.isArray(parsed) ? parsed : parsed.suggestions || parsed.layouts || [];
  } catch (error) {
    console.error('AI Layout suggestion error:', error);
    // Возвращаем дефолтные варианты при ошибке
    return getDefaultLayouts();
  }
}

/**
 * AI подбор цветовой палитры
 */
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  description: string;
}

export async function suggestColorPalette(
  context: {
    industry?: string;
    mood?: string;
    existingColors?: string[];
  }
): Promise<ColorPalette[]> {
  try {
    const prompt = `Ты профессиональный дизайнер. Предложи 3 цветовые палитры для визитки:
Индустрия: ${context.industry || 'не указано'}
Настроение: ${context.mood || 'профессиональное'}
Существующие цвета: ${context.existingColors?.join(', ') || 'нет'}

Верни JSON массив с 3 палитрами. Каждая палитра должна содержать:
- primary: основной цвет (hex)
- secondary: вторичный цвет (hex)
- accent: акцентный цвет (hex)
- background: цвет фона (hex)
- text: цвет текста (hex)
- description: описание палитры

Формат ответа: JSON массив, только данные, без markdown.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Ты профессиональный дизайнер. Отвечай только валидным JSON без markdown разметки.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Пустой ответ от AI');
    }

    // Парсим JSON из ответа
    let parsed;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
    } catch {
      return getDefaultColorPalettes();
    }
    
    return Array.isArray(parsed) ? parsed : parsed.palettes || parsed.colors || [];
  } catch (error) {
    console.error('AI Color palette error:', error);
    return getDefaultColorPalettes();
  }
}

/**
 * AI помощь с текстом
 */
export interface TextSuggestion {
  original: string;
  suggestions: {
    text: string;
    reason: string;
    style?: 'professional' | 'friendly' | 'formal' | 'creative';
  }[];
}

export async function suggestTextImprovements(
  text: string,
  context?: {
    purpose?: string;
    industry?: string;
    tone?: string;
  }
): Promise<TextSuggestion> {
  try {
    const prompt = `Ты профессиональный копирайтер. Улучши текст для визитки:
Оригинальный текст: "${text}"
Назначение: ${context?.purpose || 'визитка'}
Индустрия: ${context?.industry || 'не указано'}
Тон: ${context?.tone || 'профессиональный'}

Верни JSON объект с:
- original: оригинальный текст
- suggestions: массив из 3 вариантов улучшенного текста, каждый с полями:
  - text: улучшенный текст
  - reason: почему это лучше
  - style: стиль (professional, friendly, formal, creative)

Формат ответа: JSON объект, только данные, без markdown.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Ты профессиональный копирайтер. Отвечай только валидным JSON без markdown разметки.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Пустой ответ от AI');
    }

    // Парсим JSON из ответа
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch {
      return {
        original: text,
        suggestions: [
          {
            text: text,
            reason: 'Не удалось получить предложения от AI',
            style: 'professional' as const,
          },
        ],
      };
    }
  } catch (error) {
    console.error('AI Text suggestion error:', error);
    return {
      original: text,
      suggestions: [
        {
          text: text,
          reason: 'Не удалось получить предложения от AI',
          style: 'professional' as const,
        },
      ],
    };
  }
}

/**
 * Дефолтные макеты (fallback)
 */
function getDefaultLayouts(): LayoutSuggestion[] {
  return [
    {
      layout: 'minimal',
      description: 'Минималистичный макет с акцентом на типографику',
      elements: [
        {
          position: { x: 50, y: 30 },
          type: 'text',
          content: 'Имя',
          style: { fontSize: 28, fontWeight: 'bold' },
        },
        {
          position: { x: 50, y: 50 },
          type: 'text',
          content: 'Должность',
          style: { fontSize: 16 },
        },
        {
          position: { x: 50, y: 70 },
          type: 'text',
          content: 'Контакты',
          style: { fontSize: 12 },
        },
      ],
      colorScheme: {
        primary: '#000000',
        secondary: '#666666',
        background: '#FFFFFF',
        text: '#000000',
      },
    },
    {
      layout: 'modern',
      description: 'Современный макет с градиентами и акцентами',
      elements: [
        {
          position: { x: 20, y: 30 },
          type: 'shape',
          style: { width: 30, height: 30, fill: '#3b82f6' },
        },
        {
          position: { x: 50, y: 30 },
          type: 'text',
          content: 'Имя',
          style: { fontSize: 24, fontWeight: 'bold' },
        },
        {
          position: { x: 50, y: 50 },
          type: 'text',
          content: 'Должность',
          style: { fontSize: 14 },
        },
      ],
      colorScheme: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: '#FFFFFF',
        text: '#000000',
      },
    },
    {
      layout: 'classic',
      description: 'Классический макет с разделителями',
      elements: [
        {
          position: { x: 50, y: 25 },
          type: 'text',
          content: 'Имя',
          style: { fontSize: 26, fontWeight: 'bold' },
        },
        {
          position: { x: 50, y: 40 },
          type: 'shape',
          style: { width: 80, height: 2, fill: '#000000' },
        },
        {
          position: { x: 50, y: 55 },
          type: 'text',
          content: 'Должность',
          style: { fontSize: 14 },
        },
      ],
      colorScheme: {
        primary: '#000000',
        secondary: '#333333',
        background: '#FFFFFF',
        text: '#000000',
      },
    },
  ];
}

/**
 * Дефолтные цветовые палитры (fallback)
 */
function getDefaultColorPalettes(): ColorPalette[] {
  return [
    {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#FFFFFF',
      text: '#000000',
      description: 'Современная сине-фиолетовая палитра',
    },
    {
      primary: '#000000',
      secondary: '#666666',
      accent: '#f59e0b',
      background: '#FFFFFF',
      text: '#000000',
      description: 'Классическая черно-белая с акцентом',
    },
    {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#f59e0b',
      background: '#FFFFFF',
      text: '#000000',
      description: 'Свежая зеленая палитра',
    },
  ];
}

