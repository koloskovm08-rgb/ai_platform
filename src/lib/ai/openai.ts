import OpenAI from 'openai';

// Инициализация клиента OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface OpenAIGenerationParams {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  numOutputs?: number;
}

/**
 * Генерация изображения через DALL-E 3 (OpenAI)
 */
export async function generateWithDALLE3(params: OpenAIGenerationParams) {
  try {
    const {
      prompt,
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      numOutputs = 1,
    } = params;

    const images: string[] = [];

    // DALL-E 3 генерирует по одному изображению за раз
    for (let i = 0; i < numOutputs; i++) {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size,
        quality,
        style,
        n: 1,
      });

      if (response.data?.[0]?.url) {
        images.push(response.data[0].url);
      }
    }

    return {
      success: true,
      images,
      model: 'DALL_E_3',
    };
  } catch (error: unknown) {
    console.error('OpenAI generation error:', error);
    
    // Обработка специфичных ошибок OpenAI
    let errorMessage = 'Ошибка генерации';
    
    if (error && typeof error === 'object' && 'error' in error) {
      const openaiError = error as { error?: { message?: string } };
      if (openaiError.error?.message) {
        errorMessage = openaiError.error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Редактирование изображения через DALL-E (inpainting)
 */
export async function editImageWithDALLE(
  imagePath: string,
  maskPath: string,
  prompt: string,
  size: '1024x1024' | '512x512' | '256x256' = '1024x1024'
) {
  try {
    // В Node.js OpenAI SDK принимает File, Blob, Buffer или строку (URL/path)
    // Строки (URLs) поддерживаются, но типы SDK требуют File/Blob/Buffer
    // Используем приведение типов, так как строки работают в runtime
    const response = await openai.images.edit({
      image: imagePath as unknown as File,
      mask: maskPath as unknown as File,
      prompt,
      size,
      n: 1,
    });

    return {
      success: true,
      imageUrl: response.data?.[0]?.url || '',
    };
  } catch (error) {
    console.error('OpenAI edit error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка редактирования',
    };
  }
}

