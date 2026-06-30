import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Button } from '@mui/material';
import { Card, CardContent } from '@/Ui/card';
import DashboardLayout from '../layouts/DashboardLayout';
import { ROLES, ROUTES } from '../constants/appConstants';
import { eventApi } from '../api/eventApi';
import AppLoader from '../components/AppLoader';
import EventIcon from '@mui/icons-material/Event';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole') || ROLES.VISITOR;
  const userName = localStorage.getItem('userName') || 'User';
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await eventApi.getAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    if (role !== ROLES.VISITOR) {
      fetchAnalytics();
    }
  }, [role]);

  if (loading) {
    return (
      <DashboardLayout>
        <AppLoader message="Loading dashboard data..." />
      </DashboardLayout>
    );
  }

  const renderSuperAdminDashboard = () => (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" style={{ fontWeight: 800 }}>Welcome, {userName}</Typography>
        <Typography variant="body1" color="textSecondary">Here's your system status overview.</Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-0" style={{ borderLeft: '6px solid #3b82f6' }}>
            <CardContent className="flex items-center gap-3 p-5">
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary" style={{ fontWeight: 600 }}>Total Events</Typography>
                <Typography variant="h4" style={{ fontWeight: 800 }}>{analytics?.totalEvents || 0}</Typography>
              </Box>
              <EventIcon style={{ fontSize: 40, color: '#3b82f6' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-0" style={{ borderLeft: '6px solid #10b981' }}>
            <CardContent className="flex items-center gap-3 p-5">
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary" style={{ fontWeight: 600 }}>Active Events</Typography>
                <Typography variant="h4" style={{ fontWeight: 800 }}>{analytics?.activeEvents || 0}</Typography>
              </Box>
              <EventIcon style={{ fontSize: 40, color: '#10b981' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-0" style={{ borderLeft: '6px solid #f59e0b' }}>
            <CardContent className="flex items-center gap-3 p-5">
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary" style={{ fontWeight: 600 }}>Total Slots</Typography>
                <Typography variant="h4" style={{ fontWeight: 800 }}>{analytics?.totalSlots || 0}</Typography>
              </Box>
              <ConfirmationNumberIcon style={{ fontSize: 40, color: '#f59e0b' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-0" style={{ borderLeft: '6px solid #8b5cf6' }}>
            <CardContent className="flex items-center gap-3 p-5">
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary" style={{ fontWeight: 600 }}>Total Capacity</Typography>
                <Typography variant="h4" style={{ fontWeight: 800 }}>{analytics?.totalCapacity || 0}</Typography>
              </Box>
              <BusinessIcon style={{ fontSize: 40, color: '#8b5cf6' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 16 }}>Quick Actions</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="contained" fullWidth onClick={() => navigate(ROUTES.EVENTS)} style={{ textTransform: 'none', borderRadius: 8, height: 50, fontWeight: 600 }}>
            Manage Events
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="outlined" fullWidth onClick={() => navigate(ROUTES.CATEGORIES)} style={{ textTransform: 'none', borderRadius: 8, height: 50, fontWeight: 600 }}>
            Manage Categories
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="outlined" fullWidth onClick={() => navigate(ROUTES.SETTINGS)} style={{ textTransform: 'none', borderRadius: 8, height: 50, fontWeight: 600 }}>
            System Settings
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderOrganizerDashboard = () => (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" style={{ fontWeight: 800 }}>Welcome Back, {userName}</Typography>
        <Typography variant="body1" color="textSecondary">Create, manage, and track your events here.</Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card style={{ borderRadius: 12, borderLeft: '6px solid #3b82f6' }}>
            <CardContent style={{ display: 'flex', alignItems: 'center' }}>
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary" style={{ fontWeight: 600 }}>My Events</Typography>
                <Typography variant="h4" style={{ fontWeight: 800 }}>{analytics?.totalEvents || 0}</Typography>
              </Box>
              <EventIcon style={{ fontSize: 40, color: '#3b82f6' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card style={{ borderRadius: 12, borderLeft: '6px solid #10b981' }}>
            <CardContent style={{ display: 'flex', alignItems: 'center' }}>
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary" style={{ fontWeight: 600 }}>Revenue Generated</Typography>
                <Typography variant="h4" style={{ fontWeight: 800 }}>INR 0.00</Typography>
              </Box>
              <MonetizationOnIcon style={{ fontSize: 40, color: '#10b981' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card style={{ borderRadius: 12, borderLeft: '6px solid #8b5cf6' }}>
            <CardContent style={{ display: 'flex', alignItems: 'center' }}>
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary" style={{ fontWeight: 600 }}>Tickets Sold</Typography>
                <Typography variant="h4" style={{ fontWeight: 800 }}>0</Typography>
              </Box>
              <ConfirmationNumberIcon style={{ fontSize: 40, color: '#8b5cf6' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box display="flex" gap={2}>
        <Button variant="contained" onClick={() => navigate(ROUTES.EVENT_CREATE)} style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}>
          Create New Event
        </Button>
        <Button variant="outlined" onClick={() => navigate(ROUTES.EVENTS)} style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}>
          View My Events
        </Button>
      </Box>
    </Box>
  );

  const renderEmployeeDashboard = () => (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" style={{ fontWeight: 800 }}>Staff Portal - {userName}</Typography>
        <Typography variant="body1" color="textSecondary">Quick access tools for scanning and attendee verification.</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 12, p: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600 }}>Launch Pass Scanner</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Use the camera to validate QR codes / barcodes printed on user tickets.
              </Typography>
              <Button variant="contained" onClick={() => navigate(ROUTES.SCANNER)} startIcon={<QrCodeScannerIcon />} style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}>
                Open Camera Scanner
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 12, p: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600 }}>Attendance logs</Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Check the entry history for the current events.
              </Typography>
              <Button variant="outlined" onClick={() => navigate(ROUTES.ATTENDANCE)} style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}>
                View Logs
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderVisitorDashboard = () => (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" style={{ fontWeight: 800 }}>Discover Exciting Events</Typography>
        <Typography variant="body1" color="textSecondary">Book tickets and manage your passes.</Typography>
      </Box>
      <Box display="flex" gap={2}>
        <Button variant="contained" onClick={() => navigate(ROUTES.EVENTS)} style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}>
          Browse Events
        </Button>
        <Button variant="outlined" onClick={() => navigate(ROUTES.BOOKINGS)} style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}>
          View My Bookings
        </Button>
      </Box>
    </Box>
  );

  return (
    <DashboardLayout>
      {role === ROLES.SUPER_ADMIN && renderSuperAdminDashboard()}
      {role === ROLES.ORGANIZER && renderOrganizerDashboard()}
      {role === ROLES.EMPLOYEE && renderEmployeeDashboard()}
      {role === ROLES.VISITOR && renderVisitorDashboard()}
    </DashboardLayout>
  );
};

export default DashboardPage;
