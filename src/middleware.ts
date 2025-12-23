import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Публичные маршруты (доступны всем)
  const isPublicRoute = nextUrl.pathname === '/' || 
                        nextUrl.pathname.startsWith('/api/auth');

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
});

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

