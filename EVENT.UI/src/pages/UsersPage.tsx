import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Switch } from '@mui/material';
import { authApi } from '../api/authApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';

import { toast } from 'sonner';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authApi.getUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const res = await authApi.updateUserStatus({ userId, isActive: !currentStatus });
      toast.success(res.message || 'Status updated successfully.');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status.');
    }
  };

  const columns = [
    { header: 'User ID', accessor: 'userId' },
    { header: 'Username', accessor: 'userName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Mobile No', accessor: 'mobileNo' },
    { header: 'Role', accessor: 'roleName' },
    {
      header: 'Active',
      accessor: (row: any) => (
        <Switch
          checked={row.isActive}
          onChange={() => handleToggleStatus(row.userId, row.isActive)}
          color="primary"
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>User Accounts</Typography>
        <Typography variant="body2" color="textSecondary">Manage all users registered in the system and toggle authorization status.</Typography>
      </Box>

      {loading ? (
        <AppLoader message="Retrieving user list..." />
      ) : (
        <AppTable
          columns={columns}
          data={users}
          searchKey="userName"
          searchPlaceholder="Search by username..."
        />
      )}
    </DashboardLayout>
  );
};

export default UsersPage;
