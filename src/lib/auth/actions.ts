import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { signIn } from './index';
import { AuthError } from 'next-auth';

// Схема валидации для регистрации
const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно быть минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

// Схема валидации для входа
const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Регистрация нового пользователя
 */
export async function registerUser(data: RegisterFormData) {
  try {
    // Валидация данных
    const validatedFields = registerSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Некорректные данные',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, email, password } = validatedFields.data;

    // Проверка, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Пользователь с таким email уже существует',
      };
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });

    // Создание бесплатной подписки
    const userId = user.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    await prisma.subscription.create({
      data: {
        userId: userId,
        plan: 'FREE',
        status: 'ACTIVE',
        generationsLeft: 10,
        generationsLimit: 10,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Отправка email верификации
    try {
      const { createVerificationToken, sendVerificationEmail } = await import(
        '@/lib/email/send-verification'
      );
      const token = await createVerificationToken(email);
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error('Ошибка отправки email верификации:', emailError);
      // Не прерываем регистрацию, если не удалось отправить email
    }

    return {
      success: true,
      message: 'Регистрация прошла успешно! Проверьте почту для подтверждения email.',
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Произошла ошибка при регистрации',
    };
  }
}

/**
 * Вход пользователя
 */
export async function loginUser(data: LoginFormData) {
  try {
    // Валидация данных
    const validatedFields = loginSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Некорректные данные',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { email, password } = validatedFields.data;

    // Вход через NextAuth
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
      message: 'Вход выполнен успешно',
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            error: 'Неверный email или пароль',
          };
        default:
          return {
            success: false,
            error: 'Произошла ошибка при входе',
          };
      }
    }
    
    throw error;
  }
}

