# Environment variables example (PostgreSQL)

Скопируй блок ниже в файл `.env.local` в корне проекта и замени значения на свои.

```env
# --- Database (PostgreSQL) ---
# Формат: postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/artigen?schema=public"

# --- Auth (NextAuth v5 / Auth.js) ---
NEXTAUTH_URL="http://localhost:3000"
# Укажи ОДИН из секретов (32+ символов):
AUTH_SECRET="replace-with-a-32+char-random-secret"
# NEXTAUTH_SECRET="replace-with-a-32+char-random-secret"

# --- OAuth providers (optional) ---
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# VK_CLIENT_ID=""
# VK_CLIENT_SECRET=""

# --- Optional ---
# CRON_SECRET=""
# NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```


