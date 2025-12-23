import VerifyEmailClient from './VerifyEmailClient';

/**
 * Метаданные страницы
 * Экспортируются только из Server Components
 */
export const metadata = {
  title: 'Подтверждение Email | AI Image Platform',
  description: 'Подтвердите ваш email адрес',
};

/**
 * Страница верификации email
 * Server Component - экспортирует metadata и рендерит Client Component
 */
export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}

