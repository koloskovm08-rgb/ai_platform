# ⚡ Быстрый старт AI Image Platform

## За 5 минут до запуска

### Шаг 1: Установка (1 мин)

```bash
npm install
```

### Шаг 2: База данных (2 мин)

#### SQLite (проще для начала)

Измените в `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Создайте `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
```

Примените миграции:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### PostgreSQL (для продакшена)

См. [SETUP.md](./SETUP.md)

### Шаг 3: Запуск (1 мин)

```bash
npm run dev
```

Откройте: http://localhost:3000

### Шаг 4: Создание админа (1 мин)

```bash
npx prisma studio
```

1. Откроется веб-интерфейс
2. Перейдите в таблицу `users`
3. Найдите вашего пользователя
4. Измените `role` на `ADMIN`
5. Сохраните

---

## 🧪 Тестирование без API ключей

### Вариант 1: Mock данные

Закомментируйте вызовы AI API в `src/app/api/generate/route.ts`:

```typescript
// Вместо реального вызова AI
const result = {
  success: true,
  images: ['https://via.placeholder.com/1024x1024.png?text=AI+Generated'],
  model: 'STABLE_DIFFUSION',
};
```

### Вариант 2: Бесплатные альтернативы

- **Stable Diffusion:** Replicate бесплатный tier (100 запросов/мес)
- **DALL-E:** OpenAI дает $5 кредитов при регистрации

### Вариант 3: Только редактор

Используйте только `/edit` — работает без API ключей!

---

## 📝 Минимальный .env.local

Для локальной разработки достаточно:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="любая_строка_минимум_32_символа"
```

Остальные ключи опциональны:

```env
# Для генерации (опционально)
REPLICATE_API_TOKEN="получите на replicate.com"
OPENAI_API_KEY="получите на platform.openai.com"

# Для платежей (опционально)
YOOKASSA_SHOP_ID="получите на yookassa.ru"
YOOKASSA_SECRET_KEY="получите на yookassa.ru"
```

---

## 🎯 Что проверить после запуска

### Главная страница (/)

- [ ] Hero-секция отображается
- [ ] 3 карточки функций (Генерация, Редактор, Шаблоны)
- [ ] 3 тарифных плана
- [ ] Темная тема переключается
- [ ] Навигация работает
- [ ] Адаптивность (сожмите окно)

### Генератор (/generate)

- [ ] Форма отображается
- [ ] Выбор модели работает
- [ ] Пресеты загружаются
- [ ] Стили применяются
- [ ] Слайдеры работают
- [ ] (С API ключами) Генерация работает

### Редактор (/edit)

- [ ] Загрузка изображения
- [ ] Добавление текста
- [ ] Добавление фигур
- [ ] Фильтры применяются
- [ ] Undo/Redo работает
- [ ] Экспорт в PNG

### Шаблоны (/templates)

- [ ] Список шаблонов (пустой без seed)
- [ ] Фильтры работают
- [ ] Поиск работает
- [ ] Модалка открывается

### Админка (/admin)

- [ ] Доступна только админу
- [ ] Статистика отображается
- [ ] Пользователи загружаются
- [ ] Роли меняются
- [ ] Удаление работает

---

## 🐛 Частые проблемы

### "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### "Database connection error"

Проверьте `DATABASE_URL` в `.env.local`

### Страница 404

Убедитесь, что файл `page.tsx` существует в нужной папке

### Ошибки TypeScript

```bash
npm run build
```

Смотрите ошибки в консоли и исправляйте

---

## 📚 Полезные команды

```bash
# Разработка
npm run dev                    # Запустить сервер
npm run lint                   # Проверить код
npm run build                  # Собрать проект

# База данных
npx prisma studio             # Открыть GUI для БД
npx prisma migrate dev        # Создать миграцию
npx prisma generate           # Сгенерировать клиент
npx prisma migrate reset      # Сбросить БД (ОПАСНО!)

# Git
git status                    # Статус изменений
git add .                     # Добавить все файлы
git commit -m "message"       # Коммит
git push                      # Запушить
```

---

## 🎉 Готово!

Теперь у вас есть работающая AI-платформа!

**Следующие шаги:**

1. 📖 Прочитайте [README2.md](./README2.md) для понимания кода
2. 🚀 Изучите [DEPLOYMENT.md](./DEPLOYMENT.md) для деплоя
3. 💳 Настройте [YOOKASSA_SETUP.md](./YOOKASSA_SETUP.md) для платежей
4. 📊 Посмотрите [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) для overview

**Вопросы?** Создайте Issue или напишите в поддержку.

**Удачи! 🚀**

