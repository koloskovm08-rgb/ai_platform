import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/social/schedule
 * Список запланированных публикаций (текущего пользователя).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const posts = await (prisma as any).socialMediaPost.findMany({
      where: {
        userId: session.user.id,
        status: 'SCHEDULED',
      },
      orderBy: { scheduledFor: 'asc' },
      take: 100,
      select: {
        id: true,
        platform: true,
        contentType: true,
        contentId: true,
        scheduledFor: true,
        imageUrl: true,
        caption: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Social schedule GET error:', error);
    return NextResponse.json({ error: 'Не удалось загрузить расписание' }, { status: 500 });
  }
}

/**
 * DELETE /api/social/schedule?id=...
 * Отмена запланированной публикации (только владелец).
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id обязателен' }, { status: 400 });
    }

    const existing = await (prisma as any).socialMediaPost.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Публикация не найдена' }, { status: 404 });
    }
    if (existing.status !== 'SCHEDULED') {
      return NextResponse.json({ error: 'Можно отменить только SCHEDULED публикации' }, { status: 400 });
    }

    await (prisma as any).socialMediaPost.update({
      where: { id },
      data: { status: 'CANCELED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Social schedule DELETE error:', error);
    return NextResponse.json({ error: 'Не удалось отменить публикацию' }, { status: 500 });
  }
}


