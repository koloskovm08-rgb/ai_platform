# 🚀 Руководство по деплою на Vercel

## Шаг 1: Подготовка к деплою

### 1.1 Проверьте что всё работает локально

```bash
npm run dev
# Откройте http://localhost:3000
# Проверьте основные функции
```

### 1.2 Проверьте билд локально

```bash
npm run build
npm start
```

Если билд успешен - готово к деплою! ✅

---

## Шаг 2: Создание проекта на Vercel

### Вариант A: Через Vercel Dashboard (рекомендуется)

1. Перейдите на https://vercel.com
2. Войдите через GitHub
3. Нажмите **"Add New..." → Project**
4. Выберите репозиторий `ai_platform`
5. Vercel автоматически определит Next.js настройки
6. Нажмите **"Deploy"**

### Вариант B: Через Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Шаг 3: Настройка Environment Variables

В Vercel Dashboard → Settings → Environment Variables добавьте:

### Обязательные переменные:

```env
# Database (используйте Vercel Postgres или Neon)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Authentication
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app

# AI Services (минимум один)
OPENAI_API_KEY=sk-your-key-here
REPLICATE_API_TOKEN=r8_your-token-here
```

### Опциональные переменные:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Payment - ЮKassa
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email - Resend
RESEND_API_KEY=re_your-key-here
```

---

## Шаг 4: Настройка базы данных

### Рекомендуемые варианты:

#### Вариант 1: Vercel Postgres (самый простой)
1. В Vercel Dashboard → Storage → Create Database
2. Выберите Postgres
3. Database автоматически подключится к проекту
4. `DATABASE_URL` добавится автоматически

#### Вариант 2: Neon (бесплатный PostgreSQL)
1. Зарегистрируйтесь на https://neon.tech
2. Создайте проект
3. Скопируйте Connection String
4. Добавьте в Vercel как `DATABASE_URL`

#### Вариант 3: Supabase
1. Зарегистрируйтесь на https://supabase.com
2. Создайте проект
3. Settings → Database → Connection string
4. Используйте "Connection pooling" URL

### Применение миграций:

После настройки DATABASE_URL:

```bash
# Локально (с подключением к production БД)
npx prisma migrate deploy

# Или через Vercel CLI
vercel env pull
npx prisma migrate deploy
```

---

## Шаг 5: Проверка деплоя

### После успешного деплоя:

1. ✅ Откройте `https://your-app.vercel.app`
2. ✅ Проверьте регистрацию и вход
3. ✅ Попробуйте генерацию (убедитесь что API ключи работают)
4. ✅ Проверьте редактор
5. ✅ Откройте /profile

---

## Шаг 6: Настройка домена (опционально)

1. В Vercel Dashboard → Settings → Domains
2. Добавьте свой домен
3. Настройте DNS записи (Vercel покажет инструкции)
4. Обновите `NEXTAUTH_URL` на ваш домен

---

## Шаг 7: Первичная настройка после деплоя

### 7.1 Создайте admin пользователя

```bash
# Подключитесь к production БД
node make-admin.js <email-admin@example.com>
```

### 7.2 Проверьте функции

- [ ] Регистрация/вход работает
- [ ] Email верификация (проверьте консоль или настройте Resend)
- [ ] Генерация изображений (проверьте API ключи)
- [ ] Редактор загружается
- [ ] Подписки работают
- [ ] Admin панель доступна

---

## Troubleshooting

### Проблема: "Database connection failed"
**Решение:** 
- Проверьте `DATABASE_URL` в Environment Variables
- Убедитесь что строка подключения включает `?sslmode=require`
- Проверьте что БД доступна извне

### Проблема: "NextAuth configuration error"
**Решение:**
- Убедитесь что `NEXTAUTH_SECRET` установлен
- `NEXTAUTH_URL` должен совпадать с вашим доменом
- Для Google OAuth проверьте Authorized redirect URIs

### Проблема: "AI generation failed"
**Решение:**
- Проверьте что `OPENAI_API_KEY` или `REPLICATE_API_TOKEN` установлены
- Проверьте баланс на аккаунтах
- Проверьте лимиты API

### Проблема: Build fails
**Решение:**
- Проверьте логи билда в Vercel
- Локально запустите `npm run build`
- Исправьте TypeScript ошибки

---

## Мониторинг и обслуживание

### Рекомендуемые сервисы:

1. **Sentry** - мониторинг ошибок
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Vercel Analytics** - аналитика
   - Включается в Settings → Analytics

3. **Uptime monitoring** - проверка доступности
   - UptimeRobot (бесплатно)
   - Pingdom

---

## Performance оптимизация

После деплоя оптимизируйте:

1. **Изображения:**
   - Используйте Next.js Image компонент (уже используется)
   - Настройте Cloudinary для оптимизации

2. **Кэширование:**
   - Vercel автоматически кэширует static assets
   - Настройте ISR для динамических страниц

3. **Edge Functions:**
   - Рассмотрите использование Edge Runtime для API routes

---

## Безопасность

Перед production:

- [ ] Смените все секретные ключи
- [ ] Настройте rate limiting
- [ ] Проверьте CORS настройки
- [ ] Включите SSL (Vercel делает автоматически)
- [ ] Настройте CSP headers
- [ ] Проверьте что sensitive данные не логируются

---

## Checklist перед деплоем:

- [x] .gitignore настроен
- [x] vercel.json создан
- [x] Environment variables документированы
- [ ] DATABASE_URL настроен в Vercel
- [ ] NEXTAUTH_SECRET сгенерирован
- [ ] AI API ключи добавлены
- [ ] Миграции применены
- [ ] Тестовые данные добавлены (опционально)

---

## Полезные команды

```bash
# Посмотреть логи production
vercel logs

# Откатиться на предыдущую версию
vercel rollback

# Посмотреть все деплои
vercel list

# Открыть production в браузере
vercel open
```

---

## Контакты поддержки

- Vercel Support: https://vercel.com/support
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Готово! Ваш проект готов к деплою! 🎉**

Следуйте шагам выше и ваше приложение будет работать на production!

