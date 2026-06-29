import { useEffect, useState } from 'react';
import {
  Typography, Paper, Box, FormControl, InputLabel, Select, MenuItem,
  Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api, { Subject, CourseItem } from '../api';

const TYPES = ['LAB', 'THEORY', 'PRACTICE', 'TEST', 'ORAL'] as const;
const TYPE_LABELS: Record<string, string> = {
  LAB: 'Лабораторная', THEORY: 'Теория', PRACTICE: 'Практика', TEST: 'Контрольная', ORAL: 'Устный',
};

export default function ProgramPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [items, setItems] = useState<CourseItem[]>([]);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({
    type: 'LAB' as string,
    title: '',
    description: '',
    deadline: '',
    maxScore: 5,
    isTeamWork: false,
  });
  const [teamDialog, setTeamDialog] = useState<CourseItem | null>(null);
  const [teamStudentIds, setTeamStudentIds] = useState<string[]>([]);
  const [students, setStudents] = useState<{ id: string; firstName: string; lastName: string }[]>([]);

  useEffect(() => {
    api.get<Subject[]>('/subjects/my').then((r) => {
      setSubjects(r.data);
      if (r.data[0]) setSubjectId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    api.get<CourseItem[]>(`/course-items/subject/${subjectId}`).then((r) => setItems(r.data));
    api.get(`/subjects/${subjectId}/gradebook`).then((r) => setStudents(r.data.students));
  }, [subjectId]);

  const createItem = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
    if (form.deadline) formData.append('deadline', new Date(form.deadline).toISOString());
    await api.post(`/course-items/subject/${subjectId}`, formData);
    setDialog(false);
    api.get<CourseItem[]>(`/course-items/subject/${subjectId}`).then((r) => setItems(r.data));
  };

  const createTeam = async () => {
    if (!teamDialog) return;
    await api.post(`/course-items/${teamDialog.id}/teams`, {
      name: 'Команда',
      studentIds: teamStudentIds,
    });
    setTeamDialog(null);
    setTeamStudentIds([]);
    api.get<CourseItem[]>(`/course-items/subject/${subjectId}`).then((r) => setItems(r.data));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Программа по предмету</Typography>

      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Предмет</InputLabel>
        <Select value={subjectId} label="Предмет" onChange={(e) => setSubjectId(e.target.value)}>
          {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </Select>
      </FormControl>

      <Button startIcon={<AddIcon />} variant="contained" onClick={() => setDialog(true)} sx={{ mb: 2, ml: 2 }}>
        Добавить занятие
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Дедлайн</TableCell>
              <TableCell>Командная</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell><Chip label={TYPE_LABELS[item.type]} size="small" /></TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.deadline ? new Date(item.deadline).toLocaleDateString('ru-RU') : '—'}</TableCell>
                <TableCell>{item.isTeamWork ? 'Да' : 'Нет'}</TableCell>
                <TableCell>
                  {item.isTeamWork && (
                    <Button size="small" onClick={() => setTeamDialog(item)}>Настроить команду</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новое занятие</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Тип</InputLabel>
            <Select value={form.type} label="Тип" onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <MenuItem key={t} value={t}>{TYPE_LABELS[t]}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Название" margin="normal" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField fullWidth label="Описание" margin="normal" multiline value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <TextField fullWidth label="Дедлайн" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <TextField fullWidth label="Макс. балл" type="number" margin="normal" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: +e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Командная работа</InputLabel>
            <Select value={form.isTeamWork ? 'yes' : 'no'} label="Командная работа" onChange={(e) => setForm({ ...form, isTeamWork: e.target.value === 'yes' })}>
              <MenuItem value="no">Нет</MenuItem>
              <MenuItem value="yes">Да</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={createItem}>Создать</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!teamDialog} onClose={() => setTeamDialog(null)}>
        <DialogTitle>Настроить команду: {teamDialog?.title}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Студенты</InputLabel>
            <Select
              multiple
              value={teamStudentIds}
              label="Студенты"
              onChange={(e) => setTeamStudentIds(e.target.value as string[])}
              renderValue={(selected) => selected.map((id) => {
                const s = students.find((st) => st.id === id);
                return s ? `${s.lastName} ${s.firstName}` : id;
              }).join(', ')}
            >
              {students.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.lastName} {s.firstName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDialog(null)}>Отмена</Button>
          <Button variant="contained" onClick={createTeam} disabled={teamStudentIds.length < 1}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
