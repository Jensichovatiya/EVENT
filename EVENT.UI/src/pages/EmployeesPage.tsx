import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { authApi } from '../api/authApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import AppSwitch from '../components/AppSwitch';
import { toast } from 'sonner';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await authApi.getUsers();
      if (res.success) {
        // Filter only employees
        const list = (res.data || []).filter((u: any) => u.roleName === 'Employee');
        setEmployees(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const res = await authApi.updateUserStatus({ userId, isActive: !currentStatus });
      toast.success(res.message || 'Status updated successfully.');
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const columns = [
    { header: 'Employee ID', accessor: 'userId' },
    { header: 'Name', accessor: 'userName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Mobile No', accessor: 'mobileNo' },
    {
      header: 'Active Status',
      accessor: (row: any) => (
        <AppSwitch
          checked={row.isActive}
          onCheckedChange={() => handleToggleStatus(row.userId, row.isActive)}
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Employee Management</Typography>
        <Typography variant="body2" color="textSecondary">Overview of all event organizers' employee roles and access status.</Typography>
      </Box>

      {loading ? (
        <AppLoader message="Retrieving employee list..." />
      ) : (
        <AppTable
          columns={columns}
          data={employees}
          searchKey="userName"
          searchPlaceholder="Search by employee name..."
        />
      )}
    </DashboardLayout>
  );
};

export default EmployeesPage;
