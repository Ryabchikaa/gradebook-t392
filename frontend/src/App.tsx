import { AppThemeProvider } from './theme';
import { Typography, Box } from '@mui/material';

export default function App() {
  return (
    <AppThemeProvider>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4">Электронный журнал</Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Группа Т-392 — проект в разработке
        </Typography>
      </Box>
    </AppThemeProvider>
  );
}
