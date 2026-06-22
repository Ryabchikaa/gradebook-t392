import { useEffect, useState } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Box,
} from '@mui/material';
import api, { ScheduleItem, DAY_NAMES } from '../api';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    api.get<ScheduleItem[]>('/schedule').then((r) => setSchedule(r.data));
  }, []);

  const today = new Date().getDay();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Расписание</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>День</TableCell>
              <TableCell>Время</TableCell>
              <TableCell>Предмет</TableCell>
              <TableCell>Группа</TableCell>
              <TableCell>Аудитория</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((s) => (
              <TableRow
                key={s.id}
                sx={{
                  bgcolor: s.dayOfWeek === today ? 'action.selected' : undefined,
                  fontWeight: s.dayOfWeek === today ? 'bold' : undefined,
                }}
              >
                <TableCell>
                  {DAY_NAMES[s.dayOfWeek]}
                  {s.dayOfWeek === today && <Chip label="Сегодня" size="small" color="primary" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell>{s.startTime} — {s.endTime}</TableCell>
                <TableCell>{s.subject.name}</TableCell>
                <TableCell>{s.group.name}</TableCell>
                <TableCell>{s.room}</TableCell>
              </TableRow>
            ))}
            {schedule.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center">Нет занятий</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
