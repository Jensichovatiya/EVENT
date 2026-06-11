import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { bookingApi } from '../api/bookingApi';
import { toast } from 'sonner';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import StatusChip from '../components/StatusChip';

export const BookingListPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getBookings();
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingRId: string) => {
    if (!bookingRId) {
      toast.error('Booking identifier is missing.');
      return;
    }
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await bookingApi.cancelBooking(bookingRId);
      toast.success(res.message || 'Booking cancelled successfully.');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  const columns = [
    { header: 'Booking No', accessor: 'bookingReference' },
    { header: 'Event Name', accessor: 'eventName' },
    { header: 'User Name', accessor: 'userName' },
    { header: 'Qty', accessor: 'ticketQty' },
    { header: 'Net Amount', accessor: (row: any) => `INR ${row.netAmount}` },
    { header: 'Booking Date', accessor: (row: any) => new Date(row.bookingDate).toLocaleDateString() },
    { header: 'Status', accessor: (row: any) => <StatusChip status={row.bookingStatus} type="booking" /> },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Box display="flex" gap={1}>
          {row.bookingStatus !== 2 && row.bookingStatus !== 4 && (
            <IconButton onClick={() => handleCancelBooking(row.bookingRId)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Bookings Registry</Typography>
        <Typography variant="body2" color="textSecondary">Manage visitor bookings and registrations.</Typography>
      </Box>

      {loading ? (
        <AppLoader message="Loading bookings..." />
      ) : (
        <AppTable
          columns={columns}
          data={bookings}
          searchKey="bookingNumber"
          searchPlaceholder="Search by Booking No..."
        />
      )}
    </DashboardLayout>
  );
};

export default BookingListPage;
