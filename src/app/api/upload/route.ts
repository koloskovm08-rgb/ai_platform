import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import {
  ensureUploadDirectories,
  getUploadPath,
  getUploadUrl,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  type UPLOAD_PATHS,
} from '@/lib/storage/config';
import { isS3Configured } from '@/lib/storage/s3-config';
import { uploadToS3 } from '@/lib/storage/s3-client';

/**
 * POST /api/upload
 * Загрузка файла в хранилище (S3 или локальное)
 * 
 * Если настроен S3 (переменные окружения S3_*), используется S3
 * Иначе используется локальное хранилище (public/uploads)
 */
export async function POST(req: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    // Получаем FormData из запроса
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folderParam = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не предоставлен' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return NextResponse.json(
        { error: 'Файл должен быть изображением (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // Проверка размера
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Размер файла не должен превышать ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Конвертируем File в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Определяем папку для сохранения
    const folder = folderParam || 'temp';
    
    // Генерируем уникальное имя файла
    const fileExtension = path.extname(file.name) || '.png';
    const uniqueFilename = `${randomBytes(16).toString('hex')}${fileExtension}`;

    // Если S3 настроен, используем его
    if (isS3Configured()) {
      const result = await uploadToS3(
        buffer,
        folder,
        uniqueFilename,
        file.type
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Ошибка загрузки в S3' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        filename: uniqueFilename,
        storage: 's3',
      });
    }

    // Иначе используем локальное хранилище
    // Создаем директории, если их нет
    ensureUploadDirectories();

    // Получаем путь для сохранения
    const filePath = getUploadPath(folder as keyof typeof UPLOAD_PATHS, uniqueFilename);

    // Сохраняем файл
    await writeFile(filePath, buffer);

    // Получаем URL для доступа к файлу
    const url = getUploadUrl(folder as keyof typeof UPLOAD_PATHS, uniqueFilename);

    return NextResponse.json({
      success: true,
      url,
      filename: uniqueFilename,
      storage: 'local',
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить файл';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

