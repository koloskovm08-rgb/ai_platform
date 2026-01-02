/**
 * Вспомогательные функции для проверки аутентификации в API routes
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Проверяет аутентификацию пользователя
 * @returns Session или NextResponse с ошибкой
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Необходима авторизация' },
      { status: 401 }
    );
  }
  
  return session;
}

/**
 * Проверяет права администратора
 * @returns Session или NextResponse с ошибкой
 */
export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Необходима авторизация' },
      { status: 401 }
    );
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Доступ запрещен. Требуются права администратора' },
      { status: 403 }
    );
  }
  
  return session;
}

/**
 * Проверяет владение ресурсом (пользователь является владельцем или админом)
 */
export function canModifyResource(
  resourceOwnerId: string | null,
  userId: string,
  userRole: string
): boolean {
  return resourceOwnerId === userId || userRole === 'ADMIN';
}

/**
 * Стандартный обработчик ошибок для API routes
 */
export function handleApiError(error: unknown, context: string) {
  console.error(`${context} error:`, error);
  
  // Не раскрываем внутренние ошибки клиенту
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Произошла ошибка на сервере' },
      { status: 500 }
    );
  }
  
  // В dev режиме показываем детали
  return NextResponse.json(
    { 
      error: 'Произошла ошибка на сервере',
      details: error instanceof Error ? error.message : String(error)
    },
    { status: 500 }
  );
}

/**
 * Валидирует и парсит JSON body с обработкой ошибок
 */
interface ValidationSchema<T> {
  safeParse: (data: unknown) => { 
    success: boolean; 
    data?: T; 
    error?: { flatten?: () => { fieldErrors?: Record<string, string[]> } } | unknown;
  };
}

export async function parseJsonBody<T>(
  request: Request,
  schema?: ValidationSchema<T>
): Promise<T | NextResponse> {
  try {
    const body = await request.json();
    
    if (!schema) {
      return body as T;
    }
    
    const validatedData = schema.safeParse(body);
    
    if (!validatedData.success) {
      const errorData = validatedData.error;
      return NextResponse.json(
        { 
          error: 'Некорректные данные',
          errors: (errorData && typeof errorData === 'object' && 'flatten' in errorData && typeof errorData.flatten === 'function') 
            ? errorData.flatten().fieldErrors 
            : errorData,
        },
        { status: 400 }
      );
    }
    
    return validatedData.data as T;
  } catch {
    return NextResponse.json(
      { error: 'Некорректный JSON' },
      { status: 400 }
    );
  }
}

/**
 * Rate limiting helper (базовая версия)
 * Для production рекомендуется использовать @upstash/ratelimit
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Возвращает ошибку rate limit
 */
export function rateLimitExceeded() {
  return NextResponse.json(
    { error: 'Слишком много запросов. Попробуйте позже' },
    { 
      status: 429,
      headers: {
        'Retry-After': '60'
      }
    }
  );
}

