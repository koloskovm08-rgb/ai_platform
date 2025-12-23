# Инструкция по настройке проекта

## Шаг 1: Установка зависимостей

```bash
npm install
```

Это установит все необходимые библиотеки из `package.json`.

## Шаг 2: Настройка базы данных

### Вариант А: PostgreSQL (рекомендуется для продакшена)

1. Установите PostgreSQL на вашем компьютере:
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt install postgresql`

2. Создайте базу данных:

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE ai_platform;

# Создайте пользователя (опционально)
CREATE USER ai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_platform TO ai_user;

# Выйдите
\q
```

3. Скопируйте `env.example.txt` в `.env.local` и обновите `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ai_platform"
```

### Вариант Б: SQLite (для разработки и тестирования)

Если PostgreSQL сложно настроить, можно использовать SQLite:

1. В файле `prisma/schema.prisma` измените:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. В `.env.local`:

```env
DATABASE_URL="file:./dev.db"
```

## Шаг 3: Генерация секретного ключа для NextAuth

```bash
# На Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# На Mac/Linux
openssl rand -base64 32
```

Скопируйте результат и добавьте в `.env.local`:

```env
NEXTAUTH_SECRET="ваш_сгенерированный_ключ"
```

## Шаг 4: Запуск миграций Prisma

```bash
# Создать миграцию и применить ее
npx prisma migrate dev --name init

# Сгенерировать Prisma Client
npx prisma generate
```

Эта команда:
- Создаст все таблицы в базе данных
- Сгенерирует TypeScript типы для работы с БД

## Шаг 5: (Опционально) Заполнение тестовыми данными

Создайте файл `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Создать тестового админа
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Запустите:

```bash
npx tsx prisma/seed.ts
```

## Шаг 6: Запуск сервера разработки

```bash
npm run dev
```

Откройте http://localhost:3000

## Шаг 7: Просмотр базы данных (Prisma Studio)

```bash
npx prisma studio
```

Откроется веб-интерфейс для просмотра и редактирования данных БД.

## Возможные проблемы

### Ошибка подключения к БД

Проверьте:
- Запущен ли PostgreSQL (`sudo service postgresql status`)
- Правильный ли `DATABASE_URL` в `.env.local`
- Существует ли база данных

### Ошибки при миграции

Удалите папку `prisma/migrations` и запустите заново:

```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### Ошибка "Module not found"

Очистите кэш и переустановите зависимости:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Следующие шаги

После успешного запуска можно переходить к:
- Созданию страниц входа/регистрации
- Интеграции AI API
- Созданию генератора изображений

Удачи! 🚀

