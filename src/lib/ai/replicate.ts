import Replicate from 'replicate';

// Инициализация клиента Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export interface ReplicateGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
  guidanceScale?: number;
  steps?: number;
  seed?: number;
}

/**
 * Генерация изображения через Stable Diffusion (Replicate)
 */
export async function generateWithStableDiffusion(
  params: ReplicateGenerationParams
) {
  try {
    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      numOutputs = 1,
      guidanceScale = 7.5,
      steps = 50,
      seed,
    } = params;

    // Используем Stable Diffusion XL
    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          width,
          height,
          num_outputs: numOutputs,
          guidance_scale: guidanceScale,
          num_inference_steps: steps,
          ...(seed && { seed }),
        },
      }
    );

    // Output — это массив URL изображений
    return {
      success: true,
      images: Array.isArray(output) ? output : [output],
      model: 'STABLE_DIFFUSION',
    };
  } catch (error) {
    console.error('Replicate generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка генерации',
    };
  }
}

/**
 * Проверка статуса генерации (для длительных операций)
 */
export async function checkReplicateStatus(predictionId: string) {
  try {
    const prediction = await replicate.predictions.get(predictionId);
    
    return {
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    };
  } catch (error) {
    console.error('Replicate status check error:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Ошибка проверки статуса',
    };
  }
}

export interface UpscaleParams {
  imageUrl: string;
  scale?: 2 | 4;
  faceEnhance?: boolean;
}

/**
 * Увеличение разрешения изображения (Upscale)
 */
export async function upscaleImage(params: UpscaleParams) {
  try {
    const { imageUrl, scale = 2, faceEnhance = false } = params;

    // Используем Real-ESRGAN для upscale
    const output = await replicate.run(
      'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7f7e5b4d5a6d33f2a3f8c8b8c8b8c8b',
      {
        input: {
          image: imageUrl,
          scale,
          face_enhance: faceEnhance,
        },
      }
    ).catch(async () => {
      // Fallback на другую модель, если первая не работает
      return await replicate.run(
        'stability-ai/stable-diffusion-x4-upscaler:42fed1c4974146d4d2414e2be2c5277c7f7e5b4d5a6d33f2a3f8c8b8c8b8c8b',
        {
          input: {
            image: imageUrl,
            prompt: 'high quality, detailed',
          },
        }
      );
    });

    return {
      success: true,
      imageUrl: Array.isArray(output) ? output[0] : output,
    };
  } catch (error) {
    console.error('Replicate upscale error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка увеличения разрешения',
    };
  }
}

export interface Img2ImgParams {
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  strength?: number; // 0-1, насколько сильно изменять изображение
  guidanceScale?: number;
  steps?: number;
  numOutputs?: number;
}

/**
 * Генерация вариаций изображения (img2img)
 */
export async function generateVariations(params: Img2ImgParams) {
  try {
    const {
      imageUrl,
      prompt,
      negativePrompt = '',
      strength = 0.7,
      guidanceScale = 7.5,
      steps = 50,
      numOutputs = 1,
    } = params;

    // Используем Stable Diffusion img2img
    const output = await replicate.run(
      'stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d',
      {
        input: {
          image: imageUrl,
          prompt,
          negative_prompt: negativePrompt,
          strength, // Насколько сильно изменять (0.0 = не изменять, 1.0 = полностью перегенерировать)
          guidance_scale: guidanceScale,
          num_inference_steps: steps,
          num_outputs: numOutputs,
        },
      }
    );

    return {
      success: true,
      images: Array.isArray(output) ? output : [output],
    };
  } catch (error) {
    console.error('Replicate img2img error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка генерации вариаций',
    };
  }
}

