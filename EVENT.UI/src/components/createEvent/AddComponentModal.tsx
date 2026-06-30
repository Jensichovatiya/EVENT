import React, { useRef, useState } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, IconButton, Switch,
  Radio, RadioGroup, FormControlLabel, InputAdornment,
  Slider,
} from '@mui/material';
import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ColorizeIcon from '@mui/icons-material/Colorize';
import { EP, cardSx } from './theme';
import { componentApi, ComponentItem } from '../../api/componentApi';
import { commonApi, EventDropdowns } from '../../api/commonApi';
import { toast } from 'sonner';

// ── Types ────────────────------------------------------------------------------
interface AddComponentModalProps {
  open:    boolean;
  onClose: () => void;
  /** Called after successful save so parent can refresh the list */
  onSaved: (component: ComponentItem) => void;
  /** If provided the modal is in "edit" mode */
  editData?: ComponentItem | null;
}

// ── Default form state ────────────────-----------------------------------------
const DEFAULT: Partial<ComponentItem> = {
  componentId:   0,
  componentName: '',
  componentCode: '',
  category:      '',
  description:   '',
  iconUrl:       '',
  shape:         'Rectangle',
  defaultWidth:  3,
  defaultHeight: 3,
  rotation:      0,
  widthUnit:     'm',
  heightUnit:    'm',
  defaultColor:  '#A47BFA',
  borderColor:   '#6D2DD9',
  borderWidth:   1,
  opacity:       100,
  allowBooking:  true,
  bookableAs:    'Individual',
  accessibility: 'Accessible',
  accessType:    'Public',
  snapToGrid:    true,
  stackable:     false,
  movable:       true,
  resizable:     true,
  isFixed:       false,
  defaultLabel:  '',
  labelPosition: 'Center',
  showLabel:     true,
  zIndex:        1,
  defaultPrice:  0,
  currency:      'INR',
  notes:         '',
  isActive:      true,
};

const ROTATIONS  = ['0°', '45°', '90°', '135°', '180°', '225°', '270°', '315°'];

// ── Section label component ────────────────--------------------------------───
const Section: React.FC<{ title: string; color?: string }> = ({ title, color = EP.primary }) => (
  <Typography
    variant="caption"
    sx={{
      display:      'block',
      fontWeight:   700,
      color,
      mb:           1.5,
      fontSize:     '0.75rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}
  >
    {title}
  </Typography>
);

// ── Toggle row ────────────────------------------------------------------------─
const ToggleRow: React.FC<{
  label:       string;
  sub?:        string;
  checked:     boolean;
  onChange:    (v: boolean) => void;
}> = ({ label, sub, checked, onChange }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', color: EP.text }}>
        {label}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: EP.textSoft, fontSize: '0.7rem' }}>
          {sub}
        </Typography>
      )}
    </Box>
    <Switch
      size="small"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked':            { color: EP.primary },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: EP.primary },
      }}
    />
  </Box>
);

// ── Main Modal ────────────────------------------------------------------------─
const AddComponentModal: React.FC<AddComponentModalProps> = ({ open, onClose, onSaved, editData }) => {
  const [form,     setForm]     = useState<Partial<ComponentItem>>(editData ?? { ...DEFAULT });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string>(editData?.iconUrl ?? '');
  const [saving,   setSaving]   = useState(false);
  const [dropdowns, setDropdowns] = useState<EventDropdowns | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load dropdown data when modal opens
  React.useEffect(() => {
    if (open) {
      commonApi.getEventDropdowns()
        .then(res => {
          if (res.success && res.data) {
            setDropdowns(res.data);
          }
        })
        .catch(err => {
          console.error('Failed to load dropdowns:', err);
        });
    }
  }, [open]);

  // Reset when modal opens / editData changes
  React.useEffect(() => {
    if (open) {
      if (editData && editData.componentId) {
        // Fetch fresh component details by ID from backend during editing
        componentApi.getComponentById(editData.componentId)
          .then(res => {
            if (res.success && res.data) {
              setForm(res.data);
              setPreview(res.data.iconUrl ?? '');
            } else {
              setForm({ ...editData });
              setPreview(editData.iconUrl ?? '');
            }
          })
          .catch(() => {
            setForm({ ...editData });
            setPreview(editData.iconUrl ?? '');
          });
      } else {
        setForm({ ...DEFAULT });
        setIconFile(null);
        setPreview('');
      }
    }
  }, [open, editData]);

  // Resolve strings to lookup IDs when dropdowns load (for backwards compatibility/fallbacks)
  React.useEffect(() => {
    if (open && dropdowns) {
      const updates: Partial<ComponentItem> = {};
      
      const currentCategoryName = form.category || editData?.category;
      if (!form.categoryId && currentCategoryName) {
        const cat = dropdowns.componentCategories?.find(c => c.label.trim() === currentCategoryName.trim());
        if (cat) updates.categoryId = cat.value;
      }
      
      const currentShape = form.shape || editData?.shape;
      if (!form.shapeTypeId && currentShape) {
        const shp = dropdowns.shapeTypes?.find(s => s.label.trim() === currentShape.trim());
        if (shp) updates.shapeTypeId = shp.value;
      }
      
      const currentBookableAs = form.bookableAs || editData?.bookableAs;
      if (!form.bookableAsId && currentBookableAs) {
        const b = dropdowns.bookableAs?.find(x => x.label.trim() === currentBookableAs.trim());
        if (b) updates.bookableAsId = b.value;
      }
      
      const currentAccessibility = form.accessibility || editData?.accessibility;
      if (!form.accessibilityId && currentAccessibility) {
        const matched = dropdowns.accessibility?.find(x => x.label.trim() === currentAccessibility.trim());
        if (matched) updates.accessibilityId = matched.value;
      }
      
      const currentAccessType = form.accessType || editData?.accessType;
      if (!form.accessTypeId && currentAccessType) {
        // AccessType maps to ListingType in general master
        const at = dropdowns.listingTypes?.find(x => x.label.trim() === currentAccessType.trim());
        if (at) updates.accessTypeId = at.value;
      }
      
      const currentCurrency = form.currency || editData?.currency;
      if (!form.currencyId && currentCurrency) {
        const c = dropdowns.currencies?.find(x => x.label.trim() === currentCurrency.trim() || x.code.trim() === currentCurrency.trim());
        if (c) updates.currencyId = c.value;
      }
      
      const currentLabelPosition = form.labelPosition || editData?.labelPosition;
      if (!form.labelPositionId && currentLabelPosition) {
        const lp = dropdowns.labelPositions?.find(x => x.label.trim() === currentLabelPosition.trim());
        if (lp) updates.labelPositionId = lp.value;
      }
      
      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    }
  }, [open, dropdowns, editData]);

  const set = (partial: Partial<ComponentItem>) => setForm(f => ({ ...f, ...partial }));

  // Icon file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setIconFile(file);
    setPreview(URL.createObjectURL(file));
    set({ iconUrl: '' });
  };

  // Submit
  const handleSave = async () => {
    if (!form.componentName?.trim()) {
      toast.error('Component Name is required.');
      return;
    }
    if (!form.category?.trim()) {
      toast.error('Please select a Category.');
      return;
    }
    setSaving(true);
    try {
      const userEmail = localStorage.getItem('email') || '';
      const result = await componentApi.addEditComponent(
        {
          ...form,
          createdBy:   editData?.createdBy || userEmail,
          createdFrom: 'WebApp',
          updatedBy:   userEmail,
          updatedFrom: 'WebApp',
        },
        iconFile
      );
      if (result.success && result.data) {
        toast.success(form.componentId ? 'Component updated!' : 'Component created!');
        onSaved(result.data);
        onClose();
      } else {
        toast.error(result.message || 'Failed to save component.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Unexpected error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableEnforceFocus
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          background:   EP.surface,
          maxHeight:    '92vh',
        },
      }}
    >
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          px: 3, py: 2,
          borderBottom: `1px solid ${EP.line}`,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: EP.text, fontSize: '1rem' }}>
            {form.componentId ? 'Edit Component' : 'Add New Component'}
          </Typography>
          <Typography variant="caption" sx={{ color: EP.textSoft }}>
            Create a reusable component to use in your floor plans.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <DialogContent sx={{ px: 3, py: 3, background: EP.canvas, overflowY: 'auto' }}>
        {/* 3-column grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, alignItems: 'start' }}>

          {/* ── Column 1: Basic Info + Shape + Behavior ──────────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Card 1: Basic Information */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Section title="Basic Information" />

              <AppInput
                label="Component Name *"
                fullWidth
                size="small"
                placeholder="e.g. Booth (3m × 3m)"
                value={form.componentName ?? ''}
                onChange={e => set({ componentName: e.target.value })}
                className="mb-4"
              />

              <AppDropdown
                label="Category *"
                value={form.categoryId ?? ''}
                onChange={e => {
                  const selectedId = Number(e.target.value);
                  const selectedLabel = dropdowns?.componentCategories?.find(c => c.value === selectedId)?.label.trim() || '';
                  set({ categoryId: selectedId, category: selectedLabel });
                }}
                options={dropdowns?.componentCategories?.map(c => ({ label: c.label.trim(), value: c.value })) || []}
                className="mb-4"
              />

              <AppInput
                label="Description (Optional)"
                fullWidth
                size="small"
                multiline
                rows={3}
                placeholder="Enter component description..."
                value={form.description ?? ''}
                onChange={e => set({ description: e.target.value })}
                inputProps={{ maxLength: 250 }}
              />
              <Typography variant="caption" sx={{ color: EP.textSoft, display: 'block', textAlign: 'right', mt: 1 }}>
                {(form.description ?? '').length}/250
              </Typography>
            </Box>

            {/* Card 2: Shape & Size */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Section title="Shape & Size" />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <AppDropdown
                  label="Shape *"
                  value={form.shapeTypeId ?? ''}
                  onChange={e => {
                    const selectedId = Number(e.target.value);
                    const selectedLabel = dropdowns?.shapeTypes?.find(s => s.value === selectedId)?.label.trim() || '';
                    set({ shapeTypeId: selectedId, shape: selectedLabel });
                  }}
                  options={dropdowns?.shapeTypes?.map(s => ({ label: s.label.trim(), value: s.value })) || []}
                />

                <AppInput
                  label="Width *"
                  size="small"
                  type="number"
                  value={form.defaultWidth ?? 3}
                  onChange={e => set({ defaultWidth: Number(e.target.value) })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" sx={{ color: EP.textSoft }}>m</Typography>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <AppInput
                  label="Height *"
                  size="small"
                  type="number"
                  value={form.defaultHeight ?? 3}
                  onChange={e => set({ defaultHeight: Number(e.target.value) })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" sx={{ color: EP.textSoft }}>m</Typography>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />

                <AppDropdown
                  label="Rotation"
                  value={`${form.rotation ?? 0}°`}
                  onChange={e => set({ rotation: parseInt(e.target.value) })}
                  options={ROTATIONS.map(r => ({ label: r, value: r }))}
                />
              </Box>
            </Box>

            {/* Card 3: Placement & Behavior */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Section title="Placement & Behavior" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ToggleRow label="Snap to Grid"  sub="Align component to the grid while placing." checked={form.snapToGrid  ?? true}  onChange={v => set({ snapToGrid:  v })} />
                <ToggleRow label="Stackable"     sub="Allow overlapping with other components."   checked={form.stackable   ?? false} onChange={v => set({ stackable:   v })} />
                <ToggleRow label="Movable"       sub="Allow component to be moved."               checked={form.movable     ?? true}  onChange={v => set({ movable:     v })} />
                <ToggleRow label="Resizable"     sub="Allow component to be resized."             checked={form.resizable   ?? true}  onChange={v => set({ resizable:   v })} />
              </Box>
            </Box>
          </Box>

          {/* ── Column 2: Booking + Appearance + Additional ──────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Card 1: Booking & Access */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Section title="Booking & Access" />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem', color: EP.text }}>
                  Allow Booking
                </Typography>
                <Switch
                  size="small"
                  checked={form.allowBooking ?? true}
                  onChange={e => set({ allowBooking: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: EP.primary },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: EP.primary },
                  }}
                />
              </Box>

              <Typography variant="caption" sx={{ color: EP.textSoft, mb: 0.5, display: 'block' }}>
                Bookable As
              </Typography>
              <RadioGroup
                value={form.bookableAsId ?? ''}
                onChange={e => {
                  const selectedId = Number(e.target.value);
                  const selectedLabel = dropdowns?.bookableAs?.find(x => x.value === selectedId)?.label.trim() || '';
                  set({ bookableAsId: selectedId, bookableAs: selectedLabel });
                }}
                sx={{ mb: 2 }}
              >
                {dropdowns ? (
                  dropdowns.bookableAs?.map(x => {
                    const trimmedLabel = x.label.trim();
                    return (
                      <FormControlLabel
                        key={x.value}
                        value={x.value}
                        control={<Radio size="small" sx={{ color: EP.primary, '&.Mui-checked': { color: EP.primary } }} />}
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500, color: EP.text }}>{trimmedLabel}</Typography>
                            <Typography variant="caption" sx={{ color: EP.textSoft }}>
                              {trimmedLabel === 'Individual' ? 'Can be booked as a single unit' : trimmedLabel === 'Multiple' ? 'Can be booked in multiple quantities' : `Bookable as ${trimmedLabel}`}
                            </Typography>
                          </Box>
                        }
                      />
                    );
                  })
                ) : (
                  <Typography variant="caption" sx={{ color: EP.textSoft }}>Loading booking options...</Typography>
                )}
              </RadioGroup>

              <AppDropdown
                label="Accessibility"
                value={form.accessibilityId ?? ''}
                onChange={e => {
                  const selectedId = Number(e.target.value);
                  const selectedLabel = dropdowns?.accessibility?.find(x => x.value === selectedId)?.label.trim() || '';
                  set({ accessibilityId: selectedId, accessibility: selectedLabel });
                }}
                options={dropdowns?.accessibility?.map(x => ({ label: x.label.trim(), value: x.value })) || []}
                className="mb-4"
              />

              <AppDropdown
                label="Access Type"
                value={form.accessTypeId ?? ''}
                onChange={e => {
                  const selectedId = Number(e.target.value);
                  const selectedLabel = dropdowns?.listingTypes?.find(x => x.value === selectedId)?.label.trim() || '';
                  set({ accessTypeId: selectedId, accessType: selectedLabel });
                }}
                options={dropdowns?.listingTypes?.map(x => ({ label: x.label.trim(), value: x.value })) || []}
              />
              <Typography variant="caption" sx={{ color: EP.textSoft, mt: 0.5, display: 'block' }}>
                Visible and bookable by all attendees
              </Typography>
            </Box>

            {/* Card 2: Appearance */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Section title="Appearance" />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: '8px',
                    background: form.defaultColor ?? '#A47BFA',
                    border: `1px solid ${EP.line}`, cursor: 'pointer', flexShrink: 0,
                  }}
                  onClick={() => document.getElementById('comp-default-color')?.click()}
                />
                <AppInput
                  label="Default Color *"
                  size="small"
                  fullWidth
                  value={form.defaultColor ?? '#A47BFA'}
                  onChange={e => set({ defaultColor: e.target.value })}
                />
                <IconButton
                  size="small"
                  onClick={() => document.getElementById('comp-default-color')?.click()}
                  sx={{
                    border: `1px solid ${EP.line}`, borderRadius: '8px', p: '8px', flexShrink: 0,
                    color: EP.textSoft,
                    '&:hover': { background: EP.canvas },
                  }}
                >
                  <ColorizeIcon fontSize="small" />
                </IconButton>
                <input
                  id="comp-default-color"
                  type="color"
                  value={form.defaultColor ?? '#A47BFA'}
                  style={{ display: 'none' }}
                  onChange={e => set({ defaultColor: e.target.value })}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: '6px',
                      background: form.borderColor ?? '#6D2DD9',
                      border: `1px solid ${EP.line}`, cursor: 'pointer', flexShrink: 0,
                    }}
                    onClick={() => document.getElementById('comp-border-color')?.click()}
                  />
                  <AppInput
                    label="Border Color"
                    size="small"
                    fullWidth
                    value={form.borderColor ?? '#6D2DD9'}
                    onChange={e => set({ borderColor: e.target.value })}
                  />
                  <input
                    id="comp-border-color"
                    type="color"
                    value={form.borderColor ?? '#6D2DD9'}
                    style={{ display: 'none' }}
                    onChange={e => set({ borderColor: e.target.value })}
                  />
                </Box>
                <AppInput
                  label="Border Width"
                  size="small"
                  type="number"
                  value={form.borderWidth ?? 1}
                  onChange={e => set({ borderWidth: Number(e.target.value) })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: EP.textSoft }}>px</Typography></InputAdornment>,
                  }}
                  fullWidth
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: EP.textSoft, mb: 0.5, display: 'block' }}>
                  Opacity
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Slider
                    size="small"
                    value={form.opacity ?? 100}
                    min={0}
                    max={100}
                    onChange={(_, v) => set({ opacity: v as number })}
                    sx={{ color: EP.primary, flex: 1 }}
                  />
                  <AppInput
                    size="small"
                    type="number"
                    value={form.opacity ?? 100}
                    onChange={e => set({ opacity: Number(e.target.value) })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: EP.textSoft }}>%</Typography></InputAdornment>,
                    }}
                    className="w-20"
                  />
                </Box>
              </Box>
            </Box>

            {/* Card 3: Additional Settings */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Section title="Additional Settings" />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <AppInput
                  label="Default Label"
                  size="small"
                  placeholder="e.g. B1"
                  value={form.defaultLabel ?? ''}
                  onChange={e => set({ defaultLabel: e.target.value })}
                  fullWidth
                />
                <AppDropdown
                  label="Label Position"
                  value={form.labelPositionId ?? ''}
                  onChange={e => {
                    const selectedId = Number(e.target.value);
                    const selectedLabel = dropdowns?.labelPositions?.find(x => x.value === selectedId)?.label.trim() || '';
                    set({ labelPositionId: selectedId, labelPosition: selectedLabel });
                  }}
                  options={dropdowns?.labelPositions?.map(x => ({ label: x.label.trim(), value: x.value })) || []}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: EP.text, fontWeight: 500 }}>Show Label</Typography>
                  <Switch
                    size="small"
                    checked={form.showLabel ?? true}
                    onChange={e => set({ showLabel: e.target.checked })}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: EP.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: EP.primary } }}
                  />
                </Box>

                <Box>
                  <AppInput
                    label="Z-Index"
                    size="small"
                    type="number"
                    fullWidth
                    value={form.zIndex ?? 1}
                    onChange={e => set({ zIndex: Number(e.target.value) })}
                  />
                  <Typography variant="caption" sx={{ color: EP.textSoft, fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
                    Higher values appear on top
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ── Column 3: Preview + Price + Notes ─────────────────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Card 1: Preview */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Section title="Preview" />

              <Box
                sx={{
                  width: 100, height: 100, borderRadius: '12px', mx: 'auto', mb: 2.5,
                  background: form.defaultColor ?? '#A47BFA',
                  border: `1px solid ${EP.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="icon preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <AddPhotoAlternateIcon sx={{ color: '#FFFFFF', fontSize: 40 }} />
                )}
              </Box>

              <Box
                sx={{
                  border:         `1px dashed ${EP.primary}`,
                  borderRadius:   '8px',
                  p:              2,
                  mb:             2.5,
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            0.5,
                  cursor:         'pointer',
                  background:     '#F9FAFB',
                  '&:hover':      { background: '#F1F2F6' },
                }}
                onClick={() => fileRef.current?.click()}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudUploadIcon sx={{ color: EP.primary, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: EP.primary, fontWeight: 600, fontSize: '0.85rem' }}>
                    Upload Icon
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: EP.textSoft, fontSize: '0.72rem' }}>
                  JPG, PNG or SVG (Max. 2MB)
                </Typography>
              </Box>
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.svg,.gif,.webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <Typography variant="caption" sx={{ color: EP.textSoft, mb: 1, display: 'block' }}>
                Preview in Floor Plan
              </Typography>
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: '6px',
                  background: form.defaultColor ?? '#A47BFA',
                  border: `${form.borderWidth ?? 1}px solid ${form.borderColor ?? '#6D2DD9'}`,
                  opacity: (form.opacity ?? 100) / 100,
                }}
              />
            </Box>

            {/* Card 2: Price */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Section title="Default Booking Price" />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 1.5 }}>
                <AppDropdown
                  label="Currency"
                  value={form.currencyId ?? ''}
                  onChange={e => {
                    const selectedId = Number(e.target.value);
                    const matched = dropdowns?.currencies?.find(x => x.value === selectedId);
                    const selectedCode = matched?.code.trim() || '';
                    set({ currencyId: selectedId, currency: selectedCode });
                  }}
                  options={dropdowns?.currencies?.map(x => ({ label: x.code.trim(), value: x.value })) || []}
                />

                <AppInput
                  label="Price (Optional)"
                  size="small"
                  type="number"
                  placeholder="0.00"
                  value={form.defaultPrice ?? ''}
                  onChange={e => set({ defaultPrice: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="caption" sx={{ color: EP.textSoft }}>
                          {dropdowns?.currencies?.find(x => x.value === form.currencyId)?.symbol?.trim() || form.currency?.trim() || 'INR'}
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Box>
              <Typography variant="caption" sx={{ color: EP.textSoft, mt: 1, display: 'block' }}>
                Leave blank if price is set during event setup
              </Typography>
            </Box>

            {/* Card 3: Notes */}
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Section title="Notes" />

              <AppInput
                label="Notes (Optional)"
                fullWidth
                size="small"
                multiline
                rows={3}
                placeholder="Add any notes about this component..."
                value={form.notes ?? ''}
                onChange={e => set({ notes: e.target.value })}
                inputProps={{ maxLength: 250 }}
              />
              <Typography variant="caption" sx={{ color: EP.textSoft, display: 'block', textAlign: 'right', mt: 1 }}>
                {(form.notes ?? '').length}/250
              </Typography>
            </Box>
          </Box>

        </Box>
      </DialogContent>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <DialogActions
        sx={{
          px: 3, py: 2,
          borderTop:      `1px solid ${EP.line}`,
          justifyContent: 'space-between',
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={saving}
          sx={{
            borderColor: EP.line,
            color:       EP.textSoft,
            borderRadius: '8px',
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSave}
          sx={{
            background:   EP.primary,
            borderRadius: '8px',
            px: 3,
            fontWeight:   600,
            '&:hover':    { background: EP.primaryDark ?? EP.primary },
          }}
        >
          {saving ? 'Saving…' : form.componentId ? 'Update Component' : 'Create Component'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddComponentModal;
