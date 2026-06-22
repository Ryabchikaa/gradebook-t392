import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

async function main() {
  await prisma.grade.deleteMany();
  await prisma.lessonDay.deleteMany();
  await prisma.labSubmission.deleteMany();
  await prisma.labTeamMember.deleteMany();
  await prisma.labTeam.deleteMany();
  await prisma.courseItem.deleteMany();
  await prisma.lessonTiming.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.subjectGroup.deleteMany();
  await prisma.studentGroup.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 10);

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@university.ru',
      passwordHash: hash,
      firstName: 'Иван',
      lastName: 'Петров',
      role: 'TEACHER',
    },
  });

  const students = await Promise.all([
  prisma.user.create({
    data: { email: 'student1@university.ru', passwordHash: hash, firstName: 'Алексей', lastName: 'Смирнов', role: 'STUDENT', isNew: true },
  }),
  prisma.user.create({
    data: { email: 'student2@university.ru', passwordHash: hash, firstName: 'Мария', lastName: 'Иванова', role: 'STUDENT' },
  }),
  prisma.user.create({
    data: { email: 'student3@university.ru', passwordHash: hash, firstName: 'Дмитрий', lastName: 'Козлов', role: 'STUDENT' },
  }),
  prisma.user.create({
    data: { email: 'student4@university.ru', passwordHash: hash, firstName: 'Елена', lastName: 'Новикова', role: 'STUDENT', isExpelled: true },
  }),
  prisma.user.create({
    data: { email: 'student5@university.ru', passwordHash: hash, firstName: 'Сергей', lastName: 'Волков', role: 'STUDENT' },
  }),
  ]);

  const group = await prisma.group.create({ data: { name: 'Т-392' } });

  for (const s of students) {
    await prisma.studentGroup.create({ data: { studentId: s.id, groupId: group.id } });
  }

  const webDev = await prisma.subject.create({
    data: {
      name: 'Веб-разработка',
      teacherId: teacher.id,
      groups: { create: [{ groupId: group.id }] },
    },
  });

  const databases = await prisma.subject.create({
    data: {
      name: 'Базы данных',
      teacherId: teacher.id,
      groups: { create: [{ groupId: group.id }] },
    },
  });

  const scheduleData = [
    { subjectId: webDev.id, groupId: group.id, dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: 'А-201' },
    { subjectId: webDev.id, groupId: group.id, dayOfWeek: 3, startTime: '11:00', endTime: '12:30', room: 'А-201' },
    { subjectId: databases.id, groupId: group.id, dayOfWeek: 2, startTime: '13:00', endTime: '14:30', room: 'Б-105' },
    { subjectId: databases.id, groupId: group.id, dayOfWeek: 4, startTime: '15:00', endTime: '16:30', room: 'Б-105' },
  ];

  for (const s of scheduleData) {
    await prisma.schedule.create({ data: s });
  }

  await prisma.lessonTiming.create({
    data: {
      subjectId: webDev.id,
      lessonStart: '09:00',
      lessonEnd: '10:30',
      lateAfterMinutes: 15,
    },
  });

  await prisma.lessonTiming.create({
    data: {
      subjectId: databases.id,
      lessonStart: '13:00',
      lessonEnd: '14:30',
      lateAfterMinutes: 10,
    },
  });

  const now = new Date();
  const dates = [
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  ];

  for (const date of dates) {
    const day = await prisma.lessonDay.create({
      data: { subjectId: webDev.id, groupId: group.id, date, topic: `Занятие ${date.toLocaleDateString('ru-RU')}` },
    });

    await prisma.grade.create({
      data: { lessonDayId: day.id, studentId: students[0].id, type: 'GRADE', value: 5 },
    });
    await prisma.grade.create({
      data: { lessonDayId: day.id, studentId: students[1].id, type: 'LATE' },
    });
    await prisma.grade.create({
      data: { lessonDayId: day.id, studentId: students[2].id, type: 'ABSENT' },
    });
  }

  const lab1 = await prisma.courseItem.create({
    data: {
      subjectId: webDev.id,
      type: 'LAB',
      title: 'Лабораторная 1: HTML/CSS',
      description: 'Сверстать landing page по макету',
      deadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
      orderIndex: 1,
      maxScore: 5,
      isTeamWork: false,
    },
  });

  const lab2 = await prisma.courseItem.create({
    data: {
      subjectId: webDev.id,
      type: 'LAB',
      title: 'Лабораторная 2: React (командная)',
      description: 'Разработать SPA в команде из 2-3 человек',
      deadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21),
      orderIndex: 2,
      maxScore: 10,
      isTeamWork: true,
    },
  });

  await prisma.courseItem.create({
    data: {
      subjectId: webDev.id,
      type: 'TEST',
      title: 'Контрольная: JavaScript',
      description: 'Тест по основам JS',
      orderIndex: 3,
      maxScore: 20,
    },
  });

  const team = await prisma.labTeam.create({
    data: {
      courseItemId: lab2.id,
      name: 'Команда Alpha',
      members: {
        create: [
          { studentId: students[0].id },
          { studentId: students[1].id },
        ],
      },
    },
  });

  await prisma.labSubmission.create({
    data: {
      courseItemId: lab1.id,
      studentId: students[0].id,
      submittedAt: new Date(),
      status: 'REVIEWED',
      grade: 5,
      teacherComment: 'Отличная работа!',
    },
  });

  console.log('\n=== Тестовые данные загружены ===\n');
  console.log('Преподаватель: teacher@university.ru / password123');
  console.log('Студенты: student1@university.ru ... student5@university.ru / password123');
  console.log(`Группа: ${group.name}`);
  console.log(`Предметы: ${webDev.name}, ${databases.name}`);
  console.log(`Командная лаба: ${lab2.title}, команда: ${team.name}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
