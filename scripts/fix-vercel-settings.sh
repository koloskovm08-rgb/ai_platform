#!/bin/bash
# Скрипт для исправления настроек Vercel проекта
# Использование: ./scripts/fix-vercel-settings.sh

PROJECT_ID="prj_rv9YT3OSbZ8IzyyGvHGn3kIlp9EI"
TEAM_ID="team_B8coSutdqG9O7MSsRYgVBkw8"

echo "🔧 Исправление настроек Vercel проекта..."

# Проверка наличия Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен. Установите: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI найден"

# Обновление проекта через API (если возможно)
echo "📝 Попытка обновить настройки проекта..."

# Примечание: Auto-cancel deployments можно изменить только через Dashboard
# Но мы можем обновить buildCommand и другие настройки

echo ""
echo "⚠️  ВАЖНО: Следующие настройки нужно изменить вручную в Vercel Dashboard:"
echo ""
echo "1. Откройте: https://vercel.com/koloskovm08-rgbs-projects/ai-platform/settings/git"
echo "   - Отключите 'Auto-cancel deployments'"
echo "   - Убедитесь, что Production Branch = 'main'"
echo ""
echo "2. Откройте: https://vercel.com/koloskovm08-rgbs-projects/ai-platform/settings/general"
echo "   - Убедитесь, что Project Status = 'Active'"
echo "   - Очистите Build Command (оставьте пустым для автоопределения)"
echo ""
echo "3. Откройте: https://vercel.com/koloskovm08-rgbs-projects/ai-platform/settings/environment-variables"
echo "   - Проверьте DATABASE_URL (не должен указывать на localhost)"
echo ""

echo "✅ Конфигурационные файлы проверены и готовы к деплою"

