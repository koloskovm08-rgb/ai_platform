'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Компонент для управления видимостью индикатора React DevTools
 * Показывает индикатор только для администраторов
 */
export function DevToolsController() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Ждём загрузки сессии
    if (status === 'loading') return;

    const isAdmin = session?.user?.role === 'ADMIN';
    
    // Добавляем или удаляем класс на body
    if (isAdmin) {
      document.body.classList.add('show-devtools');
      document.body.classList.remove('hide-devtools');
    } else {
      document.body.classList.add('hide-devtools');
      document.body.classList.remove('show-devtools');
    }

    // Очистка при размонтировании
    return () => {
      document.body.classList.remove('show-devtools', 'hide-devtools');
    };
  }, [session, status]);

  // Этот компонент ничего не рендерит
  return null;
}

