#!/bin/bash
# Применяем миграции базы данных перед запуском приложения
echo "🔄 Applying database migrations..."
npx prisma migrate deploy

echo "✅ Migrations applied successfully"
echo "🚀 Starting Next.js application..."

# Запускаем Next.js
npm run start:next

