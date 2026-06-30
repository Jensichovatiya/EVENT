import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Avatar, AvatarFallback, AvatarImage } from '@/Ui/avatar';
import { Badge } from '@/Ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Ui/tooltip';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import { assetApi } from '../api/assetApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import AppModal from '../components/AppModal';
import AppInput from '../components/AppInput';
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
  const [iconMode, setIconMode] = useState<'url' | 'upload'>('url');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const watchedIconUrl = watch('iconUrl', '');

  // Preview the URL typed by user
  useEffect(() => {
    if (iconMode === 'url') {
      setIconPreview(watchedIconUrl || '');
    }
  }, [watchedIconUrl, iconMode]);

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
    setIconPreview('');
    setUploadedFile(null);
    setIconMode('url');
    reset({ typeName: '', assetTypeRId: '', description: '', iconUrl: '' });
    setOpenModal(true);
  };

  const handleOpenEdit = (type: any) => {
    setEditingType(type);
    const existingIcon = type.iconUrl || '';
    setIconPreview(existingIcon);
    setUploadedFile(null);
    setIconMode('url');
    reset({
      typeName: type.typeName || type.assetTypeName || '',
      assetTypeRId: type.assetTypeRId || '',
      description: type.description || '',
      iconUrl: existingIcon,
    });
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
        iconUrl:      data.iconUrl || '',   // kept if no new file selected
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

            {/* Toggle: URL or Upload */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Button
                size="small"
                variant={iconMode === 'url' ? 'contained' : 'outlined'}
                startIcon={<LinkIcon />}
                onClick={() => setIconMode('url')}
                sx={{ textTransform: 'none', borderRadius: 6, fontSize: '0.75rem' }}
              >
                Image URL
              </Button>
              <Button
                size="small"
                variant={iconMode === 'upload' ? 'contained' : 'outlined'}
                startIcon={<ImageIcon />}
                onClick={() => { setIconMode('upload'); fileInputRef.current?.click(); }}
                sx={{ textTransform: 'none', borderRadius: 6, fontSize: '0.75rem' }}
              >
                Upload Image
              </Button>
            </Box>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* URL input (shown when mode is url) */}
            {iconMode === 'url' && (
              <AppInput
                label="Icon URL (https://...)"
                register={register('iconUrl')}
                placeholder="https://example.com/booth-icon.png"
              />
            )}

            {/* Preview Box */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
              <Box
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
    </DashboardLayout>
  );
};

export default AssetTypesPage;
