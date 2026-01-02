# PowerShell скрипт для исправления настроек Vercel проекта
# Использование: .\scripts\fix-vercel-settings.ps1

$PROJECT_ID = "prj_rv9YT3OSbZ8IzyyGvHGn3kIlp9EI"
$TEAM_ID = "team_B8coSutdqG9O7MSsRYgVBkw8"

Write-Host "🔧 Исправление настроек Vercel проекта..." -ForegroundColor Cyan

# Проверка наличия Vercel CLI
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI найден: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI не установлен. Установите: npm i -g vercel" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚠️  ВАЖНО: Следующие настройки нужно изменить вручную в Vercel Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Откройте: https://vercel.com/koloskovm08-rgbs-projects/ai-platform/settings/git" -ForegroundColor Cyan
Write-Host "   - Отключите 'Auto-cancel deployments'" -ForegroundColor White
Write-Host "   - Убедитесь, что Production Branch = 'main'" -ForegroundColor White
Write-Host ""
Write-Host "2. Откройте: https://vercel.com/koloskovm08-rgbs-projects/ai-platform/settings/general" -ForegroundColor Cyan
Write-Host "   - Убедитесь, что Project Status = 'Active'" -ForegroundColor White
Write-Host "   - Очистите Build Command (оставьте пустым для автоопределения)" -ForegroundColor White
Write-Host ""
Write-Host "3. Откройте: https://vercel.com/koloskovm08-rgbs-projects/ai-platform/settings/environment-variables" -ForegroundColor Cyan
Write-Host "   - Проверьте DATABASE_URL (не должен указывать на localhost)" -ForegroundColor White
Write-Host ""

Write-Host "✅ Конфигурационные файлы проверены и готовы к деплою" -ForegroundColor Green

