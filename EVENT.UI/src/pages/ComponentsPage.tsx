import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WidgetsIcon from '@mui/icons-material/Widgets';
import DashboardLayout from '../layouts/DashboardLayout';
import { componentApi, ComponentItem } from '../api/componentApi';
import AddComponentModal from '../components/createEvent/AddComponentModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'sonner';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';

// ── Category accent colours ────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Structural: '#6366f1',
  Furniture:  '#f59e0b',
  Utility:    '#10b981',
  Seating:    '#3b82f6',
  Signage:    '#ec4899',
  Other:      '#8b5cf6',
};

const catColor = (cat: string) => CATEGORY_COLORS[cat] ?? '#64748b';

// ── Small component preview box ────────────────────────────────────────────────
const ComponentPreview: React.FC<{ item: ComponentItem }> = ({ item }) => (
  <Box
    sx={{
      width:        40,
      height:       40,
      borderRadius: item.shape === 'Circle' ? '50%' : '6px',
      background:   item.defaultColor || '#A47BFA',
      border:       `${item.borderWidth || 1}px solid ${item.borderColor || '#6D2DD9'}`,
      opacity:      (item.opacity ?? 100) / 100,
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'center',
      overflow:     'hidden',
      flexShrink:   0,
    }}
  >
    {item.iconUrl ? (
      <img src={item.iconUrl} alt={item.componentName} style={{ width: 24, height: 24, objectFit: 'contain' }} />
    ) : (
      <WidgetsIcon sx={{ color: '#fff', fontSize: 20, opacity: 0.8 }} />
    )}
  </Box>
);

// ── Stat badge ─────────────────────────────────────────────────────────────────
const StatBadge: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mb: 0.2 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{value}</Typography>
  </Box>
);

// ── Main page ──────────────────────────────────────────────────────────────────
const ComponentsPage: React.FC = () => {
  const [components,  setComponents]  = useState<ComponentItem[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [filterCat,   setFilterCat]   = useState<string>('All');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editItem,    setEditItem]    = useState<ComponentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ComponentItem | null>(null);
  const [deleting,    setDeleting]    = useState(false);

  // Derived unique categories
  const categories = ['All', ...Array.from(new Set(components.map(c => c.category).filter(Boolean)))];

  const load = useCallback(() => {
    setLoading(true);
    componentApi.getComponents()
      .then(res => {
        if (res.success && res.data) setComponents(res.data);
      })
      .catch(() => toast.error('Failed to load components.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filtered list by category (search is managed inside AppTable)
  const categoryFiltered = components.filter(c => {
    return filterCat === 'All' || c.category === filterCat;
  });

  const columns = [
    {
      header: 'Preview',
      accessor: (row: ComponentItem) => <ComponentPreview item={row} />,
      align: 'center' as const
    },
    { header: 'Code', accessor: 'componentCode' },
    { header: 'Component Name', accessor: 'componentName' },
    {
      header: 'Category',
      accessor: (row: ComponentItem) => row.category ? (
        <Chip
          label={row.category}
          size="small"
          sx={{
            bgcolor:      catColor(row.category) + '22',
            color:        catColor(row.category),
            fontWeight:   700,
            fontSize:     '0.75rem',
            borderRadius: '6px',
            border:       `1px solid ${catColor(row.category)}44`,
          }}
        />
      ) : '—'
    },
    {
      header: 'Dimensions (W × H)',
      accessor: (row: ComponentItem) => `${row.defaultWidth} × ${row.defaultHeight} ${row.widthUnit || 'm'}`
    },
    { header: 'Shape', accessor: 'shape' },
    { header: 'Z-Index', accessor: 'zIndex' },
    {
      header: 'Price',
      accessor: (row: ComponentItem) => row.defaultPrice > 0 ? `${row.currency || '₹'}${row.defaultPrice}` : '—'
    },

    {
      header: 'Actions',
      accessor: (row: ComponentItem) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => { setEditItem(row); setModalOpen(true); }}
              sx={{
                bgcolor: '#eff6ff',
                color:   '#3b82f6',
                '&:hover': { bgcolor: '#dbeafe' },
                borderRadius: '8px',
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => setDeleteTarget(row)}
              sx={{
                bgcolor: '#fef2f2',
                color:   '#ef4444',
                '&:hover': { bgcolor: '#fee2e2' },
                borderRadius: '8px',
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const userEmail = localStorage.getItem('email') || '';
      const res = await componentApi.deleteComponent(deleteTarget.componentId, userEmail, 'WebApp');
      if (res.success) {
        toast.success('Component deleted.');
        setDeleteTarget(null);
        load();
      } else {
        toast.error(res.message || 'Failed to delete.');
      }
    } catch {
      toast.error('Unexpected error.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            2,
          mb:             3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Event Components
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
            Manage reusable floor-plan components (walls, doors, furniture, utilities, etc.)
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          sx={{
            background:   'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '10px',
            px: 3,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
          }}
        >
          Add Component
        </Button>
      </Box>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display:  'flex',
          gap:      2,
          flexWrap: 'wrap',
          mb:       3,
        }}
      >
        {[
          { label: 'Total',    value: components.length },
          { label: 'Active',   value: components.filter(c => c.isActive).length },
          { label: 'Bookable', value: components.filter(c => c.allowBooking).length },
          { label: 'Types',    value: new Set(components.map(c => c.category).filter(Boolean)).size },
        ].map(s => (
          <Box
            key={s.label}
            sx={{
              px: 3, py: 1.5,
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              minWidth: 100,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', lineHeight: 1 }}>
              {s.value}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 0.25 }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Search + category filter ─────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              clickable
              onClick={() => setFilterCat(cat)}
              sx={{
                fontWeight:  filterCat === cat ? 700 : 500,
                bgcolor:     filterCat === cat ? catColor(cat) : '#f1f5f9',
                color:       filterCat === cat ? '#ffffff' : '#475569',
                border:      filterCat === cat ? 'none' : '1px solid #e2e8f0',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: filterCat === cat ? catColor(cat) : '#e2e8f0',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* ── Component Table ─────────────────────────────────────────────────── */}
      {loading ? (
        <AppLoader message="Retrieving components list..." />
      ) : (
        <AppTable
          columns={columns}
          data={categoryFiltered}
          searchKey="componentName"
          searchPlaceholder="Search components..."
        />
      )}

      {/* ── Add / Edit modal ─────────────────────────────────────────────────── */}
      <AddComponentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        editData={editItem}
        onSaved={() => load()}
      />

      {/* ── Delete confirmation dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Component"
        message={`Are you sure you want to delete ${deleteTarget?.componentName}? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
      />
    </DashboardLayout>
  );
};

export default ComponentsPage;
