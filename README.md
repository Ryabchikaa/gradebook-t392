# Электронный журнал — группа Т-392

Веб-приложение для учёта посещаемости, оценок и лабораторных работ.

Роли: **студент** и **преподаватель**.

## Стек

- Frontend: React, TypeScript, Vite, Material UI
- Backend: Node.js, Express, TypeScript
- БД: Microsoft SQL Server (SSMS)
- Авторизация: JWT

## Запуск

### База данных

1. Установить SQL Server Express и SSMS
2. Выполнить скрипт `database/init.sql`

### Backend

```bash
cd backend
npm install
copy .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Сайт: http://localhost:5173

## Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Преподаватель | teacher@university.ru | password123 |
| Студент | student1@university.ru | password123 |

## Команда

Группа **Т-392**: Рябов М.М., Ковальчук В., Дражин С., Богданов Г.
