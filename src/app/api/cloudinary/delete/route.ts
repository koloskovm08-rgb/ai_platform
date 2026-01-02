import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cloudinaryConfig } from '@/lib/cloudinary/config';

/**
 * DELETE /api/cloudinary/delete
 * Удаление изображения из Cloudinary
 * 
 * Требуется: npm install cloudinary
 */
export async function DELETE(req: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { error: 'PublicId не предоставлен' },
        { status: 400 }
      );
    }

    // Проверяем конфигурацию Cloudinary
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey || !cloudinaryConfig.apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary не настроен. Добавьте credentials в .env' },
        { status: 500 }
      );
    }

    // Динамический импорт cloudinary (только на сервере)
    const { v2: cloudinary } = await import('cloudinary');

    // Конфигурация
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });

    // Удаление
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error('Не удалось удалить изображение');
    }

    return NextResponse.json({
      success: true,
      message: 'Изображение удалено',
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка удаления' },
      { status: 500 }
    );
  }
}

