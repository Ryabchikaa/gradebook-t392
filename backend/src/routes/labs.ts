import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/my/:courseItemId', authMiddleware, async (req, res) => {
  const submission = await prisma.labSubmission.findUnique({
    where: {
      courseItemId_studentId: {
        courseItemId: req.params.courseItemId,
        studentId: req.user!.userId,
      },
    },
  });
  res.json(submission);
});

router.post(
  '/submit/:courseItemId',
  authMiddleware,
  requireRole('STUDENT'),
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'Файл обязателен' });
      return;
    }

    const item = await prisma.courseItem.findUnique({
      where: { id: req.params.courseItemId },
    });
    if (!item) {
      res.status(404).json({ error: 'Работа не найдена' });
      return;
    }

    const submission = await prisma.labSubmission.upsert({
      where: {
        courseItemId_studentId: {
          courseItemId: req.params.courseItemId,
          studentId: req.user!.userId,
        },
      },
      create: {
        courseItemId: req.params.courseItemId,
        studentId: req.user!.userId,
        filePath: req.file.filename,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
      update: {
        filePath: req.file.filename,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
    });
    res.json(submission);
  }
);

router.get(
  '/teacher/:courseItemId',
  authMiddleware,
  requireRole('TEACHER'),
  async (req, res) => {
    const item = await prisma.courseItem.findUnique({
      where: { id: req.params.courseItemId },
      include: { subject: true },
    });
    if (!item || item.subject.teacherId !== req.user!.userId) {
      res.status(403).json({ error: 'Нет доступа' });
      return;
    }

    const submissions = await prisma.labSubmission.findMany({
      where: { courseItemId: req.params.courseItemId },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, isExpelled: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
    res.json(submissions);
  }
);

const reviewSchema = z.object({
  grade: z.number().int().min(0).max(100).nullable(),
  teacherComment: z.string(),
  status: z.enum(['REVIEWED', 'RETURNED', 'PENDING']).optional(),
});

router.patch(
  '/review/:submissionId',
  authMiddleware,
  requireRole('TEACHER'),
  validateBody(reviewSchema),
  async (req, res) => {
    const submission = await prisma.labSubmission.findUnique({
      where: { id: req.params.submissionId },
      include: { courseItem: { include: { subject: true } } },
    });
    if (!submission || submission.courseItem.subject.teacherId !== req.user!.userId) {
      res.status(403).json({ error: 'Нет доступа' });
      return;
    }

    const updated = await prisma.labSubmission.update({
      where: { id: req.params.submissionId },
      data: {
        grade: req.body.grade,
        teacherComment: req.body.teacherComment,
        status: req.body.status || 'REVIEWED',
      },
    });
    res.json(updated);
  }
);

export default router;
