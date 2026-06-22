# Электронный журнал — группа Т-392

Проект командной лабораторной работы. Каждый участник пушит **свою ветку** с своей частью кода.

## Состав

| Участник | Ветка | Часть |
|----------|-------|-------|
| Рябов Максим | `main` + `feature/labs-program` | Скелет + лабораторные |
| Ковальчук Вадим | `feature/backend` | Backend + SQL Server |
| Дражин Сергей | `feature/student-ui` | Экраны студента |
| Богданов Глеб | `feature/teacher-journal` | Журнал преподавателя |

## Порядок мержа

```
1. main          ← Максим (пустой скелет)
2. feature/backend       → main   ← Вадим
3. feature/student-ui    → main   ← Сергей
4. feature/teacher-journal → main ← Глеб
5. feature/labs-program  → main   ← Максим
```

Подробно: [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)
