-- Скрипт для SQL Server Management Studio (SSMS)
-- Команда Т-392 | Электронный журнал

-- 1. Открой SSMS → Подключиться к серверу (см. docs/SSMS_SETUP.md)
-- 2. File → New → Query
-- 3. Выполни этот скрипт (F5)

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'Gradebook')
BEGIN
    CREATE DATABASE Gradebook;
END
GO

USE Gradebook;
GO

-- Таблицы создаёт Prisma Migrate (команда: npx prisma migrate dev)
-- После миграции тестовые данные: npm run db:seed

PRINT N'База Gradebook готова. Дальше в терминале:';
PRINT N'  cd backend';
PRINT N'  npx prisma migrate dev --name init';
PRINT N'  npm run db:seed';
