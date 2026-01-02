/**
 * Конфигурация Cloudinary
 * 
 * Для использования:
 * 1. Зарегистрируйтесь на https://cloudinary.com
 * 2. Получите credentials в Dashboard
 * 3. Добавьте в .env:
 *    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 * 4. Установите: npm install cloudinary
 */

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

export const isCloudinaryConfigured = () => {
  return !!(
    cloudinaryConfig.cloudName &&
    cloudinaryConfig.apiKey &&
    cloudinaryConfig.apiSecret
  );
};

/**
 * Получить URL для загрузки в Cloudinary (browser)
 */
export function getCloudinaryUploadUrl() {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
}

/**
 * Получить upload preset (нужно создать в Cloudinary Dashboard)
 * Settings > Upload > Upload presets
 */
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

