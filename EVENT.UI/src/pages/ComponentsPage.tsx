import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip, TextField,
  InputAdornment, Chip, Avatar, Card, CardContent, CardActions,
  Grid, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import WidgetsIcon from '@mui/icons-material/Widgets';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import DashboardLayout from '../layouts/DashboardLayout';
import { componentApi, ComponentItem } from '../api/componentApi';
import AddComponentModal from '../components/createEvent/AddComponentModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Skeleton } from '@/Ui/skeleton';
import { toast } from 'sonner';

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
      width:        80,
      height:       80,
      borderRadius: item.shape === 'Circle' ? '50%' : '10px',
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
      <img src={item.iconUrl} alt={item.componentName} style={{ width: 48, height: 48, objectFit: 'contain' }} />
    ) : (
      <WidgetsIcon sx={{ color: '#fff', fontSize: 32, opacity: 0.8 }} />
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
  const [search,      setSearch]      = useState('');
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

  // Filtered list
  const filtered = components.filter(c => {
    const matchSearch = !search || c.componentName.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === 'All' || c.category === filterCat;
    return matchSearch && matchCat;
  });

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
        <TextField
          placeholder="Search components..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 280,
            '& .MuiOutlinedInput-root': { borderRadius: '10px' },
          }}
        />

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

      {/* ── Component grid ──────────────────────────────────────────────────── */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton className="h-[220px] w-full rounded-2xl animate-pulse bg-primary/10" />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Alert
          severity="info"
          icon={<WidgetsIcon />}
          sx={{ borderRadius: '12px', mt: 2 }}
        >
          {search || filterCat !== 'All'
            ? 'No components match your filter. Try clearing search or category.'
            : 'No components yet. Click "Add Component" to create your first one.'}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(comp => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={comp.componentId}>
              <Card
                sx={{
                  borderRadius:   '16px',
                  border:         '1px solid #e2e8f0',
                  boxShadow:      '0 2px 10px rgba(0,0,0,0.04)',
                  height:         '100%',
                  display:        'flex',
                  flexDirection:  'column',
                  transition:     'all 0.2s ease',
                  '&:hover': {
                    boxShadow:   '0 8px 30px rgba(0,0,0,0.1)',
                    borderColor: '#c7d2fe',
                    transform:   'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ flex: 1, p: 2.5 }}>
                  {/* Top row: preview + category */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                    <ComponentPreview item={comp} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize:   '0.9rem',
                          color:      '#0f172a',
                          lineHeight: 1.3,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {comp.componentName}
                      </Typography>
                      {comp.componentCode && (
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', mb: 0.75 }}>
                          #{comp.componentCode}
                        </Typography>
                      )}
                      {comp.category && (
                        <Chip
                          label={comp.category}
                          size="small"
                          sx={{
                            bgcolor:      catColor(comp.category) + '22',
                            color:        catColor(comp.category),
                            fontWeight:   700,
                            fontSize:     '0.65rem',
                            borderRadius: '6px',
                            border:       `1px solid ${catColor(comp.category)}44`,
                            height:       20,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Description */}
                  {comp.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color:   '#475569',
                        fontSize: '0.78rem',
                        lineHeight: 1.5,
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {comp.description}
                    </Typography>
                  )}

                  {/* Stats row */}
                  <Box
                    sx={{
                      display:       'flex',
                      justifyContent: 'space-between',
                      bgcolor:       '#f8fafc',
                      borderRadius:  '8px',
                      p:             1,
                      mt:            'auto',
                      gap:           1,
                    }}
                  >
                    <StatBadge label="W × H"    value={`${comp.defaultWidth}×${comp.defaultHeight}${comp.widthUnit || 'm'}`} />
                    <StatBadge label="Shape"    value={comp.shape || 'Rect'} />
                    <StatBadge label="Z-Index"  value={comp.zIndex ?? 1} />
                    {comp.defaultPrice > 0 && (
                      <StatBadge label="Price" value={`${comp.currency || '₹'}${comp.defaultPrice}`} />
                    )}
                  </Box>

                  {/* Flags row */}
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
                    {comp.allowBooking && (
                      <Chip label="Bookable" size="small" sx={{ fontSize: '0.62rem', bgcolor: '#d1fae5', color: '#065f46', height: 18, fontWeight: 700 }} />
                    )}
                    {comp.snapToGrid && (
                      <Chip label="Snap" size="small" sx={{ fontSize: '0.62rem', bgcolor: '#e0f2fe', color: '#0369a1', height: 18, fontWeight: 700 }} />
                    )}
                    {comp.isFixed && (
                      <Chip label="Fixed" size="small" sx={{ fontSize: '0.62rem', bgcolor: '#fef3c7', color: '#92400e', height: 18, fontWeight: 700 }} />
                    )}
                    {!comp.isActive && (
                      <Chip label="Inactive" size="small" sx={{ fontSize: '0.62rem', bgcolor: '#fee2e2', color: '#991b1b', height: 18, fontWeight: 700 }} />
                    )}
                  </Box>
                </CardContent>

                {/* Action buttons */}
                <CardActions
                  sx={{
                    px: 2.5, pb: 2, pt: 0,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => { setEditItem(comp); setModalOpen(true); }}
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
                      onClick={() => setDeleteTarget(comp)}
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
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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
