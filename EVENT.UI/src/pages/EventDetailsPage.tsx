import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent, List, ListItem, ListItemText, Divider } from '@mui/material';
import { eventApi } from '../api/eventApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppLoader from '../components/AppLoader';
import StatusChip from '../components/StatusChip';
import { ROUTES } from '../constants/appConstants';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await eventApi.getEvents(id);
        if (res.success) {
          setEvent(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  if (loading || !event) {
    return (
      <DashboardLayout>
        <AppLoader message="Loading event details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" style={{ fontWeight: 800 }}>{event.eventName}</Typography>
          <Typography variant="caption" color="textSecondary" style={{ letterSpacing: 1 }}>CODE: {event.eventCode}</Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate(ROUTES.EVENTS)} style={{ textTransform: 'none', borderRadius: 8 }}>
          Back to list
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 12 }}>About Event</Typography>
              <Typography variant="body1" color="textPrimary" sx={{ mb: 2 }}>{event.about || event.description}</Typography>
              
              <Divider style={{ margin: '16px 0' }} />

              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 12 }}>Terms & Conditions</Typography>
              <Typography variant="body2" color="textSecondary">{event.termsAndConditions || 'No custom terms specified.'}</Typography>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: 12 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>Available Slots</Typography>
              <List>
                {event.slots && event.slots.map((slot: any) => (
                  <ListItem key={slot.slotId} divider>
                    <ListItemText
                      primary={`Date: ${new Date(slot.slotDate).toLocaleDateString()}`}
                      secondary={`Timing: ${slot.startTime} - ${slot.endTime} | Capacity: ${slot.capacity}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>Details</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Price:</Typography>
                <Typography variant="body2" style={{ fontWeight: 600 }}>INR {event.ticketPrice}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Category:</Typography>
                <Typography variant="body2" style={{ fontWeight: 600 }}>{event.categoryName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Publish Status:</Typography>
                <StatusChip status={event.isPublishActive} type="publish" />
              </Box>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: 12 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>Location</Typography>
              <Typography variant="body2" style={{ fontWeight: 600 }}>{event.locationName}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>{event.address}</Typography>
              <Typography variant="caption" color="textSecondary">
                Lat/Long: {event.latitude}, {event.longitude}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default EventDetailsPage;
