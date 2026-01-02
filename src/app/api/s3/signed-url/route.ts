import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSignedUrl } from '@/lib/storage/s3-client';
import { z } from 'zod';

/**
 * GET /api/s3/signed-url?key=path/to/file
 * Получить signed URL для доступа к файлу в S3 (для приватных bucket)
 * 
 * Требуется авторизация для безопасности
 */
export async function GET(req: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    // Получаем параметр key из query string
    const searchParams = req.nextUrl.searchParams;
    const key = searchParams.get('key');

    // Валидация
    const schema = z.string().min(1, 'Key обязателен');
    const validationResult = schema.safeParse(key);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Не указан параметр key' },
        { status: 400 }
      );
    }

    // Получаем signed URL
    const signedUrl = await getSignedUrl(validationResult.data, 3600); // 1 час

    if (!signedUrl) {
      return NextResponse.json(
        { error: 'Не удалось создать signed URL. Проверьте настройки S3.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Signed URL API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Не удалось создать signed URL',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

