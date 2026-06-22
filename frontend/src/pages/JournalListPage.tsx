import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography, Paper, List, ListItemButton, ListItemText, Box, Chip,
} from '@mui/material';
import api, { Subject } from '../api';
import { useAuth } from '../context/AuthContext';

export default function JournalListPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get<Subject[]>('/subjects/my').then((r) => setSubjects(r.data));
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {user?.role === 'TEACHER' ? 'Мои предметы и группы' : 'Электронный журнал'}
      </Typography>
      <Paper>
        <List>
          {subjects.map((s) => (
            <ListItemButton key={s.id} component={Link} to={`/journal/${s.id}`}>
              <ListItemText
                primary={s.name}
                secondary={
                  user?.role === 'TEACHER'
                    ? s.groups?.map((g) => g.group.name).join(', ')
                    : s.teacher ? `${s.teacher.lastName} ${s.teacher.firstName}` : ''
                }
              />
              <Chip label="Открыть" size="small" color="primary" variant="outlined" />
            </ListItemButton>
          ))}
          {subjects.length === 0 && (
            <ListItemText primary="Нет предметов" sx={{ p: 2 }} />
          )}
        </List>
      </Paper>
    </Box>
  );
}
