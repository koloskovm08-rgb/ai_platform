import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

/**
 * GET /api/profile
 * Получение данных профиля текущего пользователя
 */
export async function GET() {
  try {
    // Проверка аутентификации
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    // Получаем полные данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Подписка
        subscription: {
          select: {
            plan: true,
            status: true,
            generationsLeft: true,
            generationsLimit: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить профиль' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Обновление данных профиля (имя, email, пароль)
 */
export async function PUT(req: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Схема валидации
    const updateSchema = z.object({
      name: z.string().min(2, 'Имя должно быть минимум 2 символа').optional(),
      email: z.string().email('Некорректный email').optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6, 'Пароль должен быть минимум 6 символов').optional(),
      image: z.string().url('Некорректный URL изображения').nullable().optional(),
    });

    const validatedData = updateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { name, email, currentPassword, newPassword, image } = validatedData.data;

    // Подготовка данных для обновления
    const updateData: {
      name?: string;
      image?: string | null;
      email?: string;
      emailVerified?: Date | null;
      password?: string;
    } = {};

    if (name) {
      updateData.name = name;
    }

    // Обработка изображения: может быть URL или null (для удаления)
    if (image !== undefined) {
      updateData.image = image;
    }

    // Проверка при смене email
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email уже используется другим пользователем' },
          { status: 409 }
        );
      }

      updateData.email = email;
      updateData.emailVerified = null; // Сброс верификации при смене email // Сброс верификации при смене email
    }

    // Проверка при смене пароля
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Необходимо указать текущий пароль' },
          { status: 400 }
        );
      }

      // Получаем пользователя с паролем
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user?.password) {
        return NextResponse.json(
          { error: 'У вас нет установленного пароля (вход через Google)' },
          { status: 400 }
        );
      }

      // Проверяем текущий пароль
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Неверный текущий пароль' },
          { status: 400 }
        );
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Профиль успешно обновлён',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить профиль' },
      { status: 500 }
    );
  }
}

