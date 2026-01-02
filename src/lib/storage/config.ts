/**
 * Конфигурация локального хранилища файлов
 * 
 * Файлы сохраняются в папке public/uploads
 * и доступны по URL /uploads/...
 */

import path from 'path';
import { existsSync, mkdirSync } from 'fs';

// Базовый путь для загрузок (относительно корня проекта)
const UPLOAD_BASE_PATH = path.join(process.cwd(), 'public', 'uploads');

// Пути для разных типов файлов
export const UPLOAD_PATHS = {
  avatars: path.join(UPLOAD_BASE_PATH, 'avatars'),
  exports: path.join(UPLOAD_BASE_PATH, 'exports'),
  temp: path.join(UPLOAD_BASE_PATH, 'temp'),
} as const;

// URL префикс для доступа к файлам
export const UPLOAD_URL_PREFIX = '/uploads';

// Максимальный размер файла (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Разрешенные типы файлов
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Создать необходимые директории, если их нет
 */
export function ensureUploadDirectories() {
  Object.values(UPLOAD_PATHS).forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Получить полный путь для сохранения файла
 */
export function getUploadPath(folder: keyof typeof UPLOAD_PATHS, filename: string): string {
  return path.join(UPLOAD_PATHS[folder], filename);
}

/**
 * Получить URL для доступа к файлу
 */
export function getUploadUrl(folder: keyof typeof UPLOAD_PATHS, filename: string): string {
  return `${UPLOAD_URL_PREFIX}/${folder}/${filename}`;
}

