# ✅ Чеклист деплоя на Vercel

## 📋 Перед деплоем (обязательно)

### 1. Локальная проверка

- [ ] **Зависимости установлены**
  ```bash
  npm install
  ```

- [ ] **База данных настроена**
  - PostgreSQL запущена локально
  - DATABASE_URL прописан в `.env.local`
  - Миграции применены: `npx prisma migrate deploy`

- [ ] **Переменные окружения заполнены**
  - Скопирован `ENV_TEMPLATE.md` → `.env.local`
  - Все обязательные переменные заполнены
  - Секреты сгенерированы: `openssl rand -base64 32`

- [ ] **Приложение работает локально**
  ```bash
  npm run dev
  # Открыть http://localhost:3000
  # Проверить основные страницы
  ```

- [ ] **Нет ошибок TypeScript**
  ```bash
  npm run build
  ```

- [ ] **Линтер пройден**
  ```bash
  npm run lint
  ```

---

## 🚀 Vercel Setup

### 2. Создание проекта на Vercel

- [ ] **Залогиниться на Vercel**
  - Зайти на [vercel.com](https://vercel.com)
  - Sign in через GitHub

- [ ] **Создать Git репозиторий**
  ```bash
  git init
  git add .
  git commit -m "feat: initial commit for production"
  git branch -M main
  git remote add origin https://github.com/username/repo.git
  git push -u origin main
  ```

- [ ] **Import репозитория в Vercel**
  - Add New → Project
  - Import Git Repository
  - Выбрать репозиторий

- [ ] **Настроить проект**
  - Framework Preset: **Next.js**
  - Root Directory: `./`
  - Build Command: `npm run build` (уже включает миграции)
  - Output Directory: `.next`
  - Install Command: `npm install`

---

### 3. Настройка базы данных

#### Вариант А: Vercel Postgres (рекомендуется)

- [ ] **Создать базу данных**
  - В проекте → Storage → Create Database
  - Выбрать **Postgres**
  - Выбрать регион (ближайший к пользователям)

- [ ] **Скопировать DATABASE_URL**
  - Автоматически добавится в Environment Variables
  - Формат: `postgres://...`

#### Вариант Б: Supabase

- [ ] **Создать проект на Supabase**
  - [supabase.com](https://supabase.com) → New project
  - Выбрать регион и пароль

- [ ] **Получить Connection String**
  - Settings → Database → Connection String
  - Transaction mode (для Prisma)
  - Скопировать строку подключения

#### Вариант В: Neon / Railway

- [ ] **Создать базу данных**
- [ ] **Скопировать DATABASE_URL**

---

### 4. Environment Variables (критично!)

- [ ] **Перейти в Settings → Environment Variables**

- [ ] **Добавить обязательные переменные:**

```env
# База данных
DATABASE_URL="postgresql://..."

# NextAuth (ВАЖНО: используйте НОВЫЙ секрет для production!)
NEXTAUTH_URL="https://ваш-домен.vercel.app"
NEXTAUTH_SECRET="новый-секрет-для-продакшена"

# AI API (хотя бы один)
REPLICATE_API_TOKEN="r8_..."
OPENAI_API_KEY="sk-..."

# ЮKassa (если нужны платежи)
YOOKASSA_SHOP_ID="..."
YOOKASSA_SECRET_KEY="..."

# Google OAuth (опционально)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Cloudinary (опционально)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Site URL
NEXT_PUBLIC_SITE_URL="https://ваш-домен.vercel.app"
```

- [ ] **Применить для всех окружений:**
  - Production ✅
  - Preview ✅ (или скопировать из Production)
  - Development (опционально)

---

### 5. Deploy!

- [ ] **Нажать "Deploy"**
  - Vercel автоматически:
    - Установит зависимости
    - Запустит `prisma generate`
    - Запустит `prisma migrate deploy`
    - Соберет Next.js (`next build`)

- [ ] **Дождаться завершения** (2-5 минут)

- [ ] **Проверить логи деплоя**
  - Убедиться, что миграции прошли успешно
  - Нет ошибок в билде

---

## 🔍 После деплоя

### 6. Проверка работоспособности

- [ ] **Открыть сайт** (https://ваш-домен.vercel.app)

- [ ] **Проверить основные страницы:**
  - [ ] Главная `/`
  - [ ] Регистрация `/register`
  - [ ] Логин `/login`
  - [ ] Генерация `/generate`
  - [ ] Редактор `/edit`
  - [ ] Шаблоны `/templates`
  - [ ] Подписки `/subscription`

- [ ] **Создать тестовый аккаунт**
  - Зарегистрироваться
  - Проверить email verification (если настроен)

- [ ] **Протестировать AI генерацию**
  - Создать тестовое изображение
  - Проверить сохранение в БД

- [ ] **Проверить редактор**
  - Загрузить изображение
  - Применить фильтры
  - Сохранить

---

### 7. Настройка Google OAuth (если используется)

- [ ] **Google Cloud Console**
  - [console.cloud.google.com](https://console.cloud.google.com)
  - APIs & Services → Credentials

- [ ] **Добавить Authorized redirect URIs:**
  ```
  https://ваш-домен.vercel.app/api/auth/callback/google
  ```

- [ ] **Проверить вход через Google**

---

### 8. Настройка ЮKassa webhook (если используется)

- [ ] **Личный кабинет ЮKassa**
  - [yookassa.ru/my](https://yookassa.ru/my)
  - Настройки → HTTP-уведомления

- [ ] **Добавить Webhook URL:**
  ```
  https://ваш-домен.vercel.app/api/subscription/webhook
  ```

- [ ] **Проверить события:**
  - ✅ payment.succeeded
  - ✅ payment.canceled
  - ✅ refund.succeeded

- [ ] **Тестовый платеж**
  - Создать тестовую подписку
  - Проверить webhook

---

### 9. Создание админ-аккаунта

- [ ] **Подключиться к продакшн БД**
  ```bash
  # Через Vercel CLI
  vercel env pull .env.production
  ```

- [ ] **Запустить скрипт**
  ```bash
  node make-admin.js your-email@example.com
  ```

- [ ] **Проверить доступ к /admin**

---

### 10. SEO и мониторинг

- [ ] **Проверить sitemap**
  - https://ваш-домен.vercel.app/sitemap.xml

- [ ] **Проверить robots.txt**
  - https://ваш-домен.vercel.app/robots.txt

- [ ] **Google Search Console (опционально)**
  - Добавить сайт
  - Отправить sitemap

- [ ] **Vercel Analytics**
  - Автоматически работает (если добавлен в layout.tsx)
  - Проверить в Vercel Dashboard → Analytics

- [ ] **Vercel Speed Insights**
  - Автоматически работает
  - Проверить метрики производительности

---

## 🔧 Настройка CI/CD

### 11. Автоматический деплой

- [ ] **Настроен Git Integration**
  - Vercel автоматически деплоит при push в main

- [ ] **Branch Preview**
  - Vercel создает preview для каждой ветки
  - Settings → Git → Production Branch: `main`

- [ ] **Проверка деплоя**
  ```bash
  git checkout -b test-feature
  # Сделать изменения
  git commit -am "test: feature"
  git push origin test-feature
  # Vercel создаст preview URL
  ```

---

## ⚠️ Troubleshooting

### Ошибка подключения к БД

```
Error: P1001: Can't reach database server
```

**Решение:**
- Проверить DATABASE_URL в Environment Variables
- Убедиться, что IP Vercel добавлен в whitelist БД
- Для Vercel Postgres проверить регион

---

### Миграции не применяются

```
Error: Migration failed
```

**Решение:**
```bash
# Локально применить миграции
vercel env pull .env.production
npx prisma migrate deploy

# Или через Vercel CLI
vercel exec -- npx prisma migrate deploy
```

---

### AI генерация не работает

```
Error: API key invalid
```

**Решение:**
- Проверить REPLICATE_API_TOKEN / OPENAI_API_KEY
- Убедиться, что ключи валидны
- Проверить лимиты API
- Посмотреть логи в Vercel → Functions

---

### 413 Payload Too Large

**Решение:**
- Проверить `bodySizeLimit` в `next.config.ts` (уже 10mb)
- Для Vercel Pro/Enterprise можно увеличить до 4.5MB
- Оптимизировать изображения перед загрузкой

---

### NextAuth ошибки

```
[auth][error] Configuration
```

**Решение:**
- Убедиться, что NEXTAUTH_URL совпадает с доменом
- Проверить NEXTAUTH_SECRET (новый для production)
- Проверить redirect URIs для OAuth провайдеров

---

## 📊 Мониторинг в продакшене

### Что проверять регулярно:

- [ ] **Vercel Dashboard**
  - Errors (функции с ошибками)
  - Analytics (трафик)
  - Speed Insights (производительность)

- [ ] **База данных**
  - Размер (Vercel Postgres Hobby = 256MB)
  - Количество соединений
  - Медленные запросы

- [ ] **API лимиты**
  - Replicate (500 requests/month бесплатно)
  - OpenAI (billing)
  - ЮKassa (транзакции)

- [ ] **Логи ошибок**
  - Vercel → Deployments → View Function Logs
  - Настроить Sentry для production (опционально)

---

## ✅ Финальный чек

- [ ] Сайт открывается
- [ ] Регистрация работает
- [ ] Логин работает
- [ ] AI генерация работает
- [ ] Редактор работает
- [ ] Шаблоны загружаются
- [ ] Платежи работают (если настроены)
- [ ] Админка доступна
- [ ] Analytics работает
- [ ] Нет критических ошибок в логах

---

## 🎉 Готово!

Ваш AI Image Platform успешно задеплоен на Vercel!

**Полезные ссылки:**
- 📖 [Vercel Docs](https://vercel.com/docs)
- 🔧 [Next.js Deployment](https://nextjs.org/docs/deployment)
- 🗄️ [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- 💳 [ЮKassa API](https://yookassa.ru/developers)

**Следующие шаги:**
- Настроить кастомный домен (Vercel → Domains)
- Добавить SSL сертификат (автоматически)
- Настроить email notifications (опционально)
- Добавить rate limiting (Upstash Redis)
- Настроить backup БД (автоматически в Vercel Postgres)

