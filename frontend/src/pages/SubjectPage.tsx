import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Box, Button,
} from '@mui/material';
import api, { Subject, CourseItem } from '../api';

const TYPE_LABELS: Record<string, string> = {
  LAB: 'Лабораторная',
  THEORY: 'Теория',
  PRACTICE: 'Практика',
  TEST: 'Контрольная',
  ORAL: 'Устный опрос',
};

const TYPE_COLORS: Record<string, 'primary' | 'secondary' | 'warning' | 'error' | 'info'> = {
  LAB: 'primary',
  THEORY: 'info',
  PRACTICE: 'secondary',
  TEST: 'warning',
  ORAL: 'error',
};

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [items, setItems] = useState<CourseItem[]>([]);

  useEffect(() => {
    if (!subjectId) return;
    api.get<Subject>(`/subjects/${subjectId}`).then((r) => setSubject(r.data));
    api.get<CourseItem[]>(`/course-items/subject/${subjectId}`).then((r) => setItems(r.data));
  }, [subjectId]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{subject?.name}</Typography>
      {subject?.teacher && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Преподаватель: {subject.teacher.lastName} {subject.teacher.firstName}
        </Typography>
      )}
      <Button component={Link} to={`/journal/${subjectId}`} variant="outlined" sx={{ mb: 2 }}>
        Открыть журнал
      </Button>

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Программа / Успеваемость</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Дедлайн</TableCell>
              <TableCell>Макс. балл</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Chip label={TYPE_LABELS[item.type] || item.type} color={TYPE_COLORS[item.type]} size="small" />
                </TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  {item.deadline ? new Date(item.deadline).toLocaleDateString('ru-RU') : '—'}
                </TableCell>
                <TableCell>{item.maxScore}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/lab/${item.id}`} size="small">
                    {item.type === 'LAB' ? 'Открыть' : 'Подробнее'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
