import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Avatar, AvatarFallback, AvatarImage } from '@/Ui/avatar';
import { Badge } from '@/Ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Ui/tooltip';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { assetApi } from '../api/assetApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import AppModal from '../components/AppModal';
import AppInput from '../components/AppInput';
import ConfirmDialog from '../components/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const EP = {
  primary: '#6C3EF2',
  primarySoft: '#EEEAFE',
  text: '#1A1A2E',
  muted: '#6B7280',
  line: '#E5E7EB',
  bg: '#F9FAFB',
} as const;

export const AssetTypesPage: React.FC = () => {
  const [assetTypes, setAssetTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingType, setEditingType] = useState<any | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Synchronize form values when opening/closing the modal to ensure pre-filling works correctly
  useEffect(() => {
    const loadDetails = async () => {
      if (editingType) {
        try {
          const res = await assetApi.getAssetTypeById(editingType.assetTypeId);
          if (res.success && res.data) {
            const data = res.data;
            const existingIcon = data.iconUrl || '';
            setIconPreview(existingIcon);
            reset({
              typeName: data.typeName || data.assetTypeName || '',
              assetTypeRId: data.assetTypeRId || '',
              description: data.description || '',
            });
          }
        } catch (err) {
          toast.error('Failed to fetch asset type details.');
        }
      }
    };

    if (openModal) {
      if (editingType) {
        loadDetails();
      } else {
        setIconPreview('');
        reset({
          typeName: '',
          assetTypeRId: '',
          description: '',
        });
      }
      setUploadedFile(null);
    }
  }, [openModal, editingType, reset]);

  const handleOpenAdd = () => {
    setEditingType(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (type: any) => {
    setEditingType(type);
    setOpenModal(true);
  };

  // Handle local file select — show preview only, actual upload happens on Save
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    setUploadedFile(file);
    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setIconPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveType = async (data: any) => {
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = userObj?.email || userObj?.userName || 'system';

      const payload = {
        assetTypeId:  editingType ? editingType.assetTypeId  : 0,
        assetTypeRId: editingType ? editingType.assetTypeRId : '',
        assetTypeName: data.typeName,
        typeName:     data.typeName,
        description:  data.description,
        iconUrl:      iconPreview || '',   // kept if no new file selected
        createdBy:    editingType ? editingType.createdBy   : userEmail,
        createdFrom:  editingType ? editingType.createdFrom : 'WebUI',
        updatedBy:    userEmail,
        updatedFrom:  'WebUI'
      };

      // Pass uploadedFile — API will save it and override iconUrl
      const res = await assetApi.addEditAssetType(payload, uploadedFile ?? undefined);
      toast.success(res.message || 'Asset Type saved successfully.');
      setOpenModal(false);
      reset();
      setIconPreview('');
      setUploadedFile(null);
      fetchAssetTypes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save asset type.');
    }
  };

  const handleDeleteType = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await assetApi.deleteAssetType(deleteTarget.assetTypeId);
      if (res.success) {
        toast.success(res.message || 'Asset Type deleted successfully.');
        setDeleteTarget(null);
        fetchAssetTypes();
      } else {
        toast.error(res.message || 'Failed to delete asset type.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Unexpected error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Icon',
      accessor: (row: any) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-9 w-9 rounded-lg border" style={{ background: EP.primarySoft }}>
                <AvatarImage src={row.iconUrl || ''} alt={row.typeName} />
                <AvatarFallback className="rounded-lg" style={{ background: EP.primarySoft, color: EP.primary }}>
                  <ImageIcon sx={{ fontSize: 18 }} />
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{row.typeName || 'Asset Type'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    { header: 'Type Code', accessor: 'assetTypeRId' },
    { header: 'Type Name', accessor: (row: any) => row.typeName || row.assetTypeName || '—' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Icon Set',
      accessor: (row: any) => row.iconUrl
        ? <Badge variant="success" size="sm">Yes</Badge>
        : <Badge variant="destructive" size="sm">No</Badge>
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => handleOpenEdit(row)}>
            <EditIcon fontSize="small" style={{ color: '#10b981' }} />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleteTarget(row)}>
            <DeleteOutlineIcon fontSize="small" style={{ color: '#ef4444' }} />
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
          searchKey="assetTypeName"
          searchPlaceholder="Search type by name..."
        />
      )}

      <AppModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingType ? 'Edit Asset Type' : 'Add New Asset Type'}
        maxWidth="sm"
        actions={
          <>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit(handleSaveType)}>
              {editingType ? 'Save Changes' : 'Create Asset Type'}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <AppInput
            label="Type Name *"
            register={register('typeName', { required: 'Type name is required' })}
            errorText={errors.typeName?.message as string}
          />

          <AppInput
            label="Description *"
            register={register('description', { required: 'Description is required' })}
            errorText={errors.description?.message as string}
          />

          {/* ─── Icon / Image Section ─── */}
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: EP.text, mb: 1 }}>
              Asset Type Icon / Image
            </Typography>

            <Button
              size="small"
              variant="contained"
              startIcon={<ImageIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ textTransform: 'none', borderRadius: 6, fontSize: '0.75rem', mb: 1.5 }}
            >
              Upload Image
            </Button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* Preview Box */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '12px',
                  border: `2px dashed ${iconPreview ? EP.primary : EP.line}`,
                  bgcolor: iconPreview ? 'transparent' : EP.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: EP.primary,
                    bgcolor: EP.primarySoft + '44'
                  }
                }}
              >
                {iconPreview ? (
                  <Box
                    component="img"
                    src={iconPreview}
                    alt="Preview"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                    onError={() => setIconPreview('')}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 28, color: EP.muted }} />
                )}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: EP.muted }}>
                  {iconPreview ? '✅ Icon preview ready' : 'No icon set yet — floor plan cards will show a default icon.'}
                </Typography>
                {uploadedFile && (
                  <Typography sx={{ fontSize: '0.72rem', color: EP.primary, fontWeight: 600, mt: 0.5 }}>
                    📁 {uploadedFile.name}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </AppModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteType}
        title="Delete Asset Type"
        message={`Are you sure you want to delete "${deleteTarget?.typeName || deleteTarget?.assetTypeName || 'this asset type'}"? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
      />
    </DashboardLayout>
  );
};

export default AssetTypesPage;
