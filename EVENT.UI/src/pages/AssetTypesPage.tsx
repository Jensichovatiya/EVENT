import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { assetApi } from '../api/assetApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import AppModal from '../components/AppModal';
import AppInput from '../components/AppInput';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const AssetTypesPage: React.FC = () => {
  const [assetTypes, setAssetTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingType, setEditingType] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchAssetTypes = async () => {
    setLoading(true);
    try {
      const res = await assetApi.getAssetTypes();
      if (res.success) {
        setAssetTypes(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetTypes();
  }, []);

  const handleOpenAdd = () => {
    setEditingType(null);
    reset({
      typeName: '',
      assetTypeRId: '',
      description: ''
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (type: any) => {
    setEditingType(type);
    reset({
      typeName: type.typeName || type.assetTypeName || '',
      assetTypeRId: type.assetTypeRId || '',
      description: type.description || ''
    });
    setOpenModal(true);
  };

  const handleSaveType = async (data: any) => {
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = userObj?.email || userObj?.userName || 'system';

      const payload = {
        assetTypeId: editingType ? editingType.assetTypeId : 0,
        assetTypeRId: editingType ? editingType.assetTypeRId : '',
        assetTypeName: data.typeName,
        typeName: data.typeName,
        description: data.description,
        createdBy: editingType ? editingType.createdBy : userEmail,
        createdFrom: editingType ? editingType.createdFrom : 'WebUI',
        updatedBy: userEmail,
        updatedFrom: 'WebUI'
      };

      const res = await assetApi.addEditAssetType(payload);
      toast.success(res.message || 'Asset Type saved successfully.');
      setOpenModal(false);
      reset();
      fetchAssetTypes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save asset type.');
    }
  };

  const columns = [
    { header: 'Type Code', accessor: 'assetTypeRId' },
    { header: 'Type Name', accessor: 'typeName' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => handleOpenEdit(row)}>
            <EditIcon fontSize="small" style={{ color: '#10b981' }} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" style={{ fontWeight: 800 }}>Asset Types</Typography>
          <Typography variant="body2" color="textSecondary">Manage classifications for physical resources.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={handleOpenAdd}
          style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          Add Asset Type
        </Button>
      </Box>

      {loading ? (
        <AppLoader message="Retrieving asset classifications..." />
      ) : (
        <AppTable
          columns={columns}
          data={assetTypes}
          searchKey="typeName"
          searchPlaceholder="Search type by name..."
        />
      )}

      <AppModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingType ? 'Edit Asset Type' : 'Add New Asset Type'}
        actions={
          <>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit(handleSaveType)}>
              {editingType ? 'Save Changes' : 'Create Asset Type'}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <AppInput
            label="Type Name"
            register={register('typeName', { required: 'Type name is required' })}
            errorText={errors.typeName?.message as string}
          />

          <AppInput
            label="Description"
            register={register('description', { required: 'Description is required' })}
            errorText={errors.description?.message as string}
          />
        </Box>
      </AppModal>
    </DashboardLayout>
  );
};

export default AssetTypesPage;
