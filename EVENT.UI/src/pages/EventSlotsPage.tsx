import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, List, ListItem, ListItemText, Divider, Card, CardContent,
  Chip, Avatar, Select, MenuItem, FormControl, InputLabel, Grid, useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'sonner';
import { eventApi } from '../api/eventApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppInput from '../components/AppInput';
import AppDatePicker from '../components/AppDatePicker';
import AppLoader from '../components/AppLoader';
import { ROUTES } from '../constants/appConstants';

export const EventSlotsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  // Selected event tracking
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [eventData, setEventData] = useState<any>(null);
  
  // Loading & Action states
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);

  // Slots local states
  const [slots, setSlots] = useState<any[]>([]);
  const [newSlot, setNewSlot] = useState({
    slotDate: '',
    startTime: '09:00',
    endTime: '18:00',
    capacity: 100
  });

  // Load events list for the dropdown
  const loadEventsList = async () => {
    setLoadingEvents(true);
    try {
      const res = await eventApi.getEvents();
      if (res.success && res.data) {
        setEventsList(res.data);
      } else {
        toast.error('Failed to load events list.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching events list.');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load single event details (with slots & documents)
  const loadEventDetails = async (eventIdOrRId: string) => {
    if (!eventIdOrRId || eventIdOrRId === ':id') {
      setEventData(null);
      setSlots([]);
      return;
    }

    setLoadingDetails(true);
    try {
      const res = await eventApi.getEvents(eventIdOrRId);
      if (res.success && res.data) {
        setEventData(res.data);
        setSlots(res.data.slots || []);
        // Update new slot capacity default from event capacity if available
        setNewSlot(prev => ({
          ...prev,
          capacity: res.data.capacity || 100
        }));
      } else {
        toast.error('Failed to load event details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching event details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadEventsList();
  }, []);

  // Sync route param changes to selection state
  useEffect(() => {
    if (id && id !== ':id') {
      setSelectedEventId(id);
      loadEventDetails(id);
    } else {
      setSelectedEventId('');
      setEventData(null);
      setSlots([]);
    }
  }, [id]);

  const handleEventSelectChange = (e: any) => {
    const value = e.target.value;
    setSelectedEventId(value);
    if (value) {
      navigate(ROUTES.EVENT_SLOTS.replace(':id', value));
    } else {
      navigate(ROUTES.EVENT_SLOTS.replace('/:id', ''));
    }
  };

  const handleAddSlot = () => {
    if (!newSlot.slotDate) {
      toast.error('Please select a date for the slot.');
      return;
    }
    
    // Check if slotDate is valid
    const selectedDate = new Date(newSlot.slotDate);
    if (isNaN(selectedDate.getTime())) {
      toast.error('Invalid slot date.');
      return;
    }

    // Check capacity
    if (newSlot.capacity <= 0) {
      toast.error('Slot capacity must be greater than zero.');
      return;
    }

    // Check if slot already exists with same date and times
    const duplicate = slots.some(s => 
      s.slotDate.split('T')[0] === newSlot.slotDate && 
      s.startTime.slice(0, 5) === newSlot.startTime.slice(0, 5) && 
      s.endTime.slice(0, 5) === newSlot.endTime.slice(0, 5)
    );

    if (duplicate) {
      toast.warning('A slot with the same date and timings already exists.');
      return;
    }

    setSlots([...slots, { ...newSlot, slotId: 0 }]);
    setNewSlot({
      slotDate: '',
      startTime: '09:00',
      endTime: '18:00',
      capacity: eventData?.capacity || 100
    });
    toast.success('Slot added to list (unsaved).');
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
    toast.success('Slot removed from list.');
  };

  const handleSave = async () => {
    if (!eventData) return;
    
    setSaving(true);
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = localStorage.getItem('email') || userObj?.emailId || userObj?.email || userObj?.userName || 'system';

      const formData = new FormData();
      
      // Build the event model payload matching the request structure
      const payload = {
        ...eventData,
        slots: slots.map(s => ({
          ...s,
          // Format slotDate to YYYY-MM-DD
          slotDate: s.slotDate.split('T')[0]
        })),
        createdBy: eventData.eventId > 0 ? eventData.createdBy : userEmail,
        createdFrom: eventData.eventId > 0 ? eventData.createdFrom : 'WebUI',
        updatedBy: userEmail,
        updatedFrom: 'WebUI'
      };

      formData.append('model', JSON.stringify(payload));

      const res = await eventApi.addEditEvent(formData);
      if (res.success) {
        toast.success(res.message || 'Slots saved successfully!');
        // Reload details to sync IDs and states
        if (res.data) {
          loadEventDetails(res.data.eventRId || res.data.eventId.toString());
        }
      } else {
        toast.error(res.message || 'Failed to save slots.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
            Manage Event Slots
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Set and configure schedule slots for active and upcoming events.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(ROUTES.EVENTS)}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
        >
          Back to Events
        </Button>
      </Box>

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* Selector Panel */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 3 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="event-select-label">Choose an Event to Manage Slots</InputLabel>
                <Select
                  labelId="event-select-label"
                  value={selectedEventId}
                  onChange={handleEventSelectChange}
                  label="Choose an Event to Manage Slots"
                  disabled={loadingEvents}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>-- Select Event --</em>
                  </MenuItem>
                  {eventsList.map((evt) => (
                    <MenuItem key={evt.eventRId || evt.eventId} value={evt.eventRId || evt.eventId}>
                      {evt.eventName} ({evt.eventCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {loadingDetails ? (
          <Grid item xs={12}>
            <AppLoader message="Retrieving event details and slot registry..." />
          </Grid>
        ) : eventData ? (
          <>
            {/* Event Summary Details */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                border: '1px solid #e2e8f0', 
                height: '100%',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                    Event Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>Event Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{eventData.eventName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>Event Code</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>{eventData.eventCode}</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>Category</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{eventData.categoryName || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>Capacity</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{eventData.capacity} seats</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>Price</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                          {eventData.currency} {eventData.ticketPrice}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>Status</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip 
                            label={eventData.isPublishActive ? 'Active' : 'Draft'} 
                            color={eventData.isPublishActive ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 700, borderRadius: 1.5 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Slots Management */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: 3 }}>
                  
                  {/* Add Slot Form */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="primary" /> Add New Slot
                  </Typography>
                  <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: 2.5, mb: 4, border: '1px solid #f1f5f9' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <AppDatePicker
                          label="Slot Date"
                          value={newSlot.slotDate}
                          onChange={(e: any) => setNewSlot({ ...newSlot, slotDate: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2.5}>
                        <AppInput
                          label="Start Time"
                          type="time"
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2.5}>
                        <AppInput
                          label="End Time"
                          type="time"
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <AppInput
                          label="Capacity"
                          type="number"
                          value={newSlot.capacity}
                          onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value, 10) || 0 })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={handleAddSlot}
                          startIcon={<AddIcon />}
                          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, py: 1.6 }}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Slots List */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                    Existing Slots ({slots.length})
                  </Typography>

                  {slots.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 6, 
                      border: '2px dashed #cbd5e1', 
                      borderRadius: 2.5,
                      bgcolor: '#fafafa' 
                    }}>
                      <EventIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                        No slots assigned to this event yet.
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Create slots using the panel above.
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ border: '1px solid #f1f5f9', borderRadius: 2, p: 0, overflow: 'hidden' }}>
                      {slots.map((s, idx) => {
                        const dateStr = s.slotDate ? new Date(s.slotDate).toLocaleDateString() : '';
                        const start = s.startTime.substring(0, 5);
                        const end = s.endTime.substring(0, 5);
                        return (
                          <React.Fragment key={idx}>
                            <ListItem
                              secondaryAction={
                                <IconButton onClick={() => handleRemoveSlot(idx)} color="error" size="medium" sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' } }}>
                                  <DeleteIcon />
                                </IconButton>
                              }
                              sx={{ py: 2, px: 3, '&:hover': { bgcolor: '#f8fafc' }, transition: 'background-color 0.2s' }}
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                    <Chip 
                                      label={`Day ${idx + 1}`} 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined" 
                                      sx={{ fontWeight: 700, borderRadius: 1 }}
                                    />
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                      {dateStr} &nbsp;|&nbsp; {start} – {end}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                                    Available Seating Capacity: <strong>{s.capacity}</strong> seats
                                  </Typography>
                                }
                              />
                            </ListItem>
                            {idx < slots.length - 1 && <Divider />}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  )}

                  {/* Save Footer */}
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleSave}
                      disabled={saving}
                      startIcon={<SaveIcon />}
                      sx={{ 
                        textTransform: 'none', 
                        borderRadius: 2.5, 
                        fontWeight: 700, 
                        px: 4, 
                        py: 1.2,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        }
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Slots'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Box sx={{ 
              textAlign: 'center', 
              py: 8, 
              border: '1px dashed #cbd5e1', 
              borderRadius: 3,
              bgcolor: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <EventIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', mb: 0.5 }}>
                No Event Selected
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Please select an event from the list above to manage its scheduling slots.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </DashboardLayout>
  );
};

export default EventSlotsPage;
