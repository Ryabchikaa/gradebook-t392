import {
  AppBar, Toolbar, Typography, Button, Box, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/', label: 'Расписание', icon: <HomeIcon /> },
  { to: '/journal', label: 'Журнал', icon: <BookIcon /> },
];

const teacherLinks = [
  { to: '/', label: 'Расписание', icon: <HomeIcon /> },
  { to: '/journal', label: 'Журнал', icon: <BookIcon /> },
  { to: '/program', label: 'Программа', icon: <SchoolIcon /> },
  { to: '/lab-review', label: 'Сдача лаб', icon: <AssignmentIcon /> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  const links = user?.role === 'TEACHER' ? teacherLinks : studentLinks;

  const drawer = (
    <List sx={{ width: 240, pt: 2 }}>
      {links.map((l) => (
        <ListItemButton
          key={l.to}
          component={Link}
          to={l.to}
          selected={location.pathname === l.to}
          onClick={() => setOpen(false)}
        >
          <ListItemIcon>{l.icon}</ListItemIcon>
          <ListItemText primary={l.label} />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {mobile && (
            <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Электронный журнал
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            {user?.firstName} {user?.lastName} ({user?.role === 'TEACHER' ? 'Преподаватель' : 'Студент'})
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      {!mobile && (
        <Drawer variant="permanent" sx={{ width: 240, [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', mt: '64px' } }}>
          {drawer}
        </Drawer>
      )}

      {mobile && (
        <Drawer open={open} onClose={() => setOpen(false)}>
          {drawer}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px', ml: { md: '240px' }, maxWidth: '100%' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
