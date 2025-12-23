-- Создание базы данных для AI Image Platform
-- Выполните этот скрипт от имени пользователя postgres

-- Создаем базу данных (если не существует)
CREATE DATABASE ai_platform;

-- (Опционально) Создаем отдельного пользователя
-- CREATE USER ai_user WITH PASSWORD 'your_password_here';
-- GRANT ALL PRIVILEGES ON DATABASE ai_platform TO ai_user;

-- Подключаемся к новой базе данных
\c ai_platform

-- Готово! Теперь можно применять миграции Prisma

