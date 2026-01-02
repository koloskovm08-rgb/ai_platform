'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LogOut,
  Image,
  CreditCard,
  Badge,
  ShoppingCart,
  ChevronDown,
  Home,
  Sparkles,
  History,
  Heart,
  LayoutTemplate,
  Crown,
  User,
  Settings,
  FileImage,
  Share2,
  Award,
  BookOpen,
  Megaphone,
  Presentation,
  Sticker,
  Gift,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// Типы для пунктов меню
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  prefetch?: boolean;
}

interface EditorItem extends NavItem {
  icon: React.ComponentType<{ className?: string }>;
}

// Конфигурация пунктов меню
const editorItems: EditorItem[] = [
  { name: 'Редактор изображений', href: '/edit', icon: Image, prefetch: false },
  { name: 'Редактор визиток', href: '/editor/business-card', icon: CreditCard, prefetch: false },
  { name: 'Редактор значков', href: '/editor/badge', icon: Badge, prefetch: false },
  { name: 'Редактор карточек товаров', href: '/editor/product-card', icon: ShoppingCart, prefetch: false },
  { name: 'Редактор постеров', href: '/editor/poster', icon: FileImage, prefetch: false },
  { name: 'Редактор логотипов', href: '/editor/logo', icon: Sparkles, prefetch: false },
  { name: 'Обложки соцсетей', href: '/editor/social-cover', icon: Share2, prefetch: false },
  { name: 'Редактор сертификатов', href: '/editor/certificate', icon: Award, prefetch: false },
  { name: 'Редактор меню', href: '/editor/menu', icon: BookOpen, prefetch: false },
  { name: 'Редактор флаеров', href: '/editor/flyer', icon: Megaphone, prefetch: false },
  { name: 'Редактор презентаций', href: '/editor/presentation', icon: Presentation, prefetch: false },
  { name: 'Редактор наклеек', href: '/editor/sticker', icon: Sticker, prefetch: false },
  { name: 'Редактор открыток', href: '/editor/greeting-card', icon: Gift, prefetch: false },
  { name: 'Редактор этикеток', href: '/editor/label', icon: Tag, prefetch: false },
];

const navItems: NavItem[] = [
  { name: 'Главная', href: '/', icon: Home, prefetch: true },
  { name: 'Генерация', href: '/generate', icon: Sparkles, prefetch: true },
  { name: 'История', href: '/edits', icon: History, prefetch: true },
  { name: 'Избранное', href: '/favorites', icon: Heart, prefetch: true },
  { name: 'Шаблоны', href: '/templates', icon: LayoutTemplate, prefetch: true },
];

interface Subscription {
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  status: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = React.useRef<HTMLButtonElement>(null);
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);

  // Загрузка данных подписки
  React.useEffect(() => {
    if (!session?.user?.id) {
      setSubscription(null);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        } else {
          // Если подписка не найдена, используем FREE по умолчанию
          setSubscription({ plan: 'FREE', status: 'ACTIVE' });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // При ошибке используем FREE по умолчанию
        setSubscription({ plan: 'FREE', status: 'ACTIVE' });
      }
    };

    fetchSubscription();
  }, [session?.user?.id]);

  // Закрытие мобильного меню по Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Закрытие мобильного меню при клике вне его
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !mobileMenuButtonRef.current?.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Блокируем скролл body когда меню открыто
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const isEditorActive = pathname.startsWith('/edit') || pathname.startsWith('/editor');

  // Мемоизация для оптимизации
  const userDisplayName = React.useMemo(
    () => session?.user?.name || session?.user?.email || 'Пользователь',
    [session]
  );

  // Компонент badge статуса подписки
  const SubscriptionBadge = React.useMemo(() => {
    const plan = subscription?.plan || 'FREE';
    const planLabels = {
      FREE: 'Free',
      PRO: 'Pro',
      PREMIUM: 'Premium',
    };

    const planStyles = {
      FREE: 'bg-muted/80 text-muted-foreground border-muted-foreground/20',
      PRO: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/15',
      PREMIUM: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-sm hover:shadow-md hover:from-amber-500/25 hover:via-yellow-500/25 hover:to-amber-500/25',
    };

    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200',
          planStyles[plan]
        )}
      >
        {plan === 'PREMIUM' && (
          <Crown className="h-3 w-3" aria-hidden="true" />
        )}
        <span className="leading-none">{planLabels[plan]}</span>
      </div>
    );
  }, [subscription?.plan]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-sm hover:shadow-md transition-shadow duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground"
      >
        Перейти к основному содержимому
      </a>
      <nav className="container flex h-16 items-center justify-between" aria-label="Основная навигация">
        {/* Логотип */}
        <Link href="/" className="flex items-center space-x-2" aria-label="На главную страницу">
          <Logo size="md" showText={true} />
        </Link>

        {/* Навигация Desktop */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={item.prefetch !== false}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg',
                  'hover:text-primary hover:bg-accent/60 hover:shadow-sm',
                  active
                    ? 'text-foreground bg-accent/60'
                    : 'text-muted-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                <span>{item.name}</span>
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-full animate-fade-in"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}

          {/* Выпадающее меню редакторов */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg',
                  'hover:text-primary hover:bg-accent/60 hover:shadow-sm',
                  isEditorActive
                    ? 'text-foreground bg-accent/60'
                    : 'text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
                aria-expanded={false}
                aria-haspopup="true"
                aria-label="Меню редакторов"
              >
                <span>Редактор</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 backdrop-blur-xl bg-background/95 border-border/50 shadow-xl">
              {editorItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      prefetch={item.prefetch !== false}
                      className={cn(
                        'flex items-center gap-2.5 cursor-pointer px-3 py-2 transition-colors',
                        active && 'bg-accent'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Действия */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden md:flex md:items-center md:gap-2">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent/80 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-sm hover:shadow-lg border border-transparent hover:border-border/50"
                    aria-label="Меню профиля"
                    aria-haspopup="true"
                  >
                    <Avatar
                      src={session.user?.image}
                      name={session.user?.name || session.user?.email}
                      size="md"
                      className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background hover:ring-primary/40 transition-all duration-200"
                    />
                    <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                      {userDisplayName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 backdrop-blur-xl bg-background/95 border-border/50 shadow-xl">
                  <DropdownMenuLabel className="px-3 py-2.5">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={session.user?.image}
                          name={session.user?.name || session.user?.email}
                          size="md"
                          className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background flex-shrink-0"
                        />
                        <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {session.user?.name || 'Пользователь'}
                          </p>
                          {session.user?.email && (
                            <p className="text-xs leading-none text-muted-foreground truncate">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      {SubscriptionBadge}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 cursor-pointer px-3 py-2 transition-colors hover:bg-accent"
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span>Профиль</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2.5 cursor-pointer px-3 py-2 transition-colors hover:bg-accent"
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      <span>Настройки</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/subscription"
                      className="flex items-center gap-2.5 cursor-pointer px-3 py-2 transition-colors hover:bg-accent"
                    >
                      <Crown className="h-4 w-4" aria-hidden="true" />
                      <span>Подписка</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 cursor-pointer px-3 py-2 text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login" prefetch={true} aria-label="Войти в аккаунт">
                    Вход
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" prefetch={true} aria-label="Создать новый аккаунт">
                    Регистрация
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Кнопка мобильного меню */}
          <Button
            ref={mobileMenuButtonRef}
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 transition-transform duration-200" />
            ) : (
              <Menu className="h-5 w-5 transition-transform duration-200" />
            )}
          </Button>
        </div>
      </nav>

      {/* Overlay для мобильного меню */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Мобильное меню - Slide-in панель */}
      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background border-l shadow-xl transform transition-transform duration-300 ease-in-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!mobileMenuOpen}
      >

        {/* Содержимое меню */}
        <div className="flex flex-col h-full">
          {/* Header мобильного меню */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Меню</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Прокручиваемое содержимое */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col py-2">
              {/* Основные пункты */}
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Навигация
                </h3>
                <div className="flex flex-col space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={item.prefetch !== false}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                          'hover:bg-accent hover:text-primary',
                          active
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Редакторы */}
              <div className="px-4 py-2 border-t">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Редакторы
                </h3>
                <div className="flex flex-col space-y-1">
                  {editorItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={item.prefetch !== false}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                          'hover:bg-accent hover:text-primary',
                          active
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer мобильного меню */}
          <div className="border-t p-4 space-y-3">
            {session ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar
                    src={session.user?.image}
                    name={session.user?.name || session.user?.email}
                    size="md"
                    className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {session.user?.name || 'Пользователь'}
                      </p>
                    </div>
                    {session.user?.email && (
                      <p className="text-xs text-muted-foreground truncate mb-1.5">{session.user.email}</p>
                    )}
                    {SubscriptionBadge}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start gap-2.5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <User className="h-4 w-4" />
                      <span>Профиль</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start gap-2.5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/settings" className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4" />
                      <span>Настройки</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start gap-2.5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/subscription" className="flex items-center gap-2.5">
                      <Crown className="h-4 w-4" />
                      <span>Подписка</span>
                    </Link>
                  </Button>
                  <div className="h-px bg-border my-1" />
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start gap-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Выйти из аккаунта"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Выйти</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="ghost" asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/login">Вход</Link>
                </Button>
                <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/register">Регистрация</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
