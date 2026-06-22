import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user!.userId;
  const role = req.user!.role;

  if (role === 'STUDENT') {
    const groups = await prisma.studentGroup.findMany({
      where: { studentId: userId },
      select: { groupId: true },
    });
    const groupIds = groups.map((g) => g.groupId);

    const schedule = await prisma.schedule.findMany({
      where: { groupId: { in: groupIds } },
      include: {
        subject: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    res.json(schedule);
    return;
  }

  const schedule = await prisma.schedule.findMany({
    where: { subject: { teacherId: userId } },
    include: {
      subject: { select: { id: true, name: true } },
      group: { select: { id: true, name: true } },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
  res.json(schedule);
});

export default router;
