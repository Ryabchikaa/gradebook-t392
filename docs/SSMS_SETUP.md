# Настройка через SQL Server Management Studio (SSMS)

Инструкция для команды **Т-392**.

## 1. Установка

1. Скачай **SQL Server Express** (бесплатно):  
   https://www.microsoft.com/sql-server/sql-server-downloads  
   → выбери *Express* → *Download now* → *Basic*

2. Скачай **SQL Server Management Studio (SSMS)**:  
   https://aka.ms/ssmsfullsetup

3. Установи оба. При установке SQL Server запомни пароль пользователя **sa** (если выберешь смешанную аутентификацию).

## 2. Подключение в SSMS

1. Запусти **SQL Server Management Studio**
2. Окно подключения:
   - **Server name:** `localhost\SQLEXPRESS`  
     (или `(localdb)\MSSQLLocalDB` если ставил LocalDB)
   - **Authentication:** Windows Authentication (проще) или SQL Server Authentication (логин `sa`)
3. Нажми **Connect**

## 3. Создать базу данных

1. **File → New → Query**
2. Открой файл `database/init.sql` из проекта (или вставь):

```sql
CREATE DATABASE Gradebook;
GO
```

3. Нажми **F5** (Execute)
4. В обозревателе слева: **Databases → Gradebook** — база появилась

## 4. Настроить backend

```bash
cd backend
copy .env.example .env
```

Отредактируй `.env` — выбери **один** вариант:

### Вариант A — Windows Authentication (рекомендуется на учебных ПК)

```env
DATABASE_URL="sqlserver://localhost\\SQLEXPRESS;database=Gradebook;integratedSecurity=true;trustServerCertificate=true"
```

### Вариант B — SQL Server Authentication (логин sa)

```env
DATABASE_URL="sqlserver://localhost:1433;database=Gradebook;user=sa;password=ТВОЙ_ПАРОЛЬ;encrypt=true;trustServerCertificate=true"
```

### Вариант C — LocalDB

```env
DATABASE_URL="sqlserver://(localdb)\\MSSQLLocalDB;database=Gradebook;integratedSecurity=true;trustServerCertificate=true"
```

## 5. Создать таблицы и данные

В терминале (не в SSMS):

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## 6. Проверка в SSMS

1. **Databases → Gradebook → Tables**
2. Должны появиться таблицы: `User`, `StudyGroups`, `Subject`, `Grade`, и т.д.
3. ПКМ на `User` → **Select Top 1000 Rows** — увидишь тестовых пользователей

## Тестовые логины в приложении

| Роль | Email | Пароль |
|------|-------|--------|
| Преподаватель | teacher@university.ru | password123 |
| Студент | student1@university.ru | password123 |

Группа в БД: **Т-392**

## Частые проблемы

| Ошибка | Решение |
|--------|---------|
| Cannot connect to server | Проверь что служба *SQL Server (SQLEXPRESS)* запущена (services.msc) |
| Login failed for user 'sa' | Включи SQL Authentication в SSMS: Server → Properties → Security |
| Prisma P1001 | Неверный `DATABASE_URL` в `.env` |
| `Group` is keyword | В проекте таблица называется `StudyGroups` — это нормально |

## Кто в команде за это отвечает

**Ковальчук Вадим** (Backend) — настраивает SSMS, миграции, показывает таблицы на защите.
