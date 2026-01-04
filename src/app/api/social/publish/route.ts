import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { formatForTelegram, formatForVK } from '@/lib/social/formatters';
import { publishToVKWall } from '@/lib/social/vk-client';
import { telegramSendPhoto } from '@/lib/social/telegram-client';

const publishSchema = z.object({
  platform: z.enum(['VK', 'TELEGRAM']),
  contentType: z.enum(['GENERATION', 'EDIT', 'BUSINESS_CARD_PROJECT']),
  contentId: z.string().min(1),

  // Можно переопределить, но по умолчанию берём из контента в БД
  imageUrl: z.string().url().optional(),
  caption: z.string().optional(),

  // Если указано и дата в будущем — создаём SCHEDULED и не публикуем сразу
  scheduleFor: z.string().datetime().optional(),

  vk: z
    .object({
      groupId: z.number().int().positive(),
      fromGroup: z.boolean().optional().default(true),
    })
    .optional(),

  telegram: z
    .object({
      chatId: z.union([z.string().min(1), z.number()]).optional(),
    })
    .optional(),
});

function asDateOrNull(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function getContentImageUrl(params: {
  userId: string;
  contentType: 'GENERATION' | 'EDIT' | 'BUSINESS_CARD_PROJECT';
  contentId: string;
}): Promise<string | null> {
  if (params.contentType === 'GENERATION') {
    const gen = await prisma.generation.findFirst({
      where: { id: params.contentId, userId: params.userId },
      select: { imageUrl: true },
    });
    return gen?.imageUrl ?? null;
  }

  if (params.contentType === 'EDIT') {
    const edit = await prisma.edit.findFirst({
      where: { id: params.contentId, userId: params.userId },
      select: { editedImageUrl: true },
    });
    return edit?.editedImageUrl ?? null;
  }

  const project = await prisma.businessCardProject.findFirst({
    where: { id: params.contentId, userId: params.userId },
    select: { thumbnailUrl: true },
  });
  return project?.thumbnailUrl ?? null;
}

async function getVkAccessToken(userId: string): Promise<string | null> {
  const acc = await prisma.account.findFirst({
    where: { userId, provider: 'vk' },
    select: { access_token: true },
  });
  return acc?.access_token ?? null;
}

async function getTelegramBotTokenAndChatId(params: {
  userId: string;
  chatId?: string | number;
}): Promise<{ botToken: string; chatId: string } | null> {
  // Если chatId не указали — пытаемся взять единственное подключение
  if (!params.chatId) {
    const accounts = await prisma.account.findMany({
      where: { userId: params.userId, provider: 'telegram' },
      select: { access_token: true, scope: true },
      take: 2,
    });

    if (accounts.length !== 1) return null;
    const botToken = accounts[0]?.access_token;
    const chatId = accounts[0]?.scope;
    if (!botToken || !chatId) return null;
    return { botToken, chatId };
  }

  const chatIdStr = String(params.chatId);
  const providerAccountId = `${params.userId}:${chatIdStr}`;
  const acc = await prisma.account.findFirst({
    where: { userId: params.userId, provider: 'telegram', providerAccountId },
    select: { access_token: true, scope: true },
  });

  if (!acc?.access_token || !acc.scope) return null;
  return { botToken: acc.access_token, chatId: acc.scope };
}

/**
 * POST /api/social/publish
 * Публикация контента (сразу или по расписанию).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = publishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Некорректные данные', details: parsed.error.issues }, { status: 400 });
    }

    const { platform, contentType, contentId } = parsed.data;
    const scheduledFor = asDateOrNull(parsed.data.scheduleFor || undefined);

    const derivedImageUrl = await getContentImageUrl({
      userId: session.user.id,
      contentType,
      contentId,
    });

    const imageUrl = parsed.data.imageUrl ?? derivedImageUrl ?? undefined;
    if (!imageUrl) {
      return NextResponse.json({ error: 'Не удалось определить imageUrl для публикации' }, { status: 400 });
    }

    // Планирование (только будущее)
    if (scheduledFor && scheduledFor.getTime() > Date.now()) {
      // Важно: для cron нам нужно помнить куда публиковать (groupId/chatId)
      let metadata: Record<string, unknown> | undefined;
      if (platform === 'VK') {
        if (!parsed.data.vk?.groupId) {
          return NextResponse.json(
            { error: 'Для VK публикации в группу требуется vk.groupId' },
            { status: 400 }
          );
        }
        metadata = {
          groupId: parsed.data.vk.groupId,
          fromGroup: parsed.data.vk.fromGroup ?? true,
        };
      }

      if (platform === 'TELEGRAM') {
        const tg = await getTelegramBotTokenAndChatId({
          userId: session.user.id,
          chatId: parsed.data.telegram?.chatId,
        });
        if (!tg) {
          return NextResponse.json(
            { error: 'Telegram не подключён (или не указан chatId при нескольких подключениях)' },
            { status: 400 }
          );
        }
        metadata = { chatId: tg.chatId };
      }

      const created = await (prisma as any).socialMediaPost.create({
        data: {
          userId: session.user.id,
          contentId,
          contentType,
          platform,
          status: 'SCHEDULED',
          imageUrl,
          caption: parsed.data.caption ?? null,
          scheduledFor,
          metadata,
        },
        select: { id: true, status: true, scheduledFor: true },
      });

      return NextResponse.json({ success: true, scheduled: true, post: created });
    }

    // Сразу публикуем
    const post = await (prisma as any).socialMediaPost.create({
      data: {
        userId: session.user.id,
        contentId,
        contentType,
        platform,
        status: 'PUBLISHING',
        imageUrl,
        caption: parsed.data.caption ?? null,
      },
      select: { id: true },
    });

    try {
      if (platform === 'VK') {
        if (!parsed.data.vk?.groupId) {
          throw new Error('Для VK публикации в группу требуется vk.groupId');
        }

        const accessToken = await getVkAccessToken(session.user.id);
        if (!accessToken) {
          throw new Error('VK аккаунт не подключён или нет access_token (перелогиньтесь через VK)');
        }

        const formatted = formatForVK({ imageUrl, caption: parsed.data.caption ?? null });
        const result = await publishToVKWall({
          accessToken,
          target: { type: 'group', groupId: parsed.data.vk.groupId },
          message: formatted.caption,
          imageUrl: formatted.imageUrl,
          fromGroup: parsed.data.vk.fromGroup ?? true,
        });

        await (prisma as any).socialMediaPost.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            externalId: String(result.postId),
            metadata: { attachments: result.attachments, groupId: parsed.data.vk.groupId },
            error: null,
          },
        });

        return NextResponse.json({ success: true, postId: post.id, externalId: String(result.postId) });
      }

      // TELEGRAM
      const tg = await getTelegramBotTokenAndChatId({
        userId: session.user.id,
        chatId: parsed.data.telegram?.chatId,
      });
      if (!tg) {
        throw new Error('Telegram не подключён (или не указан chatId при нескольких подключениях)');
      }

      const formatted = formatForTelegram({ imageUrl, caption: parsed.data.caption ?? null });
      const result = await telegramSendPhoto({
        botToken: tg.botToken,
        chatId: tg.chatId,
        imageUrl: formatted.imageUrl!,
        caption: formatted.caption,
      });

      await (prisma as any).socialMediaPost.update({
        where: { id: post.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          externalId: String(result.messageId),
          metadata: { chatId: tg.chatId },
          error: null,
        },
      });

      return NextResponse.json({ success: true, postId: post.id, externalId: String(result.messageId) });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await (prisma as any).socialMediaPost.update({
        where: { id: post.id },
        data: { status: 'FAILED', error: message },
      });
      return NextResponse.json({ error: 'Не удалось опубликовать', details: message }, { status: 500 });
    }
  } catch (error) {
    console.error('Social publish error:', error);
    return NextResponse.json({ error: 'Не удалось обработать запрос публикации' }, { status: 500 });
  }
}


