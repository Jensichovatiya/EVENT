import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { eventApi } from '../api/eventApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import AppModal from '../components/AppModal';
import AppInput from '../components/AppInput';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await eventApi.getFacilities();
      if (res.success) {
        setFacilities(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenAdd = () => {
    setEditingFacility(null);
    reset({
      facilityName: ''
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (facility: any) => {
    setEditingFacility(facility);
    reset({
      facilityName: facility.facilityName
    });
    setOpenModal(true);
  };

  const handleSaveFacility = async (data: any) => {
    try {
      const userId = Number(localStorage.getItem('userId') || 0);

      const payload = {
        facilityId: editingFacility ? editingFacility.facilityId : 0,
        facilityName: data.facilityName,
        userId: userId > 0 ? userId : null
      };

      const res = await eventApi.addEditFacility(payload);
      if (res.success) {
        toast.success(res.message || 'Facility saved successfully.');
        setOpenModal(false);
        reset();
        fetchFacilities();
      } else {
        toast.error(res.message || 'Failed to save facility.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save facility.');
    }
  };

  const handleDelete = async (facilityId: number) => {
    if (!facilityId) {
      toast.error('Facility identifier is missing.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try {
      const res = await eventApi.deleteFacility(facilityId);
      if (res.success) {
        toast.success(res.message || 'Facility deleted successfully.');
        fetchFacilities();
      } else {
        toast.error(res.message || 'Failed to delete facility.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete facility.');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'facilityId' },
    { header: 'Facility Name', accessor: 'facilityName' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton onClick={() => handleOpenEdit(row)} color="primary" size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.facilityId)} color="error" size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" style={{ fontWeight: 800 }}>Venue Facilities & Features</Typography>
          <Typography variant="body2" color="textSecondary">Manage master venue facilities, features, and amenities available for selection during event creation.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={handleOpenAdd}
          style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          Add Facility
        </Button>
      </Box>

      {loading ? (
        <AppLoader message="Retrieving facilities list..." />
      ) : (
        <AppTable
          columns={columns}
          data={facilities}
          searchKey="facilityName"
          searchPlaceholder="Search facilities..."
        />
      )}

      <AppModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingFacility ? 'Edit Facility' : 'Add New Facility'}
        actions={
          <>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit(handleSaveFacility)}>
              {editingFacility ? 'Save Changes' : 'Create Facility'}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <AppInput
            label="Facility Name"
            register={register('facilityName', { required: 'Facility Name is required' })}
            errorText={errors.facilityName?.message as string}
          />
        </Box>
      </AppModal>
    </DashboardLayout>
  );
};

export default FacilitiesPage;
