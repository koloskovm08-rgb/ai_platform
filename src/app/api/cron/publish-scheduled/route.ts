import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { publishToVKWall } from '@/lib/social/vk-client';
import { telegramSendPhoto } from '@/lib/social/telegram-client';
import { formatForTelegram, formatForVK } from '@/lib/social/formatters';

async function getVkAccessToken(userId: string): Promise<string | null> {
  const acc = await prisma.account.findFirst({
    where: { userId, provider: 'vk' },
    select: { access_token: true },
  });
  return acc?.access_token ?? null;
}

async function getTelegramBotTokenByChatId(userId: string, chatId: string): Promise<string | null> {
  const providerAccountId = `${userId}:${chatId}`;
  const acc = await prisma.account.findFirst({
    where: { userId, provider: 'telegram', providerAccountId },
    select: { access_token: true },
  });
  return acc?.access_token ?? null;
}

/**
 * GET /api/cron/publish-scheduled
 * Публикует все SCHEDULED посты, у которых scheduledFor <= now.
 *
 * - В development: без авторизации
 * - В production: требуется CRON_SECRET в заголовке Authorization (Bearer ...)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();

    const due = await (prisma as any).socialMediaPost.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: { lte: now },
      },
      orderBy: { scheduledFor: 'asc' },
      take: 50,
      select: {
        id: true,
        userId: true,
        platform: true,
        imageUrl: true,
        caption: true,
        metadata: true,
      },
    });

    let published = 0;
    let failed = 0;

    for (const post of due) {
      await (prisma as any).socialMediaPost.update({
        where: { id: post.id },
        data: { status: 'PUBLISHING' },
      });

      try {
        if (post.platform === 'VK') {
          const accessToken = await getVkAccessToken(post.userId);
          if (!accessToken) throw new Error('Missing VK access_token');

          const groupId = post.metadata?.groupId;
          if (!groupId || typeof groupId !== 'number') {
            throw new Error('Missing metadata.groupId for VK scheduled post');
          }

          const formatted = formatForVK({ imageUrl: post.imageUrl, caption: post.caption });
          const result = await publishToVKWall({
            accessToken,
            target: { type: 'group', groupId },
            message: formatted.caption,
            imageUrl: formatted.imageUrl,
            fromGroup: post.metadata?.fromGroup ?? true,
          });

          await (prisma as any).socialMediaPost.update({
            where: { id: post.id },
            data: {
              status: 'PUBLISHED',
              publishedAt: new Date(),
              externalId: String(result.postId),
              error: null,
            },
          });

          published++;
          continue;
        }

        // TELEGRAM
        const chatId = post.metadata?.chatId;
        if (!chatId || typeof chatId !== 'string') {
          throw new Error('Missing metadata.chatId for Telegram scheduled post');
        }
        const botToken = await getTelegramBotTokenByChatId(post.userId, chatId);
        if (!botToken) throw new Error('Missing Telegram bot token');

        const formatted = formatForTelegram({ imageUrl: post.imageUrl, caption: post.caption });
        const result = await telegramSendPhoto({
          botToken,
          chatId,
          imageUrl: formatted.imageUrl!,
          caption: formatted.caption,
        });

        await (prisma as any).socialMediaPost.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            externalId: String(result.messageId),
            error: null,
          },
        });

        published++;
      } catch (e) {
        failed++;
        const message = e instanceof Error ? e.message : String(e);
        await (prisma as any).socialMediaPost.update({
          where: { id: post.id },
          data: { status: 'FAILED', error: message },
        });
      }
    }

    return NextResponse.json({
      success: true,
      checked: due.length,
      published,
      failed,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Cron publish-scheduled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


