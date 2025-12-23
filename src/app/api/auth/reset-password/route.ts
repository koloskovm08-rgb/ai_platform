import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { verifyPasswordResetToken } from '@/lib/email/send-verification';

// Схема валидации
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

/**
 * POST /api/auth/reset-password
 * Сброс пароля с использованием токена
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Валидация
    const validatedData = resetPasswordSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { token, password } = validatedData.data;

    // Проверяем токен
    const email = await verifyPasswordResetToken(token);

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

    // Проверяем, что у пользователя есть пароль (не OAuth)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Этот аккаунт создан через Google. Используйте вход через Google.' },
        { status: 400 }
      );
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Обновляем пароль
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // Удаляем использованный токен
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно изменён',
    });
  } catch (error) {
    console.error('Ошибка сброса пароля:', error);
    return NextResponse.json(
      { error: 'Не удалось сбросить пароль' },
      { status: 500 }
    );
  }
}

