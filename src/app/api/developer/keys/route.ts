import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

/**
 * Генерация API ключа
 */
function generateApiKey(): string {
  return `aip_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * GET /api/developer/keys
 * Получение всех API ключей пользователя
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        requestsLimit: true,
        requestsUsed: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Маскируем ключи (показываем только последние 8 символов)
    const maskedKeys = apiKeys.map((key) => ({
      ...key,
      key: `...${key.key.slice(-8)}`,
      keyFull: undefined, // Не отправляем полный ключ
    }));

    return NextResponse.json({
      success: true,
      apiKeys: maskedKeys,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить ключи' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/developer/keys
 * Создание нового API ключа
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, expiresInDays, requestsLimit } = body;

    if (!name || name.length < 3) {
      return NextResponse.json(
        { error: 'Название должно быть минимум 3 символа' },
        { status: 400 }
      );
    }

    // Проверяем лимит ключей (максимум 10 на пользователя)
    const existingKeysCount = await prisma.apiKey.count({
      where: { userId: session.user.id },
    });

    if (existingKeysCount >= 10) {
      return NextResponse.json(
        { error: 'Максимум 10 API ключей на пользователя' },
        { status: 400 }
      );
    }

    // Генерируем ключ
    const apiKey = generateApiKey();

    // Вычисляем срок действия
    let expiresAt: Date | undefined;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    // Создаём ключ
    const newKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name,
        key: apiKey,
        expiresAt,
        requestsLimit: requestsLimit || 1000,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'API ключ создан',
      apiKey: {
        id: newKey.id,
        name: newKey.name,
        key: apiKey, // ВАЖНО: показываем полный ключ только один раз!
        expiresAt: newKey.expiresAt,
        requestsLimit: newKey.requestsLimit,
        createdAt: newKey.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Не удалось создать ключ' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/developer/keys?id=xxx
 * Удаление API ключа
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'ID ключа не предоставлен' },
        { status: 400 }
      );
    }

    // Проверяем принадлежность ключа
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      select: { userId: true },
    });

    if (!apiKey || apiKey.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Ключ не найден' },
        { status: 404 }
      );
    }

    // Удаляем
    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json({
      success: true,
      message: 'Ключ удалён',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить ключ' },
      { status: 500 }
    );
  }
}

