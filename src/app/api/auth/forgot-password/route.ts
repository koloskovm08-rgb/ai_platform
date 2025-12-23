import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { createPasswordResetToken, sendPasswordResetEmail } from '@/lib/email/send-verification';

// Схема валидации
const forgotPasswordSchema = z.object({
  email: z.string().email('Некорректный email'),
});

/**
 * POST /api/auth/forgot-password
 * Запрос сброса пароля - отправляет письмо с токеном
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Валидация
    const validatedData = forgotPasswordSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Некорректный email' },
        { status: 400 }
      );
    }

    const { email } = validatedData.data;

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Из соображений безопасности всегда возвращаем успех,
    // даже если пользователь не найден (чтобы не раскрывать существование email)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Если этот email зарегистрирован, вы получите письмо со ссылкой для сброса пароля',
      });
    }

    // Проверяем, что у пользователя есть пароль (не OAuth)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Этот аккаунт создан через Google. Используйте вход через Google.' },
        { status: 400 }
      );
    }

    // Создаем токен и отправляем email
    const token = await createPasswordResetToken(email);
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      success: true,
      message: 'Письмо со ссылкой для сброса пароля отправлено',
    });
  } catch (error) {
    console.error('Ошибка запроса сброса пароля:', error);
    return NextResponse.json(
      { error: 'Не удалось отправить письмо' },
      { status: 500 }
    );
  }
}

