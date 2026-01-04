/**
 * Единый способ получить "базовый URL" приложения на сервере.
 *
 * Почему так:
 * - `NEXTAUTH_URL` — классический вариант для NextAuth/Auth.js
 * - `NEXT_PUBLIC_SITE_URL` — часто уже задан в проектах для SEO/metadata
 * - `VERCEL_URL` — доступен на Vercel, но приходит БЕЗ протокола
 *
 * Возвращаем строку без слеша в конце.
 */
export function getServerBaseUrl(): string {
  const clean = (value: string) => value.trim().replace(/\/$/, '');

  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl && nextAuthUrl.trim() !== '') return clean(nextAuthUrl);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && siteUrl.trim() !== '') return clean(siteUrl);

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && vercelUrl.trim() !== '') return clean(`https://${vercelUrl}`);

  return 'http://localhost:3000';
}


