import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Box, Button, Select, MenuItem, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
  const [groupId, setGroupId] = useState('');
  const [hover, setHover] = useState<{ row?: number; col?: number }>({});
  const [gradeDialog, setGradeDialog] = useState<{ lessonDayId: string; studentId: string } | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);

  const load = useCallback(() => {
    if (!subjectId) return;
    api.get<Subject>(`/subjects/${subjectId}`).then((r) => setSubject(r.data));
    api.get<GradebookData>(`/subjects/${subjectId}/gradebook`, { params: groupId ? { groupId } : {} })
      .then((r) => {
        setData(r.data);
        if (!groupId && r.data.groupId) setGroupId(r.data.groupId);
      });
  }, [subjectId, groupId]);

  useEffect(() => { load(); }, [load]);

  const isTeacher = user?.role === 'TEACHER';

  const handleCellClick = (e: React.MouseEvent, lessonDayId: string, studentId: string) => {
    if (!isTeacher) return;
    e.preventDefault();
    if (e.button === 2) {
      api.post(`/subjects/${subjectId}/grades`, { lessonDayId, studentId, type: 'ABSENT' }).then(load);
    } else if (e.button === 1) {
      e.preventDefault();
      api.post(`/subjects/${subjectId}/grades`, { lessonDayId, studentId, type: 'LATE' }).then(load);
    } else if (e.button === 0) {
      setGradeDialog({ lessonDayId, studentId });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isTeacher || !gradeDialog) return;
    if (/^[2-5]$/.test(e.key)) {
      setGradeValue(e.key);
    }
  };

  const saveGrade = () => {
    if (!gradeDialog || !/^[2-5]$/.test(gradeValue)) return;
    api.post(`/subjects/${subjectId}/grades`, {
      ...gradeDialog,
      type: 'GRADE',
      value: parseInt(gradeValue, 10),
    }).then(() => {
      setGradeDialog(null);
      setGradeValue('');
      load();
    });
  };

  const addDay = () => {
    if (!groupId) return;
    api.post(`/subjects/${subjectId}/days`, {
      groupId,
      date: new Date().toISOString(),
      topic: 'Новый урок',
    }).then(load);
  };

  if (!data) return <Typography>Загрузка...</Typography>;

  return (
    <Box onKeyDown={handleKeyDown} tabIndex={0}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">{subject?.name || 'Журнал'}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {isTeacher && subject?.groups && subject.groups.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Группа</InputLabel>
              <Select value={groupId} label="Группа" onChange={(e) => setGroupId(e.target.value)}>
                {subject.groups.map((g) => (
                  <MenuItem key={g.group.id} value={g.group.id}>{g.group.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {isTeacher && (
            <Button startIcon={<AddIcon />} variant="contained" onClick={addDay}>Добавить день</Button>
          )}
          <Button component={Link} to={`/subject/${subjectId}`} variant="outlined">Программа</Button>
        </Box>
      </Box>

      {isTeacher && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          ЛКМ — оценка | СКМ — опоздание | ПКМ — отсутствие | Клавиши 2-5 — быстрая оценка
        </Typography>
      )}

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table ref={tableRef} size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 160, fontWeight: 'bold' }}>Студент</TableCell>
              {data.lessonDays.map((d, colIdx) => (
                <TableCell
                  key={d.id}
                  align="center"
                  sx={{
                    minWidth: 70,
                    bgcolor: hover.col === colIdx ? 'action.hover' : undefined,
                    fontWeight: 'bold',
                  }}
                >
                  {new Date(d.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.students.map((student, rowIdx) => (
              <TableRow
                key={student.id}
                sx={{
                  bgcolor: student.isExpelled
                    ? 'action.disabledBackground'
                    : hover.row === rowIdx
                      ? 'action.hover'
                      : student.isNew
                        ? '#e3f2fd'
                        : undefined,
                  opacity: student.isExpelled ? 0.6 : 1,
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: student.isNew ? 'bold' : undefined,
                    bgcolor: hover.row === rowIdx ? 'action.hover' : undefined,
                  }}
                >
                  {student.lastName} {student.firstName}
                  {student.isNew && <Chip label="новый" size="small" sx={{ ml: 1 }} />}
                  {student.isExpelled && <Chip label="отчислен" size="small" sx={{ ml: 1 }} />}
                </TableCell>
                {data.lessonDays.map((day, colIdx) => {
                  const cell = getGradeCell(data.grades, day.id, student.id);
                  return (
                    <TableCell
                      key={day.id}
                      align="center"
                      onMouseDown={(e) => handleCellClick(e, day.id, student.id)}
                      onContextMenu={(e) => e.preventDefault()}
                      onMouseEnter={() => setHover({ row: rowIdx, col: colIdx })}
                      onMouseLeave={() => setHover({})}
                      sx={{
                        cursor: isTeacher ? 'pointer' : 'default',
                        bgcolor: cell.color || (hover.row === rowIdx && hover.col === colIdx ? 'primary.light' : hover.row === rowIdx || hover.col === colIdx ? 'action.hover' : undefined),
                        userSelect: 'none',
                        fontWeight: 'bold',
                      }}
                    >
                      {cell.display}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!gradeDialog} onClose={() => setGradeDialog(null)}>
        <DialogTitle>Выставить оценку</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus label="Оценка (2-5)" value={gradeValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^[2-5]$/.test(v)) setGradeValue(v);
            }}
            inputProps={{ maxLength: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialog(null)}>Отмена</Button>
          <Button onClick={saveGrade} variant="contained" disabled={!/^[2-5]$/.test(gradeValue)}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
