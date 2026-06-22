import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Box, Button, Chip,
} from '@mui/material';
import api, { GradebookData, Subject } from '../api';
import { useAuth } from '../context/AuthContext';

function getGradeCell(grades: GradebookData['grades'], lessonDayId: string, studentId: string) {
  const grade = grades.find((g) => g.lessonDayId === lessonDayId && g.studentId === studentId && g.type === 'GRADE');
  const late = grades.find((g) => g.lessonDayId === lessonDayId && g.studentId === studentId && g.type === 'LATE');
  const absent = grades.find((g) => g.lessonDayId === lessonDayId && g.studentId === studentId && g.type === 'ABSENT');
  if (absent) return { display: 'Н', color: '#ffcdd2' };
  if (late) return { display: 'О', color: '#fff9c4' };
  if (grade?.value) return { display: String(grade.value), color: undefined };
  return { display: '', color: undefined };
}

export default function JournalPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [data, setData] = useState<GradebookData | null>(null);

  const load = useCallback(() => {
    if (!subjectId) return;
    api.get<Subject>(`/subjects/${subjectId}`).then((r) => setSubject(r.data));
    api.get<GradebookData>(`/subjects/${subjectId}/gradebook`).then((r) => setData(r.data));
  }, [subjectId]);

  useEffect(() => { load(); }, [load]);

  if (!data) return <Typography>Загрузка...</Typography>;

  const rows = user?.role === 'STUDENT'
    ? data.students.filter((s) => s.id === user.id)
    : data.students;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{subject?.name || 'Журнал'}</Typography>
      <Button component={Link} to={`/subject/${subjectId}`} variant="outlined" sx={{ mb: 2 }}>
        Программа предмета
      </Button>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Студент</TableCell>
              {data.lessonDays.map((d) => (
                <TableCell key={d.id} align="center">
                  {new Date(d.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.lastName} {student.firstName}</TableCell>
                {data.lessonDays.map((day) => {
                  const cell = getGradeCell(data.grades, day.id, student.id);
                  return (
                    <TableCell key={day.id} align="center" sx={{ bgcolor: cell.color, fontWeight: 'bold' }}>
                      {cell.display}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
