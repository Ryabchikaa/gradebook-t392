import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { upload } from '../middleware/upload';

const router = Router();

const courseItemSchema = z.object({
  type: z.enum(['LAB', 'THEORY', 'PRACTICE', 'TEST', 'ORAL']),
  title: z.string().min(1),
  description: z.string().optional(),
  deadline: z.string().datetime().nullable().optional(),
  orderIndex: z.number().int().optional(),
  maxScore: z.number().int().min(1).max(100).optional(),
  isTeamWork: z.boolean().optional(),
});

router.get('/subject/:subjectId', authMiddleware, async (req, res) => {
  const items = await prisma.courseItem.findMany({
    where: { subjectId: req.params.subjectId },
    orderBy: { orderIndex: 'asc' },
    include: {
      teams: { include: { members: { include: { student: true } } } },
      _count: { select: { submissions: true } },
    },
  });
  res.json(items);
});

router.post(
  '/subject/:subjectId',
  authMiddleware,
  requireRole('TEACHER'),
  upload.single('taskFile'),
  async (req, res) => {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.subjectId },
    });
    if (!subject || subject.teacherId !== req.user!.userId) {
      res.status(403).json({ error: 'Нет доступа' });
      return;
    }

    const parsed = courseItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.errors });
      return;
    }

    const data = parsed.data;
    const item = await prisma.courseItem.create({
      data: {
        subjectId: req.params.subjectId,
        type: data.type,
        title: data.title,
        description: data.description || '',
        deadline: data.deadline ? new Date(data.deadline) : null,
        orderIndex: data.orderIndex ?? 0,
        maxScore: data.maxScore ?? 5,
        isTeamWork: data.isTeamWork ?? false,
        taskFile: req.file?.filename || null,
      },
    });
    res.status(201).json(item);
  }
);

router.patch(
  '/:itemId',
  authMiddleware,
  requireRole('TEACHER'),
  async (req, res) => {
    const item = await prisma.courseItem.findUnique({
      where: { id: req.params.itemId },
      include: { subject: true },
    });
    if (!item || item.subject.teacherId !== req.user!.userId) {
      res.status(403).json({ error: 'Нет доступа' });
      return;
    }

    const updateSchema = courseItemSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Ошибка валидации' });
      return;
    }

    const data = parsed.data;
    const updated = await prisma.courseItem.update({
      where: { id: req.params.itemId },
      data: {
        ...data,
        deadline: data.deadline !== undefined
          ? data.deadline ? new Date(data.deadline) : null
          : undefined,
      },
    });
    res.json(updated);
  }
);

const teamSchema = z.object({
  name: z.string().optional(),
  studentIds: z.array(z.string().uuid()).min(1),
});

router.post(
  '/:itemId/teams',
  authMiddleware,
  requireRole('TEACHER'),
  validateBody(teamSchema),
  async (req, res) => {
    const item = await prisma.courseItem.findUnique({
      where: { id: req.params.itemId },
      include: { subject: true },
    });
    if (!item || !item.isTeamWork || item.subject.teacherId !== req.user!.userId) {
      res.status(403).json({ error: 'Нет доступа' });
      return;
    }

    const team = await prisma.labTeam.create({
      data: {
        courseItemId: req.params.itemId,
        name: req.body.name || 'Команда',
        members: {
          create: req.body.studentIds.map((studentId: string) => ({ studentId })),
        },
      },
      include: { members: { include: { student: true } } },
    });
    res.status(201).json(team);
  }
);

router.get('/:itemId', authMiddleware, async (req, res) => {
  const item = await prisma.courseItem.findUnique({
    where: { id: req.params.itemId },
    include: {
      subject: { include: { teacher: true, groups: { include: { group: true } } } },
      teams: { include: { members: { include: { student: true } } } },
      submissions: {
        include: { student: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });
  if (!item) {
    res.status(404).json({ error: 'Не найдено' });
    return;
  }
  res.json(item);
});

export default router;
