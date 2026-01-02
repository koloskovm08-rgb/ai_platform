/**
 * Утилиты для загрузки в Cloudinary
 */

import { getCloudinaryUploadUrl, CLOUDINARY_UPLOAD_PRESET } from './config';

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Загрузить изображение в Cloudinary (browser-side)
 * Использует unsigned upload для безопасности
 */
export async function uploadToCloudinary(
  imageDataUrl: string,
  options?: {
    folder?: string;
    tags?: string[];
    context?: Record<string, string>;
  }
): Promise<CloudinaryUploadResult> {
  try {
    // Конвертируем data URL в Blob для более надежной загрузки
    const imageResponse = await fetch(imageDataUrl);
    const blob = await imageResponse.blob();
    
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Дополнительные параметры
    if (options?.folder) {
      formData.append('folder', options.folder);
    }
    if (options?.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }
    if (options?.context) {
      const contextStr = Object.entries(options.context)
        .map(([key, value]) => `${key}=${value}`)
        .join('|');
      formData.append('context', contextStr);
    }

    const response = await fetch(getCloudinaryUploadUrl(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Ошибка загрузки');
    }

    const data = await response.json();

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error: unknown) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Не удалось загрузить изображение',
    };
  }
}

/**
 * Загрузить из canvas напрямую
 */
export async function uploadCanvasToCloudinary(
  canvas: HTMLCanvasElement,
  options?: {
    folder?: string;
    tags?: string[];
    quality?: number;
  }
): Promise<CloudinaryUploadResult> {
  const dataUrl = canvas.toDataURL('image/png', options?.quality || 0.9);
  return uploadToCloudinary(dataUrl, options);
}

/**
 * Удалить изображение из Cloudinary (требуется server-side API)
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Ошибка удаления');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

