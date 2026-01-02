/**
 * Утилиты для работы с S3 URL
 */

/**
 * Проверяет, является ли URL S3 URL (VK Cloud)
 */
export function isS3Url(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('vkcs.cloud') || url.includes('hb.vkcs.cloud');
}

/**
 * Извлекает ключ (key) из S3 URL
 * Например: https://hb.vkcs.cloud/bucket-name/path/to/file.jpg -> path/to/file.jpg
 */
export function extractS3Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Если путь начинается с bucket-name, пропускаем его
    // Формат: /bucket-name/path/to/file.jpg
    if (pathParts.length > 1) {
      // Пропускаем первый элемент (bucket name) и объединяем остальные
      return pathParts.slice(1).join('/');
    }
    
    // Если формат другой, возвращаем весь путь без первого слеша
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}

/**
 * Преобразует S3 URL в путь к API endpoint для получения signed URL
 * Используется для приватных bucket
 */
export function getS3SignedUrlPath(url: string): string | null {
  const key = extractS3Key(url);
  if (!key) return null;
  
  return `/api/s3/signed-url?key=${encodeURIComponent(key)}`;
}

