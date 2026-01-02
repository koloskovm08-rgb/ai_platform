import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cloudinaryConfig } from '@/lib/cloudinary/config';

/**
 * POST /api/cloudinary/upload
 * Загрузка изображения в Cloudinary (server-side)
 * Использует signed upload для безопасности
 * 
 * Требуется: npm install cloudinary
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

    // Проверяем конфигурацию Cloudinary
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey || !cloudinaryConfig.apiSecret) {
      return NextResponse.json(
        { 
          error: 'Cloudinary не настроен. Добавьте в .env:\n' +
                 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name\n' +
                 'CLOUDINARY_API_KEY=your_api_key\n' +
                 'CLOUDINARY_API_SECRET=your_api_secret'
        },
        { status: 500 }
      );
    }

    // Получаем FormData из запроса
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не предоставлен' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Файл должен быть изображением' },
        { status: 400 }
      );
    }

    // Проверка размера (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Размер файла не должен превышать 5MB' },
        { status: 400 }
      );
    }

    // Конвертируем File в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Динамический импорт cloudinary (только на сервере)
    const { v2: cloudinary } = await import('cloudinary');

    // Конфигурация
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });

    // Загрузка в Cloudinary
    const uploadOptions = {
      resource_type: 'image' as const,
      folder: folder || 'avatars',
      tags: ['avatar', 'profile', `user-${session.user.id}`],
    };

    // Используем upload_stream для загрузки Buffer
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed: no result'));
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить изображение';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

