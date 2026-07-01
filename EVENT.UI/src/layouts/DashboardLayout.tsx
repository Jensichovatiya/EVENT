import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Avatar, Menu, MenuItem, Divider, useTheme, useMediaQuery, Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { notificationApi } from '../api/notificationApi';
import { ROLES, ROUTES } from '../constants/appConstants';

const drawerWidth = 260;

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notiAnchorEl, setNotiAnchorEl] = useState<null | HTMLElement>(null);
  const userId = Number(localStorage.getItem('userId') || 0);

  const fetchNotifications = async () => {
    if (userId > 0) {
      try {
        const res = await notificationApi.getNotifications(userId);
        if (res.success && res.data) {
          setNotifications(res.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;

  const handleNotiMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotiAnchorEl(event.currentTarget);
  };

  const handleNotiMenuClose = () => {
    setNotiAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const res = await notificationApi.markAsRead(notificationId);
      if (res.success) {
        setNotifications(prev =>
          prev.map(n => n.notificationId === notificationId ? { ...n, status: 'READ' } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const role = localStorage.getItem('userRole') || ROLES.VISITOR;
  const userName = localStorage.getItem('userName') || 'User';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate(ROUTES.LOGIN);
  };

  const getMenuByRole = () => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
          { text: 'User Management', icon: <PeopleIcon />, path: ROUTES.USERS },
          { text: 'Role Management', icon: <SecurityIcon />, path: ROUTES.ROLES },
          { text: 'Event Categories', icon: <CategoryIcon />, path: ROUTES.CATEGORIES },
          { text: 'Venue Facilities', icon: <CategoryIcon />, path: ROUTES.FACILITIES },
          { text: 'Event Approval', icon: <AddCircleIcon />, path: ROUTES.EVENT_APPROVAL },
          { text: 'Events', icon: <EventIcon />, path: ROUTES.EVENTS },
          { text: 'Asset Types', icon: <BusinessIcon />, path: ROUTES.ASSET_TYPES },
          { text: 'Assets',      icon: <BusinessIcon />, path: ROUTES.ASSETS },
          { text: 'Components',  icon: <WidgetsIcon />,  path: ROUTES.COMPONENTS },
          { text: 'Bookings', icon: <ReceiptLongIcon />, path: ROUTES.BOOKINGS },
          { text: 'Invoices', icon: <ReceiptLongIcon />, path: ROUTES.INVOICES },
          { text: 'Payments', icon: <PaymentIcon />, path: ROUTES.PAYMENTS },
          { text: 'Passes', icon: <ConfirmationNumberIcon />, path: ROUTES.PASSES },
          { text: 'Scanner Logs', icon: <HistoryIcon />, path: ROUTES.SCANNER_LOGS },
          { text: 'Reports', icon: <AssessmentIcon />, path: ROUTES.REPORTS },
          { text: 'Settings', icon: <SettingsIcon />, path: ROUTES.SETTINGS },
          { text: 'System Logs', icon: <HistoryIcon />, path: ROUTES.LOGS },
        ];
      case ROLES.ORGANIZER:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
          { text: 'My Events', icon: <EventIcon />, path: ROUTES.EVENTS },
          { text: 'Create Event', icon: <AddCircleIcon />, path: ROUTES.EVENT_CREATE },
          { text: 'Venue Facilities', icon: <CategoryIcon />, path: ROUTES.FACILITIES },
          { text: 'Event Assets',      icon: <BusinessIcon />, path: ROUTES.ASSETS },
          { text: 'Asset Types',       icon: <BusinessIcon />, path: ROUTES.ASSET_TYPES },
          { text: 'Event Components',   icon: <WidgetsIcon />,  path: ROUTES.COMPONENTS },
          { text: 'Bookings', icon: <ReceiptLongIcon />, path: ROUTES.BOOKINGS },
          { text: 'Invoices', icon: <ReceiptLongIcon />, path: ROUTES.INVOICES },
          { text: 'Payments', icon: <PaymentIcon />, path: ROUTES.PAYMENTS },
          { text: 'Passes', icon: <ConfirmationNumberIcon />, path: ROUTES.PASSES },
          { text: 'Reports', icon: <AssessmentIcon />, path: ROUTES.REPORTS },
          { text: 'Employees', icon: <PeopleIcon />, path: ROUTES.EMPLOYEES },
          { text: 'Profile', icon: <PersonIcon />, path: ROUTES.PROFILE },
        ];
      case ROLES.EMPLOYEE:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
          { text: 'Assigned Events', icon: <EventIcon />, path: ROUTES.EVENTS },
          { text: 'Bookings', icon: <ReceiptLongIcon />, path: ROUTES.BOOKINGS },
          { text: 'Scanner', icon: <QrCodeScannerIcon />, path: ROUTES.SCANNER },
          { text: 'Pass Validation', icon: <ConfirmationNumberIcon />, path: ROUTES.SCANNER }, // Point validation to scanner / manual page
          { text: 'Attendance', icon: <PeopleIcon />, path: ROUTES.ATTENDANCE },
          { text: 'Reports', icon: <AssessmentIcon />, path: ROUTES.REPORTS },
          { text: 'Profile', icon: <PersonIcon />, path: ROUTES.PROFILE },
        ];
      case ROLES.SCANNER:
        return [
          { text: 'QR Scanner', icon: <QrCodeScannerIcon />, path: ROUTES.SCANNER },
          { text: 'Barcode Scanner', icon: <QrCodeScannerIcon />, path: ROUTES.SCANNER },
          { text: 'Manual Validation', icon: <ConfirmationNumberIcon />, path: ROUTES.SCANNER },
          { text: 'Attendance Logs', icon: <HistoryIcon />, path: ROUTES.ATTENDANCE },
          { text: 'Profile', icon: <PersonIcon />, path: ROUTES.PROFILE },
        ];
      case ROLES.VISITOR:
      default:
        return [
          { text: 'Home', icon: <DashboardIcon />, path: '/' },
          { text: 'Events', icon: <EventIcon />, path: ROUTES.EVENTS },
          { text: 'My Bookings', icon: <ReceiptLongIcon />, path: ROUTES.BOOKINGS },
          { text: 'My Passes', icon: <ConfirmationNumberIcon />, path: ROUTES.PASSES },
          { text: 'Profile', icon: <PersonIcon />, path: ROUTES.PROFILE },
        ];
    }
  };

  const menuItems = getMenuByRole();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', color: '#fff' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #1e293b' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 1.5 }}>
          TRACKET EMS
        </Typography>
      </Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#3b82f6' }}>{userName[0].toUpperCase()}</Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{userName}</Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>{role}</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: '#1e293b' }} />
      <List sx={{ flexGrow: 1, px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isActive ? '#3b82f6' : '#94a3b8',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#3b82f6' : '#94a3b8', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }}>{item.text}</Typography>} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary={<Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Logout</Typography>} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: 'none',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          color: '#1e293b'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Overview'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleNotiMenuOpen} sx={{ color: '#1e293b' }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notiAnchorEl}
              open={Boolean(notiAnchorEl)}
              onClose={handleNotiMenuClose}
              slotProps={{ paper: { sx: { mt: 1.5, width: 320, maxHeight: 400, borderRadius: 3, p: 0 } } }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notifications</Typography>
                {unreadCount > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}
                    onClick={async () => {
                      const unread = notifications.filter(n => n.status !== 'READ');
                      for (const n of unread) {
                        await handleMarkAsRead(n.notificationId);
                      }
                    }}
                  >
                    Mark all as read
                  </Typography>
                )}
              </Box>
              <List sx={{ p: 0, maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <ListItem sx={{ py: 3, justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>No notifications yet</Typography>
                  </ListItem>
                ) : (
                  notifications.map((noti) => (
                    <React.Fragment key={noti.notificationId}>
                      <ListItem
                        alignItems="flex-start"
                        disablePadding
                        sx={{
                          backgroundColor: noti.status !== 'READ' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.02)'
                          }
                        }}
                      >
                        <ListItemButton
                          onClick={() => {
                            if (noti.status !== 'READ') {
                              handleMarkAsRead(noti.notificationId);
                            }
                            handleNotiMenuClose();
                            if (noti.subject.toLowerCase().includes('pass') || noti.messageBody.toLowerCase().includes('pass')) {
                              navigate(ROUTES.PASSES);
                            } else if (noti.subject.toLowerCase().includes('booking') || noti.messageBody.toLowerCase().includes('booking')) {
                              navigate(ROUTES.BOOKINGS);
                            }
                          }}
                          sx={{ py: 1.5, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: noti.status !== 'READ' ? 700 : 500,
                                color: noti.status !== 'READ' ? '#1e293b' : '#64748b'
                              }}
                            >
                              {noti.subject}
                            </Typography>
                            {noti.status !== 'READ' && (
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6', mt: 0.5 }} />
                            )}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#64748b',
                              fontSize: '0.8rem',
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {noti.messageBody}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', mt: 0.5 }}>
                            {new Date(noti.createdAt).toLocaleString()}
                          </Typography>
                        </ListItemButton>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                )}
              </List>
            </Menu>

            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: '#8b5cf6' }}>{userName[0].toUpperCase()}</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              slotProps={{ paper: { sx: { mt: 1.5, minWidth: 150, borderRadius: 3 } } }}
            >
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate(ROUTES.PROFILE); }}>Profile</MenuItem>
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate(ROUTES.SETTINGS); }}>Settings</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #1e293b' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          transition: 'all 0.3s'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
