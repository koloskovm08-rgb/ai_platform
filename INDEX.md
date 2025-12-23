# 📚 Навигация по проекту AI Image Platform

Добро пожаловать! Этот файл поможет вам сориентироваться в документации.

---

## 🚀 Для быстрого старта

**Хотите запустить проект за 5 минут?**

👉 Читайте **[QUICKSTART.md](./QUICKSTART.md)**

Включает:
- Минимальная настройка
- Запуск без API ключей
- Тестирование основных функций

---

## 📖 Документация по назначению

### Для новичков 🌱

**Начните здесь:** [README2.md](./README2.md)

Объясняет простым языком:
- Что такое компоненты, хуки, API
- Как работает Next.js и React
- Структура проекта
- Основные концепции
- Глоссарий терминов

### Для разработчиков 👨‍💻

**Техническая документация:** [README.md](./README.md)

Содержит:
- Возможности платформы
- Технологический стек
- Структура проекта
- Команды и скрипты
- Инструкции по деплою

### Для настройки 🔧

**Детальная настройка:** [SETUP.md](./SETUP.md)

Включает:
- Установка PostgreSQL
- Настройка базы данных
- Генерация ключей
- Seed данные
- Решение проблем

**Настройка платежей:** [YOOKASSA_SETUP.md](./YOOKASSA_SETUP.md)

Включает:
- Регистрация в ЮKassa
- Получение API ключей
- Настройка webhook
- Тестовые карты
- Безопасность

### Для деплоя 🚢

**Руководство по деплою:** [DEPLOYMENT.md](./DEPLOYMENT.md)

Содержит:
- Чеклист перед деплоем
- Деплой на Vercel
- Настройка БД (продакшен)
- Оптимизация производительности
- SEO настройки
- Мониторинг и аналитика
- Безопасность (CSP, CORS, Rate Limiting)

### Для обзора проекта 📊

**Итоговый отчет:** [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

Включает:
- Статистика проекта
- Архитектура
- Реализованные функции
- Что можно добавить
- Метрики качества
- Коммерческая оценка

---

## 🗂️ Структура кода

### Ключевые директории

```
src/
├── app/                # Страницы и API routes
├── components/         # React компоненты
├── lib/               # Утилиты и клиенты
├── hooks/             # Custom hooks
└── types/             # TypeScript типы
```

### Главные файлы

| Файл | Назначение |
|------|-----------|
| `src/middleware.ts` | Защита маршрутов |
| `prisma/schema.prisma` | Схема БД |
| `src/lib/auth/config.ts` | Настройки аутентификации |
| `src/lib/ai/replicate.ts` | Клиент Replicate |
| `src/lib/payment/yookassa.ts` | Клиент ЮKassa |

---

## 📄 Основные страницы

| URL | Файл | Описание |
|-----|------|---------|
| `/` | `app/page.tsx` | Главная страница |
| `/generate` | `app/generate/page.tsx` | AI Генератор |
| `/edit` | `app/edit/page.tsx` | Редактор изображений |
| `/templates` | `app/templates/page.tsx` | Библиотека шаблонов |
| `/subscription` | `app/subscription/page.tsx` | Тарифные планы |
| `/admin` | `app/admin/page.tsx` | Админ-дашборд |
| `/admin/users` | `app/admin/users/page.tsx` | Управление пользователями |

---

## 🔌 API Routes

### Аутентификация
- `POST /api/auth/[...nextauth]` — NextAuth
- `POST /api/auth/register` — Регистрация

### Генерация
- `POST /api/generate` — Создать генерацию
- `GET /api/generate` — История

### Шаблоны
- `GET /api/templates` — Список
- `POST /api/templates` — Создать
- `GET /api/templates/[id]` — По ID
- `PUT /api/templates/[id]` — Обновить
- `DELETE /api/templates/[id]` — Удалить

### Подписки
- `POST /api/subscription/create` — Создать платеж
- `POST /api/subscription/webhook` — Webhook
- `GET /api/subscription/status` — Статус

### Админ
- `GET /api/admin/stats` — Статистика
- `GET /api/admin/users` — Пользователи
- `PATCH /api/admin/users/[id]` — Обновить
- `DELETE /api/admin/users/[id]` — Удалить

---

## 🎨 UI Компоненты

### shadcn/ui компоненты (`components/ui/`)
- Button, Card, Input, Textarea
- Label, Select, Dialog

### Кастомные компоненты
- `navbar.tsx` — Навигация
- `theme-toggle.tsx` — Переключатель темы
- `generator/generation-form.tsx` — Форма генератора
- `editor/image-editor.tsx` — Редактор
- `templates/template-card.tsx` — Карточка шаблона
- `subscription/pricing-card.tsx` — Карточка тарифа
- `admin/stat-card.tsx` — Карточка статистики

---

## 🔑 Получение API ключей

### Replicate (Stable Diffusion)
1. Регистрация: https://replicate.com
2. Account → API Tokens
3. Create Token
4. Бесплатно: 100 запросов/месяц

### OpenAI (DALL-E 3)
1. Регистрация: https://platform.openai.com
2. API Keys → Create new secret key
3. Бонус: $5 при регистрации

### ЮKassa (платежи)
1. Регистрация: https://yookassa.ru
2. Настройки → Интеграция
3. Требуется: ИП или ООО
4. Модерация: 1-3 дня

---

## 🎓 Обучающие материалы

### Официальная документация
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [Prisma](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://authjs.dev)

### Видео-туториалы
- Next.js 15 App Router
- Prisma ORM
- Fabric.js
- ЮKassa интеграция

---

## 💡 Советы

### Для начинающих
1. Начните с чтения [README2.md](./README2.md)
2. Запустите проект локально ([QUICKSTART.md](./QUICKSTART.md))
3. Изучите один компонент за раз
4. Экспериментируйте и ломайте код — это нормально!

### Для опытных
1. Изучите архитектуру в [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Настройте продакшен окружение ([DEPLOYMENT.md](./DEPLOYMENT.md))
3. Добавьте недостающие функции
4. Оптимизируйте производительность

---

## 🤝 Поддержка

Если что-то непонятно:
1. Проверьте соответствующий .md файл
2. Посмотрите код примеров
3. Создайте Issue
4. Спросите в сообществе

---

**Приятной разработки! 🚀**

