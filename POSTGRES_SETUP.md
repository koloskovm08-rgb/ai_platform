# 🐘 Настройка PostgreSQL для проекта

## Вариант 1: Локальная установка PostgreSQL

### Шаг 1: Установка PostgreSQL

1. **Скачайте установщик:**
   - Перейдите на https://www.postgresql.org/download/windows/
   - Скачайте установщик (рекомендуется версия 15 или 16)
   - Запустите установщик

2. **Во время установки:**
   - Выберите все компоненты (особенно "Command Line Tools")
   - Порт: оставьте **5432** (по умолчанию)
   - Пароль для пользователя `postgres`: **запомните этот пароль!**
   - Локаль: можно оставить по умолчанию

3. **После установки:**
   - PostgreSQL будет запускаться автоматически при загрузке Windows
   - Проверьте, что служба запущена: `Win + R` → `services.msc` → найдите "postgresql"

### Шаг 2: Создание базы данных

Откройте PowerShell или командную строку и выполните:

```powershell
# Войдите в PostgreSQL (введите пароль, который указали при установке)
psql -U postgres

# В консоли PostgreSQL выполните:
CREATE DATABASE ai_platform;

# (Опционально) Создайте отдельного пользователя:
CREATE USER ai_user WITH PASSWORD 'ваш_пароль';
GRANT ALL PRIVILEGES ON DATABASE ai_platform TO ai_user;

# Выйдите из psql:
\q
```

### Шаг 3: Настройка .env.local

Создайте или обновите файл `.env.local` в корне проекта:

```env
# База данных PostgreSQL
DATABASE_URL="postgresql://postgres:ваш_пароль@localhost:5432/ai_platform"

# Или если создали отдельного пользователя:
# DATABASE_URL="postgresql://ai_user:ваш_пароль@localhost:5432/ai_platform"

# NextAuth настройки
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production-minimum-32-chars"
```

### Шаг 4: Применение миграций

```powershell
# Сгенерировать Prisma Client
npx prisma generate

# Применить миграции
npx prisma migrate dev --name init
```

---

## Вариант 2: Облачная база данных (Supabase)

### Шаг 1: Создание проекта

1. Зайдите на https://supabase.com
2. Создайте аккаунт (можно через GitHub)
3. Создайте новый проект:
   - Название: `ai-platform`
   - Пароль базы данных: **запомните его!**
   - Регион: выберите ближайший

### Шаг 2: Получение строки подключения

1. В проекте Supabase перейдите в **Settings** → **Database**
2. Найдите секцию **Connection string**
3. Выберите **URI** и скопируйте строку
4. Замените `[YOUR-PASSWORD]` на ваш пароль

Пример:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### Шаг 3: Настройка .env.local

```env
# База данных Supabase
DATABASE_URL="postgresql://postgres.xxxxx:ваш_пароль@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# NextAuth настройки
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production-minimum-32-chars"
```

### Шаг 4: Применение миграций

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

---

## Вариант 3: Облачная база данных (Neon)

### Шаг 1: Создание проекта

1. Зайдите на https://neon.tech
2. Создайте аккаунт (можно через GitHub)
3. Создайте новый проект:
   - Название: `ai-platform`
   - Пароль: **запомните его!**

### Шаг 2: Получение строки подключения

1. В проекте Neon нажмите **Connection Details**
2. Скопируйте строку подключения (Connection string)

Пример:
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Шаг 3: Настройка .env.local

```env
# База данных Neon
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# NextAuth настройки
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production-minimum-32-chars"
```

### Шаг 4: Применение миграций

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

---

## ✅ Проверка подключения

После настройки проверьте подключение:

```powershell
# Проверить подключение через Prisma Studio
npx prisma studio
```

Если всё работает, откроется веб-интерфейс для просмотра базы данных.

---

## 🐛 Решение проблем

### Ошибка: "password authentication failed"
- Проверьте правильность пароля в `DATABASE_URL`
- Убедитесь, что используете правильного пользователя

### Ошибка: "database does not exist"
- Убедитесь, что база данных создана
- Проверьте название базы данных в `DATABASE_URL`

### Ошибка: "connection refused"
- Проверьте, что PostgreSQL запущен (для локальной установки)
- Проверьте порт (должен быть 5432)
- Для облачных БД проверьте, что строка подключения правильная

### Ошибка: "relation does not exist"
- Примените миграции: `npx prisma migrate dev`

---

## 📚 Полезные команды

```powershell
# Открыть Prisma Studio (веб-интерфейс для БД)
npx prisma studio

# Применить миграции
npx prisma migrate dev

# Сбросить базу данных (ОПАСНО - удалит все данные!)
npx prisma migrate reset

# Сгенерировать Prisma Client
npx prisma generate

# Посмотреть статус миграций
npx prisma migrate status
```

---

**Готово!** После настройки базы данных запустите проект:

```powershell
npm run dev
```

Откройте http://localhost:3000

