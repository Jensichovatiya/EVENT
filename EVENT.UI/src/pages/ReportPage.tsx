import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Tabs, Tab } from '@mui/material';
import { reportApi } from '../api/reportApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppLoader from '../components/AppLoader';
import AppTable from '../components/AppTable';

export const ReportPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [revenueReport, setRevenueReport] = useState<any[]>([]);
  const [bookingReport, setBookingReport] = useState<any[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tabIndex === 0) {
        const res = await reportApi.getRevenueReport();
        setRevenueReport(res.data || []);
      } else if (tabIndex === 1) {
        const res = await reportApi.getBookingReport();
        setBookingReport(res.data || []);
      } else {
        const res = await reportApi.getAttendanceReport();
        setAttendanceReport(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tabIndex]);

  const revenueColumns = [
    { header: 'Event Name', accessor: 'eventName' },
    { header: 'Event Code', accessor: 'eventCode' },
    { header: 'Total Bookings', accessor: 'totalBookings' },
    { header: 'Total Revenue', accessor: (row: any) => `INR ${row.totalRevenue || 0}` },
  ];

  const bookingColumns = [
    { header: 'Event Name', accessor: 'eventName' },
    { header: 'Slots Count', accessor: 'slotsCount' },
    { header: 'Tickets Booked', accessor: 'ticketsBooked' },
    { header: 'Remaining Capacity', accessor: 'remainingCapacity' },
  ];

  const attendanceColumns = [
    { header: 'Event Name', accessor: 'eventName' },
    { header: 'Attendee Name', accessor: 'holderName' },
    { header: 'Pass Code', accessor: 'passCode' },
    { header: 'Scanned Time', accessor: (row: any) => new Date(row.scanDate).toLocaleString() },
  ];

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Analytics & Reports</Typography>
        <Typography variant="body2" color="textSecondary">Analyze revenue metrics, registrations, and visitor check-in events.</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, idx) => setTabIndex(idx)}>
          <Tab label="Revenue Reports" style={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Booking Reports" style={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Attendance Reports" style={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {loading ? (
        <AppLoader message="Gathering analytical summaries..." />
      ) : (
        <Box>
          {tabIndex === 0 && (
            <AppTable
              columns={revenueColumns}
              data={revenueReport}
              searchKey="eventName"
              searchPlaceholder="Search event revenue..."
            />
          )}
          {tabIndex === 1 && (
            <AppTable
              columns={bookingColumns}
              data={bookingReport}
              searchKey="eventName"
              searchPlaceholder="Search event booking..."
            />
          )}
          {tabIndex === 2 && (
            <AppTable
              columns={attendanceColumns}
              data={attendanceReport}
              searchKey="eventName"
              searchPlaceholder="Search attendee check-ins..."
            />
          )}
        </Box>
      )}
    </DashboardLayout>
  );
};

export default ReportPage;
