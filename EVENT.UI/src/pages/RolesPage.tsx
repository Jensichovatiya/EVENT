import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { authApi } from '../api/authApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import AppModal from '../components/AppModal';
import AppInput from '../components/AppInput';
import { useForm } from 'react-hook-form';

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await authApi.getRoles();
      if (res.success) {
        setRoles(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async (data: any) => {
    try {
      const res = await authApi.addEditRole(data);
      if (res.success) {
        setOpenModal(false);
        reset();
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        const res = await authApi.deleteRole(id);
        if (res.success) {
          fetchRoles();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const columns = [
    { header: 'Role ID', accessor: 'roleId' },
    { header: 'Role Name', accessor: 'roleName' },
    { header: 'Role Code', accessor: 'roleCode' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <IconButton onClick={() => handleDeleteRole(row.roleId)} color="error" size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" style={{ fontWeight: 800 }}>Roles Management</Typography>
          <Typography variant="body2" color="textSecondary">Manage system access levels and permissions.</Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
          startIcon={<AddCircleIcon />}
          style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          Add Role
        </Button>
      </Box>

      {loading ? (
        <AppLoader message="Retrieving roles list..." />
      ) : (
        <AppTable
          columns={columns}
          data={roles}
          searchKey="roleName"
          searchPlaceholder="Search roles..."
        />
      )}

      <AppModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Add New Role"
        actions={
          <>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit(handleAddRole)}>Save Role</Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <AppInput
            label="Role Name"
            register={register('roleName', { required: 'Role Name is required' })}
            errorText={errors.roleName?.message as string}
          />
          <AppInput
            label="Role Code"
            register={register('roleCode', { required: 'Role Code is required' })}
            errorText={errors.roleCode?.message as string}
          />
          <AppInput
            label="Description"
            multiline
            rows={3}
            register={register('description')}
          />
        </Box>
      </AppModal>
    </DashboardLayout>
  );
};

export default RolesPage;
