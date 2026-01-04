import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

/**
 * GET /api/social/connect
 * Возвращает список подключённых аккаунтов соцсетей.
 *
 * VK подключается через NextAuth OAuth (provider = 'vk').
 * Telegram подключаем через bot token (provider = 'telegram').
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        provider: { in: ['vk', 'telegram'] },
      },
      select: {
        provider: true,
        providerAccountId: true,
        scope: true,
      },
    });

    const vk = accounts.find(a => a.provider === 'vk');
    const telegram = accounts.filter(a => a.provider === 'telegram');

    return NextResponse.json({
      success: true,
      connections: {
        vk: vk
          ? {
              connected: true,
              vkUserId: vk.providerAccountId,
            }
          : { connected: false },
        telegram: telegram.map(a => ({
          connected: true,
          // chatId храним в поле scope, а providerAccountId делаем уникальным с userId (см. POST ниже)
          chatId: a.scope || null,
        })),
      },
    });
  } catch (error) {
    console.error('Social connect GET error:', error);
    return NextResponse.json({ error: 'Не удалось загрузить подключения' }, { status: 500 });
  }
}

const connectTelegramSchema = z.object({
  platform: z.literal('TELEGRAM'),
  botToken: z.string().min(10, 'botToken слишком короткий'),
  chatId: z.union([z.string().min(1), z.number()]),
});

/**
 * POST /api/social/connect
 * Подключение Telegram через bot token + chatId.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = connectTelegramSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const chatId = String(parsed.data.chatId);

    // В модели Account есть @@unique([provider, providerAccountId]).
    // Чтобы два пользователя могли подключить один и тот же chatId (например, общий канал),
    // делаем providerAccountId уникальным на уровне пользователя.
    const providerAccountId = `${session.user.id}:${chatId}`;

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'telegram',
          providerAccountId,
        },
      },
      create: {
        userId: session.user.id,
        type: 'telegram',
        provider: 'telegram',
        providerAccountId,
        access_token: parsed.data.botToken,
        scope: chatId,
      },
      update: {
        access_token: parsed.data.botToken,
        scope: chatId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Social connect POST error:', error);
    return NextResponse.json({ error: 'Не удалось подключить Telegram' }, { status: 500 });
  }
}


