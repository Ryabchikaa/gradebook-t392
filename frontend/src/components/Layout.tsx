import {
  AppBar, Toolbar, Typography, Button, Box, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Расписание', icon: <HomeIcon /> },
  { to: '/journal', label: 'Журнал', icon: <BookIcon /> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  const drawer = (
    <List sx={{ width: 240, pt: 2 }}>
      {links.map((l) => (
        <ListItemButton key={l.to} component={Link} to={l.to} selected={location.pathname === l.to} onClick={() => setOpen(false)}>
          <ListItemIcon>{l.icon}</ListItemIcon>
          <ListItemText primary={l.label} />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed"><Toolbar>
        {mobile && <IconButton color="inherit" onClick={() => setOpen(true)}><MenuIcon /></IconButton>}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Электронный журнал</Typography>
        <Typography sx={{ mr: 2 }}>{user?.firstName} {user?.lastName}</Typography>
        <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>Выйти</Button>
      </Toolbar></AppBar>
      {!mobile && <Drawer variant="permanent" sx={{ width: 240, [`& .MuiDrawer-paper`]: { width: 240, mt: '64px' } }}>{drawer}</Drawer>}
      {mobile && <Drawer open={open} onClose={() => setOpen(false)}>{drawer}</Drawer>}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px', ml: { md: '240px' } }}><Outlet /></Box>
    </Box>
  );
}
