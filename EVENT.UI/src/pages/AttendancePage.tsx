import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import { scannerApi } from '../api/scannerApi';

export const AttendancePage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await scannerApi.getScanHistory();
        if (res.success) {
          setHistory(res.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  const columns = [
    { header: 'Pass Code', accessor: 'passCode' },
    { header: 'Event Name', accessor: 'eventName' },
    { header: 'Attendee Holder', accessor: 'holderName' },
    { header: 'Verification Agent', accessor: 'scannerUserName' },
    { header: 'Entry Timestamp', accessor: (row: any) => new Date(row.scanDate).toLocaleString() },
  ];

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Gate Entry & Attendance Logs</Typography>
        <Typography variant="body2" color="textSecondary">Real-time logs of visitor entries verified at scanning points.</Typography>
      </Box>

      <AppTable
        columns={columns}
        data={history}
        searchKey="passCode"
        searchPlaceholder="Filter entry logs by pass code..."
      />
    </DashboardLayout>
  );
};

export default AttendancePage;
