import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Легковесная проверка сессии для Edge Function
 * Не импортирует NextAuth целиком — использует getToken() для безопасного чтения
 * токена из cookie (поддерживает JWT/JWE в NextAuth/Auth.js).
 */
async function getSessionFromCookie(request: NextRequest) {
  /**
   * Важно: JWT у NextAuth/Auth.js часто **зашифрован** (JWE), поэтому простое decodeJwt()
   * не работает и будет постоянно возвращать null.
   *
   * getToken() умеет корректно расшифровать/проверить токен в Edge middleware.
   */
  // NextAuth/Auth.js: поддерживаем и AUTH_SECRET (v5), и NEXTAUTH_SECRET (старые гайды/совместимость)
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  // Пробуем все возможные имена cookie (Auth.js v5 и NextAuth v4)
  const cookieNames = [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
  ] as const;

  for (const cookieName of cookieNames) {
    const token = await getToken({ req: request, secret, cookieName });
    if (token) {
      return {
        user: {
          id: token.id as string,
          role: token.role as string,
          email: token.email as string,
        },
      };
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const session = await getSessionFromCookie(request);
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;

  // Маршруты аутентификации (login, register)
  const isAuthRoute = nextUrl.pathname.startsWith('/login') || 
                      nextUrl.pathname.startsWith('/register');

  // Защищенные маршруты (требуют авторизации)
  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') ||
                          nextUrl.pathname.startsWith('/generate') ||
                          nextUrl.pathname.startsWith('/edit') ||
                          nextUrl.pathname.startsWith('/templates') ||
                          nextUrl.pathname.startsWith('/subscription');

  // Админские маршруты
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');

  // Если пользователь авторизован и пытается зайти на страницу входа/регистрации
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // Если пользователь не авторизован и пытается зайти на защищенный маршрут
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Если пользователь не админ и пытается зайти в админку
  if (isAdminRoute && (!isLoggedIn || userRole !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
}

// Настройка matcher - какие маршруты обрабатывать
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    // Не обрабатываем /api/* (там авторизация проверяется внутри route handlers через auth())
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

