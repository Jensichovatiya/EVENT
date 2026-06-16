import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { scannerApi } from '../api/scannerApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';

export const ScannerLogsPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await scannerApi.getScanHistory();
      if (res.success) {
        setHistory(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const columns = [
    { header: 'Pass Code', accessor: 'passCode' },
    { header: 'Event Name', accessor: 'eventName' },
    { header: 'Scanned By', accessor: 'scannerUserName' },
    { header: 'Scan Date', accessor: (row: any) => new Date(row.scanDate).toLocaleString() },
    {
      header: 'Status',
      accessor: (row: any) => (
        <Typography variant="body2" style={{ color: row.status === 1 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
          {row.status === 1 ? 'Approved' : 'Failed'}
        </Typography>
      )
    },
    { header: 'Validation Message', accessor: 'validationMessage' }
  ];

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Scanner Logs</Typography>
        <Typography variant="body2" color="textSecondary">Audit trail of ticket scanner validations and entries.</Typography>
      </Box>

      {loading ? (
        <AppLoader message="Retrieving scanner validation logs..." />
      ) : (
        <AppTable
          columns={columns}
          data={history}
          searchKey="passCode"
          searchPlaceholder="Search by pass code..."
        />
      )}
    </DashboardLayout>
  );
};

export default ScannerLogsPage;
