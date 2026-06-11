import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { toast } from 'sonner';
import { eventApi } from '../api/eventApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';

export const EventApprovalPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventApi.getEvents();
      if (res.success) {
        // filter events that are not yet active/approved
        const pending = (res.data || []).filter((e: any) => !e.isPublishActive);
        setEvents(pending);
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

  const handleApprove = async (eventRId: string) => {
    try {
      const res = await eventApi.updateEventStatus({ eventRId, isActive: true });
      toast.success(res.message || 'Event approved and published successfully.');
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve event');
    }
  };

  const columns = [
    { header: 'Event Code', accessor: 'eventCode' },
    { header: 'Event Name', accessor: 'eventName' },
    { header: 'Category', accessor: 'categoryName' },
    { header: 'Ticket Price', accessor: (row: any) => `INR ${row.ticketPrice || 0}` },
    { header: 'Capacity', accessor: 'capacity' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={() => handleApprove(row.eventRId)}
            style={{ textTransform: 'none', borderRadius: 6, fontWeight: 600 }}
          >
            Approve & Publish
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Event Approvals</Typography>
        <Typography variant="body2" color="textSecondary">Approve pending event registration and publication requests.</Typography>
      </Box>

      {loading ? (
        <AppLoader message="Retrieving pending events..." />
      ) : (
        <AppTable
          columns={columns}
          data={events}
          searchKey="eventName"
          searchPlaceholder="Search by event name..."
        />
      )}
    </DashboardLayout>
  );
};

export default EventApprovalPage;
