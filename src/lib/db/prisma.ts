import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Создание Prisma Client с оптимизированными настройками connection pooling
 * 
 * Важно:
 * - connection_limit: максимальное количество соединений в пуле (по умолчанию 5)
 * - pool_timeout: время ожидания свободного соединения в секундах (по умолчанию 10)
 * 
 * Для увеличения лимитов добавьте параметры в DATABASE_URL:
 * postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Отключаем автоматическое подключение при создании клиента
    // Соединения будут устанавливаться по требованию
    errorFormat: 'pretty',
  });

// Graceful shutdown: закрываем соединения при завершении процесса
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // В продакшене закрываем соединения при завершении
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

/**
 * Проверка подключения к базе данных
 * Используйте для диагностики проблем с подключением
 */
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    console.error('Database connection check failed:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Безопасное выполнение запросов с обработкой ошибок подключения
 */
export async function safePrismaQuery<T>(
  query: () => Promise<T>,
  retries = 2
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await query();
    } catch (error: unknown) {
      // P1001: Can't reach database server
      // P2024: Connection pool timeout
      const prismaError = error as { code?: string };
      if (
        prismaError?.code === 'P1001' || 
        prismaError?.code === 'P2024' || 
        prismaError?.code === 'P1017'
      ) {
        if (i < retries) {
          // Экспоненциальная задержка перед повтором
          const delay = Math.pow(2, i) * 1000;
          console.warn(
            `Database connection error (${prismaError.code}), retrying in ${delay}ms... (attempt ${i + 1}/${retries + 1})`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

