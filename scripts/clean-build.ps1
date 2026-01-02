# Скрипт для очистки перед сборкой
# Использование: .\scripts\clean-build.ps1

Write-Host "🧹 Очистка директорий перед сборкой..." -ForegroundColor Cyan

# Удаляем .next директорию
if (Test-Path ".next") {
    Write-Host "Удаление .next..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ .next удалена" -ForegroundColor Green
} else {
    Write-Host "✅ .next не существует" -ForegroundColor Green
}

# Удаляем node_modules/.cache если существует
if (Test-Path "node_modules\.cache") {
    Write-Host "Удаление node_modules/.cache..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ node_modules/.cache удалена" -ForegroundColor Green
}

# Проверяем запущенные Node процессы
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️  Обнаружены запущенные Node.js процессы:" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object { Write-Host "  - PID: $($_.Id)" -ForegroundColor Gray }
    Write-Host "💡 Рекомендуется остановить dev сервер перед сборкой" -ForegroundColor Yellow
} else {
    Write-Host "✅ Node.js процессы не обнаружены" -ForegroundColor Green
}

Write-Host "`n✨ Очистка завершена! Можно запускать npm run build" -ForegroundColor Cyan

