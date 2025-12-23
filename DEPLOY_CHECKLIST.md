# ✅ Чеклист деплоя на Vercel

## Перед деплоем

### 1. Локальная проверка
- [x] `npm install` - установлены все зависимости
- [x] `npm run build` - проект собирается без ошибок
- [x] `npm run dev` - проект работает локально
- [ ] Все функции протестированы

### 2. Git репозиторий
- [x] Проект в GitHub
- [x] `.gitignore` настроен
- [x] Sensitive данные не закоммичены
- [x] Последние изменения запушены

### 3. Конфигурация
- [x] `vercel.json` создан
- [x] `package.json` корректен
- [x] Prisma schema актуален
- [ ] Environment variables документированы

---

## Настройка Vercel

### 1. Импорт проекта
- [ ] Залогиниться в Vercel через GitHub
- [ ] Импортировать репозиторий `ai_platform`
- [ ] Framework: Next.js (auto-detected)
- [ ] Root Directory: `./`
- [ ] Build Command: `prisma generate && next build`

### 2. Environment Variables (КРИТИЧНО!)

#### Обязательные:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Сгенерировать: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Домен вашего приложения (добавить после первого деплоя)

#### AI Services (минимум один):
- [ ] `OPENAI_API_KEY` - для DALL-E 3
- [ ] `REPLICATE_API_TOKEN` - для Stable Diffusion

#### Опциональные:
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` - OAuth
- [ ] `YOOKASSA_SHOP_ID` + `YOOKASSA_SECRET_KEY` - Платежи
- [ ] `CLOUDINARY_*` - Облачное хранилище
- [ ] `RESEND_API_KEY` - Email сервис

### 3. Настройка базы данных

Выберите один вариант:

#### Вариант A: Vercel Postgres (рекомендуется)
- [ ] Storage → Create Database → Postgres
- [ ] Подключить к проекту
- [ ] `DATABASE_URL` добавится автоматически

#### Вариант B: Neon (бесплатный)
- [ ] Создать проект на https://neon.tech
- [ ] Скопировать Connection String
- [ ] Добавить как `DATABASE_URL`

#### Вариант C: Supabase
- [ ] Создать проект на https://supabase.com
- [ ] Settings → Database → Connection pooling
- [ ] Добавить как `DATABASE_URL`

---

## После первого деплоя

### 1. Применить миграции Prisma

```bash
# Получить env variables локально
npx vercel env pull .env.production

# Применить миграции
DATABASE_URL="..." npx prisma migrate deploy
```

Или через Vercel Dashboard → Deployments → Settings → Add script

### 2. Обновить NEXTAUTH_URL

- [ ] Скопировать URL деплоя (например: `https://ai-platform-xxx.vercel.app`)
- [ ] Обновить `NEXTAUTH_URL` в Environment Variables
- [ ] Redeploy проекта

### 3. Создать admin пользователя

```bash
# Подключиться к production БД
DATABASE_URL="..." node make-admin.js admin@example.com
```

---

## Проверка функциональности

После деплоя протестируйте:

### Критичные функции:
- [ ] Главная страница загружается
- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Генерация изображений работает
- [ ] Редактор загружается и работает
- [ ] Профиль доступен
- [ ] Подписки работают

### Дополнительные функции:
- [ ] Email верификация (если настроен Resend)
- [ ] Сброс пароля
- [ ] Batch генерация
- [ ] Cloudinary экспорт (если настроен)
- [ ] API endpoints работают

---

## Google OAuth настройка

Если используете Google вход:

1. Перейдите в Google Cloud Console
2. APIs & Services → Credentials
3. Создайте OAuth 2.0 Client ID
4. Authorized redirect URIs добавьте:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
5. Добавьте `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` в Vercel

---

## Custom Domain

### Добавление домена:

1. Vercel Dashboard → Settings → Domains
2. Добавьте ваш домен
3. Настройте DNS записи у вашего регистратора:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Обновите `NEXTAUTH_URL` на новый домен
5. Обновите Google OAuth redirect URIs

---

## Мониторинг

### Включите аналитику:

- [ ] Vercel Analytics (Settings → Analytics)
- [ ] Vercel Speed Insights
- [ ] Error tracking (Sentry)

### Проверяйте логи:

```bash
# Через CLI
vercel logs

# Или в Dashboard → Deployments → Logs
```

---

## Типичные проблемы и решения

### "Invalid environment variable: DATABASE_URL"
**Причина:** Некорректная строка подключения  
**Решение:** Проверьте формат PostgreSQL URL с SSL

### "NextAuth configuration error"
**Причина:** `NEXTAUTH_URL` не установлен  
**Решение:** Добавьте URL вашего Vercel деплоя

### "Prisma Client not found"
**Причина:** prisma generate не выполнился  
**Решение:** Проверьте Build Command: `prisma generate && next build`

### "API route timeout"
**Причина:** AI генерация занимает > 10 секунд  
**Решение:** Увеличьте timeout в vercel.json (уже настроено: 60s)

### "Build failed with unknown error"
**Причина:** Нехватка памяти или timeout  
**Решение:** 
- Проверьте размер node_modules
- Удалите неиспользуемые зависимости
- Upgrade Vercel plan если нужно

---

## Production Best Practices

### Безопасность:
- ✅ Используйте сильные секретные ключи
- ✅ Включите HTTPS (Vercel по умолчанию)
- ✅ Настройте CORS правильно
- ✅ Rate limiting для API
- ✅ Валидация всех inputs

### Performance:
- ✅ Next.js Image оптимизация (используется)
- ✅ Кэширование статики (Vercel автоматически)
- ✅ Lazy loading компонентов
- ✅ Database connection pooling

### Мониторинг:
- [ ] Настройте Sentry для ошибок
- [ ] Включите Vercel Analytics
- [ ] Настройте uptime monitoring
- [ ] Отслеживайте API usage

---

## Обновление production

### Автоматический деплой:

При каждом push в `main` ветку Vercel автоматически:
1. Делает новый билд
2. Прогоняет тесты
3. Деплоит на production

### Ручной деплой:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel автоматически задеплоит
```

### Откат (если что-то сломалось):

1. Vercel Dashboard → Deployments
2. Найдите последний рабочий деплой
3. Нажмите "..." → Promote to Production

---

## Масштабирование

Когда проект вырастет:

1. **Database:** Upgrade план Neon/Supabase
2. **Vercel:** Upgrade на Pro ($20/месяц)
3. **AI API:** Проверяйте лимиты и баланс
4. **CDN:** Используйте Cloudinary для изображений
5. **Caching:** Redis для кэширования (Vercel KV)

---

## Поддержка

Если возникли проблемы:

1. Проверьте логи: `vercel logs`
2. Vercel Support: https://vercel.com/support
3. Next.js Docs: https://nextjs.org/docs
4. Prisma Docs: https://www.prisma.io/docs

---

## 🎉 Готово!

Следуйте этому чеклисту и ваш AI Image Platform будет работать на production!

**Текущий статус:** ✅ Все файлы готовы, изменения запушены в GitHub

**Следующий шаг:** Импортируйте проект в Vercel и настройте Environment Variables

