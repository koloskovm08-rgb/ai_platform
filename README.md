# 🎨 AI Image Platform

> Полнофункциональная платформа для генерации и редактирования изображений с помощью искусственного интеллекта

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.1-teal)](https://www.prisma.io/)

## ✨ Возможности

### 🎨 AI Генерация
- **Stable Diffusion XL** — гибкие настройки, высокое качество
- **DALL-E 3** — понимание сложных промптов
- Промпт-инженерство с 8 готовыми стилями
- 12 пресетов по категориям
- Настройка параметров (размер, steps, guidance scale)
- История всех генераций

### ✏️ Редактор изображений
- Canvas на базе **Fabric.js**
- Добавление текста, фигур, изображений
- 7 типов фильтров (Ч/Б, Сепия, Яркость, Контраст, Blur)
- Трансформации (поворот, отражение, масштабирование)
- Undo/Redo (неограниченная история)
- Экспорт в PNG, JPEG, SVG

### 📋 Библиотека шаблонов
- 8 типов: Стикеры, Визитки, Наклейки, Баннеры, Карточки товара, Посты для соцсетей, Флаеры
- 10 категорий: Бизнес, Соцсети, Маркетинг, E-commerce, События и др.
- Фильтры по типу, категории, премиум статусу
- Поиск по названию и описанию
- Модальное окно предпросмотра

### 💳 Система подписок
- 3 тарифа: **Free** (₽0), **Pro** (₽990), **Premium** (₽2990)
- Интеграция с **ЮKassa**
- Автоматическое управление лимитами
- Webhook для обработки платежей
- Визуализация использования лимитов

### 👑 Админ-панель
- Дашборд с аналитикой
- Управление пользователями (изменение ролей, удаление)
- Управление шаблонами
- Статистика по AI моделям
- Распределение по подпискам

### 🔐 Безопасность
- NextAuth.js v5 для аутентификации
- OAuth (Google) + Email/Password
- Хеширование паролей (bcrypt)
- Middleware для защиты маршрутов
- Проверка ролей (User/Admin)

## 🛠 Технологический стек

| Категория | Технологии |
|-----------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Стилизация** | Tailwind CSS v3.4, shadcn/ui, Lucide Icons |
| **База данных** | PostgreSQL, Prisma ORM 6.1 |
| **Аутентификация** | NextAuth.js v5, @auth/prisma-adapter |
| **AI API** | Replicate (Stable Diffusion), OpenAI (DALL-E 3) |
| **Редактор** | Fabric.js 6.5, file-saver |
| **Платежи** | ЮKassa API, Axios |
| **Валидация** | Zod, React Hook Form |
| **Деплой** | Vercel (рекомендуется) |

## 🚀 Быстрый старт

### 1. Клонирование и установка

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd ai-image-platform

# Установите зависимости
npm install
```

### 2. Настройка базы данных

#### PostgreSQL (рекомендуется)

```bash
# Создайте базу данных
createdb ai_platform

# Или через psql
psql -U postgres -c "CREATE DATABASE ai_platform;"
```

#### SQLite (для разработки)

Измените `provider` в `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 3. Переменные окружения

Создайте файл `.env.local`:

```env
# База данных
DATABASE_URL="postgresql://user:password@localhost:5432/ai_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="сгенерируйте_через: openssl rand -base64 32"

# Google OAuth (опционально)
GOOGLE_CLIENT_ID="ваш_google_client_id"
GOOGLE_CLIENT_SECRET="ваш_google_client_secret"

# AI API (обязательно для генерации)
REPLICATE_API_TOKEN="r8_ваш_токен"
OPENAI_API_KEY="sk-ваш_ключ"

# ЮKassa (для платежей)
YOOKASSA_SHOP_ID="ваш_shop_id"
YOOKASSA_SECRET_KEY="ваш_secret_key"

# Cloudinary (опционально)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="ваше_облако"
CLOUDINARY_API_KEY="ваш_api_key"
CLOUDINARY_API_SECRET="ваш_api_secret"
```

### 4. Миграции базы данных

```bash
# Применить миграции
npx prisma migrate dev --name init

# Сгенерировать Prisma Client
npx prisma generate

# (Опционально) Заполнить тестовыми данными
npx tsx prisma/seed.ts
```

### 5. Запуск

```bash
# Режим разработки
npm run dev

# Продакшен
npm run build
npm start
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
ai-image-platform/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Группа: аутентификация
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/               # Админ-панель
│   │   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/
│   │   │   ├── generate/
│   │   │   ├── templates/
│   │   │   ├── subscription/
│   │   │   └── admin/
│   │   ├── edit/                # Редактор
│   │   ├── generate/            # Генератор
│   │   ├── subscription/        # Подписки
│   │   ├── templates/           # Шаблоны
│   │   └── page.tsx             # Главная
│   ├── components/
│   │   ├── ui/                  # shadcn/ui компоненты
│   │   ├── admin/               # Админ компоненты
│   │   ├── editor/              # Редактор
│   │   ├── generator/           # Генератор
│   │   ├── subscription/        # Подписки
│   │   ├── templates/           # Шаблоны
│   │   ├── navbar.tsx
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   ├── ai/                  # AI клиенты
│   │   │   ├── replicate.ts
│   │   │   └── openai.ts
│   │   ├── auth/                # Аутентификация
│   │   │   ├── config.ts
│   │   │   ├── index.ts
│   │   │   └── actions.ts
│   │   ├── db/
│   │   │   └── prisma.ts
│   │   ├── payment/
│   │   │   └── yookassa.ts
│   │   └── utils/               # Утилиты
│   │       ├── image-editor.ts
│   │       ├── prompts.ts
│   │       ├── subscription.ts
│   │       ├── templates.ts
│   │       └── validation.ts
│   ├── hooks/
│   │   └── use-fabric-canvas.ts
│   ├── types/
│   │   └── next-auth.d.ts
│   └── middleware.ts            # Защита маршрутов
├── prisma/
│   └── schema.prisma            # Схема БД
├── public/                       # Статика
├── SETUP.md                      # Инструкции по настройке
├── YOOKASSA_SETUP.md            # Настройка ЮKassa
├── README2.md                    # Документация для новичков
└── package.json
```

## 🗄️ База данных

### Модели Prisma

- **User** — пользователи
- **Account** — OAuth аккаунты
- **Session** — сессии
- **Subscription** — подписки
- **Generation** — история генераций
- **Edit** — история редактирований
- **Template** — шаблоны

### Команды Prisma

```bash
# Просмотр БД (GUI)
npx prisma studio

# Создать миграцию
npx prisma migrate dev --name название_миграции

# Применить миграции (продакшен)
npx prisma migrate deploy

# Сбросить БД
npx prisma migrate reset
```

## 🎯 Использование

### Генерация изображений

1. Перейдите на `/generate`
2. Выберите AI модель (Stable Diffusion или DALL-E 3)
3. Введите промпт или выберите пресет
4. (Опционально) Примените стиль
5. Настройте параметры
6. Нажмите "Сгенерировать"

### Редактирование

1. Перейдите на `/edit`
2. Загрузите изображение или используйте сгенерированное
3. Используйте инструменты:
   - Текст, фигуры, изображения
   - Фильтры и эффекты
   - Трансформации
4. Экспортируйте результат

### Шаблоны

1. Перейдите на `/templates`
2. Фильтруйте по типу/категории
3. Кликните "Предпросмотр"
4. Нажмите "Использовать шаблон"
5. Кастомизируйте в редакторе

## 🚢 Деплой

### Vercel (рекомендуется)

1. Залогиньтесь на [vercel.com](https://vercel.com)
2. Import репозитория
3. Добавьте переменные окружения
4. Deploy

### Переменные окружения на Vercel

Добавьте все переменные из `.env.local` в Settings → Environment Variables

### База данных (продакшен)

Используйте один из вариантов:
- **Vercel Postgres** (встроенный)
- **Supabase** (бесплатный tier)
- **Railway** (PostgreSQL)
- **Neon** (serverless Postgres)

## 📚 Документация

- [README2.md](./README2.md) — Подробная документация для новичков
- [SETUP.md](./SETUP.md) — Инструкции по настройке
- [YOOKASSA_SETUP.md](./YOOKASSA_SETUP.md) — Настройка платежей

## 🔧 Разработка

### Код-стиль

```bash
# Проверка
npm run lint

# Форматирование (если настроен Prettier)
npm run format
```

### Тестирование

```bash
# Unit тесты (если настроены)
npm run test

# E2E тесты (если настроены)
npm run test:e2e
```

## 🚀 Деплой на Vercel

### Быстрый старт:

1. **Импортируйте проект в Vercel:**
   - Перейдите на https://vercel.com
   - New Project → Import Git Repository
   - Выберите `ai_platform`

2. **Настройте Environment Variables:**
   - DATABASE_URL (PostgreSQL)
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (добавить после первого деплоя)
   - OPENAI_API_KEY или REPLICATE_API_TOKEN

3. **Deploy!**
   - Vercel автоматически соберёт и задеплоит проект

### Детальные инструкции:

Смотрите **`VERCEL_DEPLOYMENT_GUIDE.md`** и **`DEPLOY_CHECKLIST.md`**

### Рекомендуемые сервисы для production:

- **База данных:** Vercel Postgres, Neon, Supabase
- **Email:** Resend
- **Хранилище:** Cloudinary
- **Мониторинг:** Sentry, Vercel Analytics

## 📝 Лицензия

MIT

## 🤝 Вклад

Приветствуются Pull Requests и Issues!

---

**Создано с ❤️ используя Next.js 15 и React 19**

