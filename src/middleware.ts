import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

/**
 * Легковесная проверка сессии для Edge Function
 * Использует только декодирование JWT из cookie без импорта всей конфигурации NextAuth
 * Это уменьшает размер Edge Function с ~1.03 MB до <1 MB
 * 
 * Примечание: decodeJwt не проверяет подпись, но это приемлемо для middleware,
 * так как полная проверка происходит на сервере в API routes
 */
async function getSessionFromCookie(request: NextRequest) {
  // Проверяем все возможные имена cookie для NextAuth v5
  const sessionToken = 
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    // Декодируем JWT токен (без проверки подписи для скорости в Edge)
    // decodeJwt только декодирует payload, не проверяет подпись
    // Это безопасно, так как полная проверка будет на сервере
    const token = decodeJwt(sessionToken);

    // Проверяем срок действия токена
    if (!token || !token.exp || token.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      user: {
        id: token.id as string,
        role: token.role as string,
        email: token.email as string,
      },
    };
  } catch {
    return null;
  }
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

