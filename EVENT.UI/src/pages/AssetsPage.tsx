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
import AppDropdown from '../components/AppDropdown';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [assetTypes, setAssetTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchAssetsAndTypes = async () => {
    setLoading(true);
    try {
      const [assetsRes, typesRes] = await Promise.all([
        assetApi.getAssets(),
        assetApi.getAssetTypes()
      ]);
      if (assetsRes.success) {
        setAssets(assetsRes.data || []);
      }
      if (typesRes.success) {
        setAssetTypes(typesRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsAndTypes();
  }, []);

  const handleOpenAdd = () => {
    setEditingAsset(null);
    reset({
      assetName: '',
      assetRId: '',
      assetTypeId: '',
      assetCode: '',
      description: '',
      totalQty: 1,
      availableQty: 1,
      damageQty: 0,
      unitPrice: 0,
      purchaseDate: '',
      vendorName: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (asset: any) => {
    setEditingAsset(asset);
    reset({
      assetName: asset.assetName || '',
      assetRId: asset.assetRId || '',
      assetTypeId: asset.assetTypeId || '',
      assetCode: asset.assetCode || asset.serialNumber || '',
      description: asset.description || '',
      totalQty: asset.totalQty ?? asset.totalQuantity ?? 1,
      availableQty: asset.availableQty ?? asset.availableQuantity ?? 0,
      damageQty: asset.damageQty ?? 0,
      unitPrice: asset.unitPrice ?? 0,
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      vendorName: asset.vendorName || '',
    });
    setOpenModal(true);
  };

  const handleSaveAsset = async (data: any) => {
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = userObj?.email || userObj?.userName || 'system';

      const payload = {
        assetId: editingAsset ? editingAsset.assetId : 0,
        assetRId: editingAsset ? editingAsset.assetRId : '',
        assetName: data.assetName,
        assetTypeId: Number(data.assetTypeId),
        assetCode: data.assetCode,
        serialNumber: data.assetCode,
        description: data.description,
        totalQty: Number(data.totalQty),
        totalQuantity: Number(data.totalQty),
        availableQty: Number(data.availableQty),
        availableQuantity: Number(data.availableQty),
        damageQty: Number(data.damageQty || 0),
        unitPrice: Number(data.unitPrice || 0),
        purchaseDate: data.purchaseDate || null,
        vendorName: data.vendorName || '',
        createdBy: editingAsset ? editingAsset.createdBy : userEmail,
        createdFrom: editingAsset ? editingAsset.createdFrom : 'WebUI',
        updatedBy: userEmail,
        updatedFrom: 'WebUI'
      };

      const res = await assetApi.addEditAsset(payload);
      toast.success(res.message || 'Asset saved successfully.');
      setOpenModal(false);
      reset();
      fetchAssetsAndTypes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save asset.');
    }
  };

  const columns = [
    { header: 'Asset Code', accessor: (row: any) => row.assetCode || row.serialNumber || '—' },
    { header: 'Asset Name', accessor: 'assetName' },
    { header: 'Type', accessor: (row: any) => row.typeName || row.assetTypeName || '—' },
    { header: 'Total Qty', accessor: (row: any) => row.totalQty ?? row.totalQuantity ?? '—' },
    { header: 'Available Qty', accessor: (row: any) => row.availableQty ?? row.availableQuantity ?? '—' },
    { header: 'Damage Qty', accessor: (row: any) => row.damageQty ?? 0 },
    { header: 'Unit Price', accessor: (row: any) => row.unitPrice ? `₹${row.unitPrice}` : '—' },
    { header: 'Vendor', accessor: (row: any) => row.vendorName || '—' },
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
          <Typography variant="h5" style={{ fontWeight: 800 }}>Asset Inventory</Typography>
          <Typography variant="body2" color="textSecondary">Manage and allocate system assets / physical resources.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={handleOpenAdd}
          style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}
        >
          Add Asset
        </Button>
      </Box>

      {loading ? (
        <AppLoader message="Retrieving asset registry..." />
      ) : (
        <AppTable
          columns={columns}
          data={assets}
          searchKey="assetName"
          searchPlaceholder="Search assets..."
        />
      )}

      <AppModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
        maxWidth="md"
        actions={
          <>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit(handleSaveAsset)}>
              {editingAsset ? 'Save Changes' : 'Create Asset'}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {/* Row 1: Name + Type */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <AppInput
              label="Asset Name *"
              register={register('assetName', { required: 'Asset name is required' })}
              errorText={errors.assetName?.message as string}
            />
            <AppDropdown
              label="Asset Type *"
              register={register('assetTypeId', { required: 'Asset Type is required' })}
              errorText={errors.assetTypeId?.message as string}
              options={assetTypes.map(t => ({ label: t.typeName || t.assetTypeName, value: t.assetTypeId }))}
            />
          </Box>

          {/* Row 2: Code + Description */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <AppInput
              label="Asset Code / Serial Number *"
              register={register('assetCode', { required: 'Asset Code is required' })}
              errorText={errors.assetCode?.message as string}
            />
            <AppInput
              label="Description"
              register={register('description')}
            />
          </Box>

          {/* Row 3: Total Qty + Available Qty + Damage Qty */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            <AppInput
              label="Total Quantity *"
              type="number"
              register={register('totalQty', { required: 'Total Quantity is required' })}
              errorText={errors.totalQty?.message as string}
            />
            <AppInput
              label="Available Quantity"
              type="number"
              register={register('availableQty')}
            />
            <AppInput
              label="Damage Quantity"
              type="number"
              register={register('damageQty')}
            />
          </Box>

          {/* Row 4: Unit Price + Purchase Date + Vendor */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            <AppInput
              label="Unit Price (₹)"
              type="number"
              register={register('unitPrice')}
            />
            <AppInput
              label="Purchase Date"
              type="date"
              register={register('purchaseDate')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <AppInput
              label="Vendor Name"
              register={register('vendorName')}
            />
          </Box>
        </Box>
      </AppModal>
    </DashboardLayout>
  );
};

export default AssetsPage;
