import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Container,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('student1@university.ru');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Неверный email или пароль');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" gutterBottom align="center">
            Электронный журнал
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Войдите в систему
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" margin="normal"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            <TextField
              fullWidth label="Пароль" type="password" margin="normal"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
              Войти
            </Button>
          </form>
          <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
            Тест: teacher@university.ru или student1@university.ru / password123
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
