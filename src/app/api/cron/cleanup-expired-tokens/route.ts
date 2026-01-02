import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Endpoint для очистки истекших токенов
 * 
 * Ранее использовался как cron job, но был удален из vercel.json
 * из-за лимита на количество cron jobs в бесплатном плане Vercel.
 * 
 * Можно вызывать вручную через GET запрос с авторизацией:
 * - В development: без авторизации
 * - В production: требуется CRON_SECRET в заголовке Authorization
 * 
 * Очищает:
 * - VerificationToken (токены верификации email)
 * - PasswordResetToken (токены сброса пароля)
 * - Session (истекшие сессии NextAuth)
 * 
 * Для автоматической очистки можно использовать внешний сервис
 * (например, EasyCron, cron-job.org) или вызывать вручную при необходимости.
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации cron job (Vercel автоматически добавляет заголовок)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // В development разрешаем без секрета, в production требуется
      if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const now = new Date();

    // Удаление истекших токенов верификации email
    const deletedVerificationTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: now,
        },
      },
    });

    // Удаление истекших токенов сброса пароля
    const deletedPasswordResetTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: now,
        },
      },
    });

    // Удаление истекших сессий NextAuth
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: now,
        },
      },
    });

    const deletedCount = {
      verificationTokens: deletedVerificationTokens.count,
      passwordResetTokens: deletedPasswordResetTokens.count,
      sessions: deletedSessions.count,
    };

    const totalDeleted = 
      deletedCount.verificationTokens + 
      deletedCount.passwordResetTokens + 
      deletedCount.sessions;

    return NextResponse.json({
      success: true,
      message: `Удалено ${totalDeleted} истекших записей`,
      deleted: deletedCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    // Логируем ошибки cron job всегда, так как это важно для мониторинга
    console.error('Cron cleanup error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'An error occurred during cleanup',
      },
      { status: 500 }
    );
  }
}

