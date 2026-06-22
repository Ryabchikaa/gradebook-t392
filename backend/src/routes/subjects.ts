import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.get('/my', authMiddleware, async (req, res) => {
  const userId = req.user!.userId;

  if (req.user!.role === 'STUDENT') {
    const groups = await prisma.studentGroup.findMany({
      where: { studentId: userId },
      select: { groupId: true },
    });
    const groupIds = groups.map((g) => g.groupId);

    const subjects = await prisma.subject.findMany({
      where: { groups: { some: { groupId: { in: groupIds } } } },
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        groups: { include: { group: true } },
      },
    });
    res.json(subjects);
    return;
  }

  const subjects = await prisma.subject.findMany({
    where: { teacherId: userId },
    include: { groups: { include: { group: true } } },
  });
  res.json(subjects);
});

router.get('/:subjectId', authMiddleware, async (req, res) => {
  const subject = await prisma.subject.findUnique({
    where: { id: req.params.subjectId },
    include: {
      teacher: { select: { firstName: true, lastName: true } },
      groups: { include: { group: true } },
      courseItems: { orderBy: { orderIndex: 'asc' } },
    },
  });
  if (!subject) {
    res.status(404).json({ error: 'Предмет не найден' });
    return;
  }
  res.json(subject);
});

router.get('/:subjectId/gradebook', authMiddleware, async (req, res) => {
  const { subjectId } = req.params;
  const userId = req.user!.userId;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: { groups: true },
  });
  if (!subject) {
    res.status(404).json({ error: 'Предмет не найден' });
    return;
  }

  const groupId = req.query.groupId as string | undefined;
  const targetGroupId = groupId || subject.groups[0]?.groupId;

  if (!targetGroupId) {
    res.json({ lessonDays: [], students: [], grades: [] });
    return;
  }

  if (req.user!.role === 'STUDENT') {
    const membership = await prisma.studentGroup.findFirst({
      where: { studentId: userId, groupId: targetGroupId },
    });
    if (!membership) {
      res.status(403).json({ error: 'Нет доступа' });
      return;
    }
  } else if (subject.teacherId !== userId) {
    res.status(403).json({ error: 'Нет доступа' });
    return;
  }

  const [lessonDays, students, grades] = await Promise.all([
    prisma.lessonDay.findMany({
      where: { subjectId, groupId: targetGroupId },
      orderBy: { date: 'asc' },
    }),
    prisma.studentGroup.findMany({
      where: { groupId: targetGroupId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isExpelled: true,
            isNew: true,
          },
        },
      },
      orderBy: { student: { lastName: 'asc' } },
    }),
    prisma.grade.findMany({
      where: {
        lessonDay: { subjectId, groupId: targetGroupId },
      },
      include: { lessonDay: true },
    }),
  ]);

  res.json({
    lessonDays,
    students: students.map((s) => s.student),
    grades,
    groupId: targetGroupId,
  });
});

const addDaySchema = z.object({
  groupId: z.string().uuid(),
  date: z.string().datetime(),
  topic: z.string().optional(),
});

router.post(
  '/:subjectId/days',
  authMiddleware,
  requireRole('TEACHER'),
  validateBody(addDaySchema),
  async (req, res) => {
    const { subjectId } = req.params;
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject || subject.teacherId !== req.user!.userId) {
      res.status(403).json({ error: 'Нет доступа' });
      return;
    }

    const day = await prisma.lessonDay.create({
      data: {
        subjectId,
        groupId: req.body.groupId,
        date: new Date(req.body.date),
        topic: req.body.topic || '',
      },
    });
    res.status(201).json(day);
  }
);

const gradeSchema = z.object({
  lessonDayId: z.string().uuid(),
  studentId: z.string().uuid(),
  type: z.enum(['GRADE', 'LATE', 'ABSENT']),
  value: z.number().int().min(2).max(5).nullable().optional(),
});

router.post(
  '/:subjectId/grades',
  authMiddleware,
  requireRole('TEACHER'),
  validateBody(gradeSchema),
  async (req, res) => {
    const { subjectId } = req.params;
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject || subject.teacherId !== req.user!.userId) {
      res.status(403).json({ error: 'Нет доступа' });
      return;
    }

    const { lessonDayId, studentId, type, value } = req.body;

    if (type === 'GRADE' && (value === null || value === undefined)) {
      res.status(400).json({ error: 'Для оценки нужно значение' });
      return;
    }

    const grade = await prisma.grade.upsert({
      where: {
        lessonDayId_studentId_type: { lessonDayId, studentId, type },
      },
      create: {
        lessonDayId,
        studentId,
        type,
        value: type === 'GRADE' ? value : null,
      },
      update: {
        value: type === 'GRADE' ? value : null,
        markedAt: new Date(),
      },
    });

    res.json(grade);
  }
);

router.delete(
  '/:subjectId/grades/:gradeId',
  authMiddleware,
  requireRole('TEACHER'),
  async (req, res) => {
    await prisma.grade.delete({ where: { id: req.params.gradeId } });
    res.status(204).send();
  }
);

export default router;
