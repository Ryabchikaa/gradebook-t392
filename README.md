# Электронный журнал (Web-based Gradebook)

Веб-приложение для учёта посещаемости, оценок и лабораторных работ с ролями **Студент** и **Преподаватель**.

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | React 18, TypeScript, Vite, Material UI |
| Backend | Node.js, Express, TypeScript |
| БД | Microsoft SQL Server + SSMS (Prisma ORM) |
| Auth | JWT |
| Файлы | Локальное хранилище (`backend/uploads/`) |

## Быстрый старт

### Требования

- Node.js 18+
- npm
- **SQL Server** + **SQL Server Management Studio (SSMS)**

### 0. База данных (SSMS)

Подробная инструкция: **[docs/SSMS_SETUP.md](docs/SSMS_SETUP.md)**

**Кратко:**

1. Установи SQL Server Express + SSMS
2. В SSMS выполни скрипт `database/init.sql` (создаст БД `Gradebook`)
3. Настрой `backend/.env`:

```env
DATABASE_URL="sqlserver://localhost\\SQLEXPRESS;database=Gradebook;integratedSecurity=true;trustServerCertificate=true"
```

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend: http://localhost:3001

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Преподаватель | teacher@university.ru | password123 |
| Студент 1 (новый) | student1@university.ru | password123 |
| Студент 2 | student2@university.ru | password123 |
| Студент 3 | student3@university.ru | password123 |
| Студент 4 (отчислен) | student4@university.ru | password123 |
| Студент 5 | student5@university.ru | password123 |

## Функционал

### Студент
- Расписание (главная)
- Электронный журнал (пропуски, оценки)
- Страница предмета (лабы, тесты, практики)
- Страница лабораторной (сдача файла, комментарии, напарники)

### Преподаватель
- Расписание
- Журнал: добавление дней, оценки (ЛКМ), опоздания (СКМ), отсутствия (ПКМ)
- Подсветка строк/столбцов при наведении
- Выделение новых и обесцвечивание отчисленных студентов
- Программа по предмету (дедлайны, ТЗ, командные работы)
- Проверка лабораторных (оценка + комментарий)

## Структура проекта

```
EJ_WW/
├── backend/
│   ├── prisma/          # Схема БД, seed
│   ├── src/
│   │   ├── routes/      # REST API
│   │   ├── middleware/  # auth, upload, validation
│   │   └── index.ts
│   └── uploads/         # Загруженные файлы
├── frontend/
│   └── src/
│       ├── pages/       # Экраны
│       ├── components/  # Layout и т.д.
│       └── api.ts       # HTTP-клиент
├── docs/
│   └── TEAM_TASKS.md    # Разделение работы в команде
└── README.md
```

## API (основные эндпоинты)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/login | Вход |
| GET | /api/auth/me | Текущий пользователь |
| GET | /api/schedule | Расписание |
| GET | /api/subjects/my | Мои предметы |
| GET | /api/subjects/:id/gradebook | Журнал |
| POST | /api/subjects/:id/days | Добавить день |
| POST | /api/subjects/:id/grades | Выставить оценку/опоздание/отсутствие |
| GET | /api/course-items/subject/:id | Программа |
| POST | /api/labs/submit/:id | Сдать лабу (студент) |
| PATCH | /api/labs/review/:id | Проверить лабу (преподаватель) |

## Команда — группа Т-392

| Участник | Роль |
|----------|------|
| **Рябов Максим** | Тим-лид, лабораторные + интеграция |
| **Ковальчук Вадим** | Backend (API, SQL Server, SSMS, auth) |
| **Дражин Сергей** | Frontend — экраны студента |
| **Богданов Глеб** | Frontend — журнал преподавателя |

Подробное разделение задач: [docs/TEAM_TASKS.md](docs/TEAM_TASKS.md)

## Сдача

1. Залить на GitHub
2. Убедиться что README актуален
3. Продемонстрировать все экраны на защите
