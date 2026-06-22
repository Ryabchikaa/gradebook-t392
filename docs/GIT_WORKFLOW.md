# Git-воркфлоу команды Т-392

Каждый пушит **только свою ветку**. Готовый проект на `main` собирается после мержа всех веток.

## Порядок (строго!)

| Шаг | Кто | Ветка | Что добавляет |
|-----|-----|-------|---------------|
| 1 | **Рябов Максим** | `main` | Пустой скелет проекта |
| 2 | **Ковальчук Вадим** | `feature/backend` | Папка `backend/` |
| 3 | **Дражин Сергей** | `feature/student-ui` | Экраны студента |
| 4 | **Богданов Глеб** | `feature/teacher-journal` | Журнал преподавателя |
| 5 | **Рябов Максим** | `feature/labs-program` | Лабораторные + финальный README |

После каждого шага Максим (тим-лид) **мержит** ветку в `main` на GitHub.

---

## Установка Git (один раз)

1. https://git-scm.com/download/win → установить
2. Создать аккаунт на https://github.com
3. GitHub → Settings → Developer settings → Personal access tokens → создать token (права `repo`)

---

## Максим: создать репозиторий

1. GitHub → **New repository** → имя `gradebook-t392` → Create
2. Распаковать из архива папку `00_skeleton/`
3. В PowerShell:

```powershell
cd путь\к\00_skeleton
git init
git add .
git commit -m "init: скелет проекта, группа Т-392"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/gradebook-t392.git
git push -u origin main
```

4. Settings → Collaborators → добавить Вадима, Сергея, Глеба

---

## Шаблон для участников (Вадим, Сергей, Глеб)

```powershell
# 1. Склонировать
git clone https://github.com/ЛОГИН/gradebook-t392.git
cd gradebook-t392

# 2. Создать свою ветку
git checkout -b feature/ИМЯ_ВЕТКИ

# 3. Скопировать файлы из архива в проект (заменить/добавить)

# 4. Закоммитить
git add .
git commit -m "описание что сделал"
git push -u origin feature/ИМЯ_ВЕТКИ
```

5. Написать Максиму: «Запушил ветку `feature/...`»
6. Максим мержит на GitHub: **Pull requests → New → Merge**

---

## Мерж на GitHub (для Максима)

1. Участник пушит ветку
2. GitHub → репозиторий → **Pull requests** → **New pull request**
3. base: `main` ← compare: `feature/...`
4. **Create pull request** → **Merge pull request**
5. Участник делает `git pull` перед своей следующей работой

---

## Ветки

| Участник | Ветка |
|----------|-------|
| Ковальчук Вадим | `feature/backend` |
| Дражин Сергей | `feature/student-ui` |
| Богданов Глеб | `feature/teacher-journal` |
| Рябов Максим (2-й пуш) | `feature/labs-program` |

---

## После всех мержей — запуск

```powershell
# Терминал 1
cd backend
npm install
copy .env.example .env
# SSMS: database/init.sql
npx prisma migrate dev --name init
npm run db:seed
npm run dev

# Терминал 2
cd frontend
npm install
npm run dev
```

Сайт: http://localhost:5173
