/**
 * Клиент для работы с VK Cloud S3
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as generateSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Config, getS3PublicUrl, getS3Key } from './s3-config';

let s3Client: S3Client | null = null;

/**
 * Создать и настроить S3 клиент
 */
function getClient(): S3Client | null {
  const config = getS3Config();
  if (!config) {
    return null;
  }

  // Если клиент уже создан, возвращаем его
  if (s3Client) {
    return s3Client;
  }

  // Создаем новый клиент
  s3Client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // Для S3-совместимых хранилищ нужно указать forcePathStyle
    forcePathStyle: true,
  });

  return s3Client;
}

export interface S3UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Загрузить файл в S3
 */
export async function uploadToS3(
  buffer: Buffer,
  folder: string,
  filename: string,
  contentType: string
): Promise<S3UploadResult> {
  try {
    const client = getClient();
    const config = getS3Config();

    if (!client || !config) {
      return {
        success: false,
        error: 'S3 не настроен. Добавьте переменные окружения S3_*',
      };
    }

    const key = getS3Key(folder, filename);

    // Команда для загрузки файла
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Устанавливаем публичный доступ для чтения (если нужно)
      // ACL: 'public-read', // VK Cloud может не поддерживать ACL
    });

    await client.send(command);

    // Получаем публичный URL
    const url = getS3PublicUrl(config, key);

    return {
      success: true,
      url,
      key,
    };
  } catch (error: unknown) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка загрузки в S3',
    };
  }
}

/**
 * Удалить файл из S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const client = getClient();
    const config = getS3Config();

    if (!client || !config) {
      return false;
    }

    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
}

/**
 * Проверить существование файла в S3
 */
export async function checkFileExists(key: string): Promise<boolean> {
  try {
    const client = getClient();
    const config = getS3Config();

    if (!client || !config) {
      return false;
    }

    const command = new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error: unknown) {
    // Если файл не найден, AWS SDK вернет NotFound ошибку
    const awsError = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (awsError.name === 'NotFound' || awsError.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error('S3 check exists error:', error);
    return false;
  }
}

/**
 * Получить signed URL для доступа к файлу (для приватных bucket)
 * @param key - ключ файла в S3
 * @param expiresIn - время жизни URL в секундах (по умолчанию 1 час)
 * @returns signed URL или null если S3 не настроен
 */
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const client = getClient();
    const config = getS3Config();

    if (!client || !config) {
      return null;
    }

    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    // Генерируем signed URL с указанным временем жизни
    const signedUrl = await generateSignedUrl(client, command, { expiresIn });

    return signedUrl;
  } catch (error: unknown) {
    console.error('S3 get signed URL error:', error);
    return null;
  }
}

