import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppThemeProvider } from './theme';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SchedulePage from './pages/SchedulePage';
import JournalListPage from './pages/JournalListPage';
import JournalPage from './pages/JournalPage';
import SubjectPage from './pages/SubjectPage';
import LabPage from './pages/LabPage';
import { CircularProgress, Box } from '@mui/material';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<SchedulePage />} />
              <Route path="journal" element={<JournalListPage />} />
              <Route path="journal/:subjectId" element={<JournalPage />} />
              <Route path="subject/:subjectId" element={<SubjectPage />} />
              <Route path="lab/:itemId" element={<LabPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppThemeProvider>
  );
}
