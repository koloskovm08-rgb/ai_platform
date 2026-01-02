/**
 * Конфигурация для VK Cloud S3
 * 
 * VK Cloud предоставляет S3-совместимое хранилище, которое работает в России
 * 
 * Для настройки:
 * 1. Зарегистрируйтесь на https://mcs.mail.ru/
 * 2. Создайте Object Storage (S3)
 * 3. Создайте bucket
 * 4. Создайте Access Key и Secret Key в разделе "API ключи"
 * 5. Добавьте переменные окружения в .env.local
 */

export interface S3Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string; // Публичный URL для доступа к файлам (опционально)
}

/**
 * Получить конфигурацию S3 из переменных окружения
 */
export function getS3Config(): S3Config | null {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION || 'ru-msk';
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET;
  const publicUrl = process.env.S3_PUBLIC_URL;

  // Если не все обязательные параметры указаны, возвращаем null
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl,
  };
}

/**
 * Проверить, настроен ли S3
 */
export function isS3Configured(): boolean {
  return getS3Config() !== null;
}

/**
 * Получить публичный URL для файла
 * Если указан S3_PUBLIC_URL, используем его, иначе формируем из endpoint
 */
export function getS3PublicUrl(config: S3Config, key: string): string {
  if (config.publicUrl) {
    // Убираем trailing slash если есть
    const baseUrl = config.publicUrl.replace(/\/$/, '');
    return `${baseUrl}/${key}`;
  }

  // Формируем URL из endpoint (для VK Cloud обычно это https://hb.vkcs.cloud)
  // Публичный доступ должен быть настроен в bucket
  // Для VK Cloud публичный URL имеет формат: https://hb.vkcs.cloud/bucket-name/path/to/file
  // НЕ https://bucket-name.vkcs.cloud/path/to/file (это неправильно!)
  
  // Убираем протокол из endpoint
  let baseUrl = config.endpoint
    .replace(/^https?:\/\//, '') // Убираем протокол
    .replace(/^\/+/, '') // Убираем ведущие слеши
    .replace(/\/+$/, ''); // Убираем завершающие слеши
  
  // Убираем возможные двойные слеши в середине
  baseUrl = baseUrl.replace(/\/+/g, '/');
  
  // Формируем финальный URL в формате VK Cloud: https://hb.vkcs.cloud/bucket-name/path/to/file
  return `https://${baseUrl}/${config.bucket}/${key}`;
}

/**
 * Получить ключ (путь) для файла в S3
 */
export function getS3Key(folder: string, filename: string): string {
  return `${folder}/${filename}`;
}

