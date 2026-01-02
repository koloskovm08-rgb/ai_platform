import * as React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProfileForm } from '@/components/profile/profile-form';
import { Settings } from 'lucide-react';

/**
 * Страница настроек пользователя
 * Позволяет изменить информацию профиля (имя, email, пароль)
 */
export default async function SettingsPage() {
  // Проверяем авторизацию
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/settings');
  }

  // Загружаем данные профиля на сервере
  const profileData = await fetchProfile(session.user.id);

  return (
    <main id="main-content" className="container py-8 space-y-8">
      {/* Заголовок */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground">
            Управление информацией профиля и безопасностью
          </p>
        </div>
      </div>

      {/* Форма редактирования профиля */}
      <section aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="text-xl font-semibold mb-4">
          Информация профиля
        </h2>
        <ProfileForm user={profileData} />
      </section>
    </main>
  );
}

/**
 * Получение данных профиля (серверная функция)
 */
async function fetchProfile(userId: string) {
  try {
    const { prisma } = await import('@/lib/db/prisma');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return user;
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    throw error;
  }
}

/**
 * Метаданные страницы
 */
export const metadata = {
  title: 'Настройки | AI Image Platform',
  description: 'Управление информацией профиля и безопасностью',
};

