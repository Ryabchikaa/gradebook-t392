import { useEffect, useState } from 'react';
import {
  Typography, Paper, Box, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip,
} from '@mui/material';
import api, { Subject, CourseItem, LabSubmission, uploadUrl } from '../api';

export default function LabReviewPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [labs, setLabs] = useState<CourseItem[]>([]);
  const [selectedLab, setSelectedLab] = useState('');
  const [submissions, setSubmissions] = useState<LabSubmission[]>([]);
  const [review, setReview] = useState<LabSubmission | null>(null);
  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.get<Subject[]>('/subjects/my').then((r) => {
      setSubjects(r.data);
      if (r.data[0]) setSubjectId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    api.get<CourseItem[]>(`/course-items/subject/${subjectId}`).then((r) => {
      const labItems = r.data.filter((i) => i.type === 'LAB');
      setLabs(labItems);
      if (labItems[0]) setSelectedLab(labItems[0].id);
    });
  }, [subjectId]);

  useEffect(() => {
    if (!selectedLab) return;
    api.get<LabSubmission[]>(`/labs/teacher/${selectedLab}`).then((r) => setSubmissions(r.data));
  }, [selectedLab]);

  const openReview = (s: LabSubmission) => {
    setReview(s);
    setGrade(s.grade?.toString() || '');
    setComment(s.teacherComment || '');
  };

  const saveReview = async () => {
    if (!review) return;
    await api.patch(`/labs/review/${review.id}`, {
      grade: grade ? parseInt(grade, 10) : null,
      teacherComment: comment,
      status: 'REVIEWED',
    });
    setReview(null);
    api.get<LabSubmission[]>(`/labs/teacher/${selectedLab}`).then((r) => setSubmissions(r.data));
  };

  const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
    PENDING: 'default',
    SUBMITTED: 'warning',
    REVIEWED: 'success',
    RETURNED: 'error',
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Сдача лабораторных</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Предмет</InputLabel>
          <Select value={subjectId} label="Предмет" onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Лабораторная</InputLabel>
          <Select value={selectedLab} label="Лабораторная" onChange={(e) => setSelectedLab(e.target.value)}>
            {labs.map((l) => <MenuItem key={l.id} value={l.id}>{l.title}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Студент</TableCell>
              <TableCell>Дата сдачи</TableCell>
              <TableCell>Файл</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Оценка</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((s) => (
              <TableRow key={s.id} sx={{ opacity: s.student?.isExpelled ? 0.5 : 1 }}>
                <TableCell>{s.student?.lastName} {s.student?.firstName}</TableCell>
                <TableCell>
                  {s.submittedAt ? new Date(s.submittedAt).toLocaleString('ru-RU') : '—'}
                </TableCell>
                <TableCell>
                  {s.filePath ? (
                    <Button size="small" href={uploadUrl(s.filePath)} target="_blank">Скачать</Button>
                  ) : '—'}
                </TableCell>
                <TableCell><Chip label={s.status} color={STATUS_COLORS[s.status]} size="small" /></TableCell>
                <TableCell>{s.grade ?? '—'}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => openReview(s)}>Проверить</Button>
                </TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center">Нет сдач</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!review} onClose={() => setReview(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Проверка: {review?.student?.lastName} {review?.student?.firstName}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Оценка" type="number" margin="normal"
            value={grade} onChange={(e) => setGrade(e.target.value)}
          />
          <TextField
            fullWidth label="Комментарий" multiline rows={3} margin="normal"
            value={comment} onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReview(null)}>Отмена</Button>
          <Button variant="contained" onClick={saveReview}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
