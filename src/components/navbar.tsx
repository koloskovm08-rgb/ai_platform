'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { name: 'Главная', href: '/', prefetch: true },
  { name: 'Генерация', href: '/generate', prefetch: true },
  { name: 'Редактор', href: '/edit', prefetch: false }, // Тяжелый компонент, не prefetch
  { name: 'История', href: '/edits', prefetch: true },
  { name: 'Избранное', href: '/favorites', prefetch: true },
  { name: 'Шаблоны', href: '/templates', prefetch: true },
  { name: 'Подписка', href: '/subscription', prefetch: true },
  { name: 'Профиль', href: '/profile', prefetch: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground"
      >
        Перейти к основному содержимому
      </a>
      <nav className="container flex h-16 items-center justify-between" aria-label="Основная навигация">
        {/* Логотип */}
        <Link href="/" className="flex items-center space-x-2" aria-label="На главную страницу">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-bold sm:inline-block">
            AI Image Platform
          </span>
        </Link>

        {/* Навигация Desktop */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.prefetch !== false}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Действия */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <div className="hidden md:flex md:gap-2">
            {session ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {session.user?.name || session.user?.email}
                </span>
                <Button variant="ghost" onClick={handleSignOut} aria-label="Выйти из аккаунта">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login" prefetch={true} aria-label="Войти в аккаунт">Вход</Link>
                </Button>
                <Button asChild>
                  <Link href="/register" prefetch={true} aria-label="Создать новый аккаунт">Регистрация</Link>
                </Button>
              </>
            )}
          </div>

          {/* Мобильное меню */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="container border-t md:hidden">
          <div className="flex flex-col space-y-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex gap-2 px-4 pt-2">
              {session ? (
                <>
                  <div className="w-full px-4 py-2 text-sm text-muted-foreground">
                    {session.user?.name || session.user?.email}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="flex-1"
                    aria-label="Выйти из аккаунта"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="flex-1">
                    <Link href="/login">Вход</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/register">Регистрация</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

