import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Box, Typography, Button, IconButton, TextField, InputAdornment, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { eventApi } from '../api/eventApi';
import DashboardLayout from '../layouts/DashboardLayout';
import { ROUTES, ROLES } from '../constants/appConstants';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import StatusChip from '../components/StatusChip';

export const EventListPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const role = localStorage.getItem('userRole') || ROLES.VISITOR;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventApi.getEvents();
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDuplicate = async (eventRId: string) => {
    const newName = prompt('Enter name for the duplicated event:');
    if (!newName) return;
    try {
      const res = await eventApi.duplicateEvent({ eventRId, newEventName: newName });
      toast.success(res.message || 'Event duplicated successfully.');
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate event');
    }
  };

  const handleStatusToggle = async (eventRId: string, currentStatus: boolean) => {
    try {
      const res = await eventApi.updateEventStatus({ eventRId, isActive: !currentStatus });
      toast.success(res.message || 'Status updated successfully.');
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const columns = [
    { header: 'Event Code', accessor: 'eventCode' },
    { header: 'Event Name', accessor: 'eventName' },
    { header: 'Category', accessor: 'categoryName' },
    { header: 'Ticket Price', accessor: (row: any) => `INR ${row.ticketPrice || 0}` },
    { header: 'Capacity', accessor: 'capacity' },
    {
      header: 'Status',
      accessor: (row: any) => (
        <Button onClick={() => role === ROLES.SUPER_ADMIN && handleStatusToggle(row.eventRId, row.isPublishActive)}>
          <StatusChip status={row.isPublishActive} type="publish" />
        </Button>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => navigate(ROUTES.EVENT_DETAILS.replace(':id', row.eventRId || row.eventId))}>
            <VisibilityIcon fontSize="small" style={{ color: '#3b82f6' }} />
          </IconButton>
          {(role === ROLES.SUPER_ADMIN || role === ROLES.ORGANIZER) && (
            <>
              <IconButton size="small" onClick={() => navigate(ROUTES.EVENT_EDIT.replace(':id', row.eventRId || row.eventId))}>
                <EditIcon fontSize="small" style={{ color: '#10b981' }} />
              </IconButton>
              <IconButton size="small" onClick={() => handleDuplicate(row.eventRId || row.eventId)}>
                <FileCopyIcon fontSize="small" style={{ color: '#f59e0b' }} />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" style={{ fontWeight: 800 }}>Events Catalog</Typography>
          <Typography variant="body2" color="textSecondary">Browse and manage active events, slots, and bookings.</Typography>
        </Box>
        {(role === ROLES.SUPER_ADMIN || role === ROLES.ORGANIZER) && (
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => navigate(ROUTES.EVENT_CREATE)}
            style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}
          >
            Create Event
          </Button>
        )}
      </Box>

      {loading ? (
        <AppLoader message="Loading events list..." />
      ) : (
        <AppTable
          columns={columns}
          data={events}
          searchKey="eventName"
          searchPlaceholder="Search event by name..."
        />
      )}
    </DashboardLayout>
  );
};

export default EventListPage;
