import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export const uploadUrl = (filename: string) => `/uploads/${filename}`;

export const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER';
  isExpelled?: boolean;
  isNew?: boolean;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  subject: { id: string; name: string };
  group: { id: string; name: string };
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  isExpelled: boolean;
  isNew: boolean;
}

export interface LessonDay {
  id: string;
  date: string;
  topic: string;
}

export interface Grade {
  id: string;
  lessonDayId: string;
  studentId: string;
  type: 'GRADE' | 'LATE' | 'ABSENT';
  value: number | null;
}

export interface GradebookData {
  lessonDays: LessonDay[];
  students: Student[];
  grades: Grade[];
  groupId: string;
}

export interface Subject {
  id: string;
  name: string;
  teacher?: { firstName: string; lastName: string };
  groups?: { group: { id: string; name: string } }[];
  courseItems?: CourseItem[];
}

export interface CourseItem {
  id: string;
  subjectId?: string;
  type: string;
  title: string;
  description: string;
  deadline: string | null;
  issuedAt: string;
  orderIndex: number;
  taskFile: string | null;
  maxScore: number;
  isTeamWork: boolean;
  teams?: LabTeam[];
  submissions?: LabSubmission[];
}

export interface LabTeam {
  id: string;
  name: string;
  members: { student: Student }[];
}

export interface LabSubmission {
  id: string;
  courseItemId: string;
  studentId: string;
  filePath: string | null;
  submittedAt: string | null;
  grade: number | null;
  teacherComment: string;
  status: string;
  student?: Student;
}
