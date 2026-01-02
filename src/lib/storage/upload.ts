/**
 * Утилиты для загрузки файлов в локальное хранилище
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Загрузить изображение через серверный API (browser-side)
 */
export async function uploadImage(
  imageDataUrl: string,
  options?: {
    folder?: 'avatars' | 'exports' | 'temp';
    filename?: string;
  }
): Promise<UploadResult> {
  try {
    // Конвертируем data URL в Blob
    const imageResponse = await fetch(imageDataUrl);
    const blob = await imageResponse.blob();

    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('file', blob, options?.filename || 'image.png');
    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    // Отправляем на сервер
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Ошибка загрузки');
    }

    return {
      success: true,
      url: result.url,
      filename: result.filename,
    };
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Не удалось загрузить изображение',
    };
  }
}

/**
 * Загрузить файл напрямую (File object)
 */
export async function uploadFile(
  file: File,
  options?: {
    folder?: 'avatars' | 'exports' | 'temp';
  }
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Ошибка загрузки');
    }

    return {
      success: true,
      url: result.url,
      filename: result.filename,
    };
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Не удалось загрузить файл',
    };
  }
}

/**
 * Загрузить canvas напрямую
 */
export async function uploadCanvas(
  canvas: HTMLCanvasElement,
  options?: {
    folder?: 'avatars' | 'exports' | 'temp';
    quality?: number;
    format?: 'png' | 'jpeg';
  }
): Promise<UploadResult> {
  const format = options?.format || 'png';
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dataUrl = canvas.toDataURL(mimeType, options?.quality || 0.9);
  return uploadImage(dataUrl, options);
}

