/**
 * Утилиты для отправки email верификации и сброса пароля
 * 
 * Примечание: Для production используйте сервис отправки email:
 * - Resend (рекомендуется): https://resend.com
 * - SendGrid: https://sendgrid.com
 * - Nodemailer + SMTP
 * 
 * Установка Resend: npm install resend
 */

import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { getServerBaseUrl } from '@/lib/base-url';

/**
 * Генерация токена верификации
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Создание токена верификации в БД
 */
export async function createVerificationToken(email: string): Promise<string> {
  const token = generateVerificationToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

  // Удаляем старые токены для этого email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Создаем новый токен
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Проверка токена верификации
 */
export async function verifyToken(token: string): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return null;
  }

  // Проверяем, не истек ли токен
  if (new Date() > verificationToken.expires) {
    await prisma.verificationToken.delete({
      where: { token },
    });
    return null;
  }

  return verificationToken.identifier; // email
}

/**
 * Отправка email с токеном верификации
 * 
 * В production замените console.log на реальную отправку email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${getServerBaseUrl()}/verify-email?token=${token}`;

  // TODO: Интеграция с Resend или другим сервисом
  // Пример с Resend:
  // const { Resend } = await import('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // 
  // await resend.emails.send({
  //   from: 'AI Image Platform <noreply@yourdomain.com>',
  //   to: email,
  //   subject: 'Подтвердите ваш email',
  //   html: `
  //     <h1>Подтвердите email</h1>
  //     <p>Нажмите на ссылку ниже для подтверждения:</p>
  //     <a href="${verificationUrl}">Подтвердить email</a>
  //     <p>Ссылка действительна 24 часа.</p>
  //   `,
  // });

  // Временно: выводим в консоль (для разработки)
  console.log('====================================');
  console.log('📧 EMAIL VERIFICATION');
  console.log('====================================');
  console.log('To:', email);
  console.log('Verification URL:', verificationUrl);
  console.log('====================================');
}

/**
 * Создание токена сброса пароля
 * TODO: После применения миграции раскомментировать
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const token = generateVerificationToken();
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 час

  // Временно используем VerificationToken вместо PasswordResetToken
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Проверка токена сброса пароля
 * TODO: После применения миграции раскомментировать
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const resetToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!resetToken || !resetToken.identifier.startsWith('reset:')) {
    return null;
  }

  // Проверяем, не истек ли токен
  if (new Date() > resetToken.expires) {
    await prisma.verificationToken.delete({
      where: { token },
    });
    return null;
  }

  return resetToken.identifier.replace('reset:', ''); // email
}

/**
 * Отправка email со ссылкой для сброса пароля
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${getServerBaseUrl()}/reset-password?token=${token}`;

  // TODO: Интеграция с Resend
  // Временно: выводим в консоль
  console.log('====================================');
  console.log('🔑 PASSWORD RESET');
  console.log('====================================');
  console.log('To:', email);
  console.log('Reset URL:', resetUrl);
  console.log('====================================');
}

