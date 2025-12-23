# 🔐 Environment Variables Template

**Скопируйте этот файл в `.env.local` и заполните значения**

```env
# ============================================
# AI Image Platform - Environment Variables
# ============================================
# НИКОГДА НЕ КОММИТЬТЕ .env.local в Git!

# ============================================
# 🗄️ БАЗА ДАННЫХ (обязательно)
# ============================================

# PostgreSQL Connection String
# Формат: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
# Для продакшена используйте Vercel Postgres, Supabase или Neon
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_platform"

# ============================================
# 🔐 NEXTAUTH (обязательно)
# ============================================

# URL вашего приложения
NEXTAUTH_URL="http://localhost:3000"

# Секретный ключ для шифрования JWT токенов
# Сгенерируйте через: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here-generate-new-one"

# ============================================
# 🤖 AI ГЕНЕРАЦИЯ (обязательно хотя бы один)
# ============================================

# Replicate API Token (для Stable Diffusion)
# Получить: https://replicate.com/account/api-tokens
REPLICATE_API_TOKEN=""

# OpenAI API Key (для DALL-E 3)
# Получить: https://platform.openai.com/api-keys
OPENAI_API_KEY=""

# ============================================
# 💳 ПЛАТЕЖИ - ЮKassa (опционально)
# ============================================

YOOKASSA_SHOP_ID=""
YOOKASSA_SECRET_KEY=""

# ============================================
# 🔑 GOOGLE OAUTH (опционально)
# ============================================

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ============================================
# ☁️ CLOUDINARY (опционально)
# ============================================

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# ============================================
# 🌐 ПУБЛИЧНЫЕ ПЕРЕМЕННЫЕ
# ============================================

NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## 📋 Подробное описание переменных

### Обязательные переменные

| Переменная | Описание | Где получить |
|------------|----------|--------------|
| `DATABASE_URL` | Строка подключения к PostgreSQL | Vercel Postgres, Supabase, Neon |
| `NEXTAUTH_URL` | URL вашего приложения | `http://localhost:3000` (dev)<br>`https://your-domain.vercel.app` (prod) |
| `NEXTAUTH_SECRET` | Секретный ключ для JWT | `openssl rand -base64 32` |
| `REPLICATE_API_TOKEN` или `OPENAI_API_KEY` | API ключи для AI генерации | replicate.com или openai.com |

### Опциональные переменные

| Переменная | Описание | Нужно для |
|------------|----------|-----------|
| `YOOKASSA_SHOP_ID` | ID магазина ЮKassa | Платежи/подписки |
| `YOOKASSA_SECRET_KEY` | Секретный ключ ЮKassa | Платежи/подписки |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Вход через Google |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | Вход через Google |
| `CLOUDINARY_*` | Настройки Cloudinary | Загрузка изображений |

## 🔧 Генерация секретных ключей

### Linux/Mac:
```bash
openssl rand -base64 32
```

### Windows PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 Настройка для Vercel

1. Зайдите в Settings → Environment Variables
2. Добавьте все переменные из списка выше
3. **Важно для продакшена:**
   - Используйте НОВЫЙ `NEXTAUTH_SECRET` (не тот же, что в dev)
   - Обновите `NEXTAUTH_URL` на ваш домен
   - Используйте продакшн DATABASE_URL

## ⚠️ Безопасность

- ✅ Никогда не коммитьте `.env.local` в Git
- ✅ Используйте разные ключи для dev/production
- ✅ Регулярно ротируйте API ключи
- ✅ Не храните секреты в коде
- ✅ Используйте `.gitignore` для `.env*` файлов

## 📚 Дополнительная документация

- [Настройка ЮKassa](./YOOKASSA_SETUP.md)
- [Руководство по деплою](./DEPLOYMENT.md)
- [Общая настройка](./SETUP.md)

