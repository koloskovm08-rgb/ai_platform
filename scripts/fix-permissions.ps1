# Скрипт для исправления проблем с правами доступа
# Использование: .\scripts\fix-permissions.ps1

Write-Host "🔧 Исправление проблем с правами доступа..." -ForegroundColor Cyan

# Проверяем, запущен ли от администратора
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Скрипт не запущен от имени администратора" -ForegroundColor Yellow
    Write-Host "💡 Для полного исправления запустите PowerShell от имени администратора" -ForegroundColor Yellow
}

# Удаляем .next директорию
Write-Host "`n🧹 Очистка директории .next..." -ForegroundColor Cyan
if (Test-Path ".next") {
    try {
        Remove-Item -Path ".next" -Recurse -Force -ErrorAction Stop
        Write-Host "✅ .next удалена успешно" -ForegroundColor Green
    } catch {
        Write-Host "❌ Ошибка при удалении .next: $_" -ForegroundColor Red
        Write-Host "💡 Попробуйте закрыть все программы, использующие эту директорию" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ .next не существует" -ForegroundColor Green
}

# Проверяем запущенные Node.js процессы
Write-Host "`n🔍 Проверка запущенных Node.js процессов..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️  Обнаружено $($nodeProcesses.Count) запущенных Node.js процессов:" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object { 
        Write-Host "  - PID: $($_.Id) | Path: $($_.Path)" -ForegroundColor Gray 
    }
    Write-Host "`n💡 Рекомендуется остановить dev сервер перед сборкой" -ForegroundColor Yellow
    Write-Host "   Нажмите Ctrl+C в терминале, где запущен npm run dev" -ForegroundColor Yellow
} else {
    Write-Host "✅ Node.js процессы не обнаружены" -ForegroundColor Green
}

# Проверяем файловую систему
Write-Host "`n💾 Проверка файловой системы..." -ForegroundColor Cyan
$drive = (Get-Location).Drive
$volume = Get-Volume -DriveLetter $drive.Name -ErrorAction SilentlyContinue
if ($volume) {
    Write-Host "Диск: $($drive.Name):" -ForegroundColor White
    Write-Host "Файловая система: $($volume.FileSystemType)" -ForegroundColor White
    
    if ($volume.FileSystemType -eq "exFAT") {
        Write-Host "`n⚠️  ВНИМАНИЕ: Диск использует exFAT!" -ForegroundColor Red
        Write-Host "   exFAT не поддерживает symlinks так же хорошо, как NTFS" -ForegroundColor Yellow
        Write-Host "   Это может вызывать ошибки EISDIR и EPERM" -ForegroundColor Yellow
        Write-Host "`n💡 РЕКОМЕНДАЦИЯ: Переместите проект на диск C: (обычно NTFS)" -ForegroundColor Cyan
        Write-Host "   Команда для копирования:" -ForegroundColor Gray
        Write-Host "   Copy-Item -Path '$(Get-Location)' -Destination 'C:\Projects\sait-ai' -Recurse" -ForegroundColor Gray
    } elseif ($volume.FileSystemType -eq "NTFS") {
        Write-Host "✅ Файловая система NTFS - должна работать нормально" -ForegroundColor Green
    }
}

# Проверяем права доступа
Write-Host "`n🔐 Проверка прав доступа..." -ForegroundColor Cyan
try {
    $testPath = Join-Path (Get-Location) ".next-test"
    New-Item -ItemType Directory -Path $testPath -Force -ErrorAction Stop | Out-Null
    Remove-Item -Path $testPath -Force -ErrorAction Stop
    Write-Host "✅ Права на создание директорий: OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка при создании директории: $_" -ForegroundColor Red
    Write-Host "💡 Попробуйте запустить PowerShell от имени администратора" -ForegroundColor Yellow
}

Write-Host "`n✨ Проверка завершена!" -ForegroundColor Cyan
Write-Host "`n📝 Следующие шаги:" -ForegroundColor Cyan
Write-Host "   1. Убедитесь, что dev сервер остановлен (Ctrl+C)" -ForegroundColor White
Write-Host "   2. Если диск exFAT - переместите проект на C:" -ForegroundColor White
Write-Host "   3. Попробуйте запустить: npm run build" -ForegroundColor White

