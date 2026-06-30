import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setLogs([
      { logId: 101, action: 'User Registration', tableName: 'Tracket_Master_User', userId: 12, userName: 'John Doe', actionDate: new Date().toISOString(), details: 'Successfully registered via visitor portal.' },
      { logId: 102, action: 'Event Approval', tableName: 'Tracket_Master_Event', userId: 1, userName: 'SuperAdmin', actionDate: new Date().toISOString(), details: 'Approved event: TECHFEST 2026' },
      { logId: 103, action: 'Payment Refund', tableName: 'Tracket_Master_Payment', userId: 2, userName: 'Organizer X', actionDate: new Date().toISOString(), details: 'Refunded payment transaction TXN982348' },
    ]);
  }, []);

  const columns = [
    { header: 'Log ID', accessor: 'logId' },
    { header: 'Action', accessor: 'action' },
    { header: 'Table Affected', accessor: 'tableName' },
    { header: 'User', accessor: 'userName' },
    { header: 'Date', accessor: (row: any) => new Date(row.actionDate).toLocaleString() },
    { header: 'Details', accessor: 'details' },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Audit Logs</Typography>
        <Typography variant="body2" color="textSecondary">Security audit trails and database mutation activities.</Typography>
      </Box>

      <AppTable
        columns={columns}
        data={logs}
        searchKey="action"
        searchPlaceholder="Search logs by action..."
      />
    </DashboardLayout>
  );
};

export default LogsPage;
