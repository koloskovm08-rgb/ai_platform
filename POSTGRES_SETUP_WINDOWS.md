# PostgreSQL на Windows (самый простой старт через Docker)

Эта инструкция поможет поднять **PostgreSQL** локально и подключить его к проекту (**Prisma + Next.js**).

---

## 1) Установи Docker Desktop

- Установи Docker Desktop для Windows и перезагрузи ПК при необходимости.
- Проверь, что Docker запущен: в трее должен быть значок Docker.

---

## 2) Запусти PostgreSQL контейнер

Открой PowerShell в корне проекта и выполни:

```bash
docker run --name artigen-postgres ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_DB=artigen ^
  -p 5432:5432 ^
  -v artigen_pgdata:/var/lib/postgresql/data ^
  -d postgres:16
```

Если контейнер уже создан и ты его остановил ранее:

```bash
docker start artigen-postgres
```

Проверка что всё ок (контейнер должен быть в статусе `Up`):

```bash
docker ps
```

---

## 3) Создай `.env.local`

В корне проекта создай файл `.env.local` (рядом с `package.json`) и добавь:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/artigen?schema=public"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="replace-with-a-32+char-random-secret"
```

Где взять секрет:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Скопируй результат и вставь в `AUTH_SECRET`.

---

## 4) Применить миграции Prisma

В корне проекта:

```bash
npx prisma migrate dev
```

Открыть Prisma Studio (удобно смотреть таблицы):

```bash
npx prisma studio
```

---

## 5) Быстрая проверка (health endpoint)

Запусти dev-сервер:

```bash
npm run dev
```

Открой health endpoint:

- `http://localhost:3000/api/health`

Если БД подключена, ты увидишь `database: "connected"`.

---

## Частые ошибки

### Ошибка: port 5432 already in use
Значит Postgres уже установлен на ПК и занял порт.

Варианты:
- Остановить локальный Postgres сервис, или
- Запустить Docker Postgres на другом порту, например `-p 5433:5432`, и поменять `DATABASE_URL` на `...@localhost:5433/...`.

### Ошибка: Prisma не видит DATABASE_URL
Чаще всего забыли перезапустить `npm run dev` после правок `.env.local`.

---

Если хочешь — в следующем шаге сделаем `docker-compose.yml`, чтобы запускать Postgres одной командой (удобнее, чем `docker run`).


