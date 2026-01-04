import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { randomBytes } from 'crypto';
import { getServerBaseUrl } from '@/lib/base-url';

/**
 * PATCH: Включить/выключить публичный доступ к генерации
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: generationId } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Проверка, что генерация принадлежит пользователю
    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
      },
    });

    if (!generation) {
      return NextResponse.json(
        { error: 'Генерация не найдена' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const isPublic = body.isPublic ?? !generation.isPublic;

    // Генерация токена, если включаем публичный доступ
    let shareToken = generation.shareToken;
    if (isPublic && !shareToken) {
      shareToken = randomBytes(32).toString('hex');
    } else if (!isPublic) {
      shareToken = null;
    }

    const updated = await prisma.generation.update({
      where: { id: generationId },
      data: {
        isPublic,
        shareToken,
      },
    });

    const shareUrl = shareToken 
      ? `${getServerBaseUrl()}/share/${shareToken}`
      : null;

    return NextResponse.json({
      success: true,
      isPublic: updated.isPublic,
      shareToken: updated.shareToken,
      shareUrl,
      message: updated.isPublic 
        ? 'Публичный доступ включен' 
        : 'Публичный доступ выключен',
    });
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

