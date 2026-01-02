import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { upscaleImage } from '@/lib/ai/replicate';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageUrl, scale = 2, faceEnhance = false } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL изображения не указан' },
        { status: 400 }
      );
    }

    const result = await upscaleImage({
      imageUrl,
      scale: scale as 2 | 4,
      faceEnhance,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Ошибка улучшения изображения' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      enhancedImageUrl: result.imageUrl,
    });
  } catch (error) {
    console.error('Image enhancement error:', error);
    return NextResponse.json(
      { error: 'Ошибка улучшения изображения' },
      { status: 500 }
    );
  }
}

