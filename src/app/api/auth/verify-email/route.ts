import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/email/send-verification';

/**
 * GET /api/auth/verify-email?token=xxx
 * Подтверждение email адреса пользователя
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Токен не предоставлен' },
        { status: 400 }
      );
    }

    // Проверяем токен
    const email = await verifyToken(token);

    if (!email) {
      return NextResponse.json(
        { error: 'Недействительный или истекший токен' },
        { status: 400 }
      );
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем, не верифицирован ли уже
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email уже подтверждён',
        alreadyVerified: true,
      });
    }

    // Обновляем статус верификации
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    // Удаляем использованный токен
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: 'Email успешно подтверждён!',
    });
  } catch (error) {
    console.error('Ошибка верификации email:', error);
    return NextResponse.json(
      { error: 'Не удалось подтвердить email' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify-email
 * Повторная отправка email верификации
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email не предоставлен' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email уже подтверждён' },
        { status: 400 }
      );
    }

    // Создаем новый токен и отправляем email
    const { createVerificationToken, sendVerificationEmail } = await import(
      '@/lib/email/send-verification'
    );

    const token = await createVerificationToken(email);
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      success: true,
      message: 'Письмо с подтверждением отправлено',
    });
  } catch (error) {
    console.error('Ошибка отправки верификации:', error);
    return NextResponse.json(
      { error: 'Не удалось отправить письмо' },
      { status: 500 }
    );
  }
}

