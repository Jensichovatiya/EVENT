import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Switch, RadioGroup, FormControlLabel, Radio, Slider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GridViewIcon from '@mui/icons-material/GridView';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import AppTextarea from '../AppTextarea';
import AppModal from '../AppModal';
import { EP } from './theme';
import { StepHeading } from './parts';
import { StepProps } from './stepProps';
import { FloorPlanComponent, EventDetailsInfo } from './types';
import { CATALOG, CATEGORIES, byType, CompIcon, M, CatalogItem } from './floorCatalog';

let cidSeq = 1;
const nextId = () => `c${cidSeq++}_${(performance.now() | 0)}`;
const ROUND = new Set(['table_round', 'column', 'power', 'water', 'wifi', 'fire']);
const BOOTH_SIZES = ['2m x 2m', '3m x 3m', '3m x 4m', '4m x 4m', '4m x 6m', '6m x 6m'];
const cardSx = { borderRadius: `${EP.radius}px`, border: `1px solid ${EP.line}`, background: EP.surface, boxShadow: EP.shadowCard };

export const Step4FloorPlan: React.FC<StepProps> = ({ draft, onChange }) => {
  const det = draft.details;
  const set = (p: Partial<EventDetailsInfo>) => onChange('details', { ...det, ...p });
  const [tab, setTab] = useState<'2d' | '3d' | 'components'>('2d');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [modalOpen, setModalOpen] = useState(false);
  const [boothSize, setBoothSize] = useState('3m x 3m');
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const selected = det.components.find((c) => c.id === selectedId) || null;
  const presentTypes = Array.from(new Set(det.components.map((c) => c.type)));

  const addComponent = (item: CatalogItem, overrides: Partial<FloorPlanComponent> = {}) => {
    const count = det.components.filter((c) => c.type === item.type).length + 1;
    const prefix = item.type === 'booth' ? 'B' : item.label.charAt(0).toUpperCase();
    const comp: FloorPlanComponent = {
      id: nextId(), type: item.type, label: `${prefix}${count}`, shape: ROUND.has(item.type) ? 'circle' : 'rectangle',
      width: item.w, height: item.h, rotation: 0,
      x: 60 + (det.components.length % 6) * 30, y: 60 + (det.components.length % 5) * 30, color: item.color, ...overrides,
    };
    set({ components: [...det.components, comp] });
    setSelectedId(comp.id);
  };
  const updateComp = (id: string, patch: Partial<FloorPlanComponent>) =>
    set({ components: det.components.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const deleteComp = (id: string) => { set({ components: det.components.filter((c) => c.id !== id) }); if (selectedId === id) setSelectedId(null); };
  const duplicateComp = (c: FloorPlanComponent) => { const copy = { ...c, id: nextId(), x: c.x + 20, y: c.y + 20 }; set({ components: [...det.components, copy] }); setSelectedId(copy.id); };
  const toggleLayer = (type: string) => setHidden((s) => { const n = new Set(s); n.has(type) ? n.delete(type) : n.add(type); return n; });

  const visibleComponents = det.components.filter((c) => !hidden.has(c.type));

  const Tab: React.FC<{ id: typeof tab; label: string }> = ({ id, label }) => (
    <Box onClick={() => setTab(id)} sx={{ pb: 1.5, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: tab === id ? EP.primary : EP.muted, borderBottom: tab === id ? `2px solid ${EP.primary}` : '2px solid transparent' }}>{label}</Box>
  );

  return (
    <Box sx={{ ...cardSx, p: { xs: 2, md: 3 } }}>
      <StepHeading title="Floor Plan (Optional)" subtitle="Add / manage floor plan for your event venue." />
      <Box sx={{ display: 'flex', gap: 3, borderBottom: `1px solid ${EP.line}`, mb: 2 }}>
        <Tab id="2d" label="Floor Plan" /><Tab id="3d" label="3D View" /><Tab id="components" label="Components" />
      </Box>

      {tab === 'components' ? (
        <ComponentsLibrary
          selected={selected}
          onAdd={(item) => addComponent(item)}
          onUpdate={updateComp}
          onDelete={deleteComp}
          onDuplicate={duplicateComp}
        />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' }, gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ width: 220 }}>
                <AppDropdown label="Hall" options={[{ label: 'Hall A - Ground Floor', value: 'a' }, { label: 'Hall B - First Floor', value: 'b' }]} value={'a'} onChange={() => {}} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab === '2d' && <>
                  <IconButton size="small" onClick={() => setZoom((z) => Math.max(40, z - 10))} sx={{ border: `1px solid ${EP.line}` }}><RemoveIcon fontSize="small" /></IconButton>
                  <Typography sx={{ fontSize: '0.82rem', minWidth: 42, textAlign: 'center' }}>{zoom}%</Typography>
                  <IconButton size="small" onClick={() => setZoom((z) => Math.min(160, z + 10))} sx={{ border: `1px solid ${EP.line}` }}><AddIcon fontSize="small" /></IconButton>
                </>}
                {tab === '3d' && <Button size="small" variant="outlined" startIcon={<RestartAltIcon />} onClick={() => setZoom(100)} sx={{ textTransform: 'none', borderColor: EP.line, color: EP.text }}>Reset View</Button>}
                <Button size="small" variant="outlined" disabled={tab === '3d'} startIcon={<FitScreenIcon />} sx={{ textTransform: 'none', borderColor: EP.line, color: EP.text, ml: tab === '2d' ? 1 : 0 }}>Fit to screen</Button>
                <Button size="small" variant="outlined" startIcon={<GridViewIcon />} onClick={() => setTab(tab === '3d' ? '2d' : '3d')} sx={{ textTransform: 'none', borderColor: EP.line, color: EP.text }}>{tab === '3d' ? '2D View' : '3D View'}</Button>
                <Button size="small" variant="contained" startIcon={<UploadFileIcon />} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>Upload Plan</Button>
              </Box>
            </Box>

            <Box sx={{ position: 'relative' }}>
              {tab === '2d' && (
                <LayersPanel present={presentTypes} hidden={hidden} onToggle={toggleLayer} onSelectAll={() => setHidden(new Set())} />
              )}
              <Canvas components={visibleComponents} selectedId={selectedId} onSelect={setSelectedId} onMove={(id, x, y) => updateComp(id, { x, y })} zoom={zoom} is3d={tab === '3d'} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
              <Button size="small" startIcon={<RestartAltIcon />} onClick={() => { set({ components: [] }); setSelectedId(null); setHidden(new Set()); }} sx={{ textTransform: 'none', color: EP.muted }}>Reset View</Button>
              <Typography sx={{ fontSize: '0.78rem', color: EP.faint }}>Scale: Fit to screen</Typography>
            </Box>
          </Box>

          <AssetsPanel
            boothSize={boothSize}
            setBoothSize={setBoothSize}
            onAdd={(item) => addComponent(item)}
            onComponentsTab={() => setTab('components')}
            selected={selected}
            onUpdate={updateComp}
            onDelete={deleteComp}
            onAddComponent={() => setModalOpen(true)}
          />
        </Box>
      )}

      <AddComponentModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={(item, ov) => { addComponent(item, ov); setModalOpen(false); }} />
    </Box>
  );
};

// ---------------------------------------------------------------------------
const LayersPanel: React.FC<{ present: string[]; hidden: Set<string>; onToggle: (t: string) => void; onSelectAll: () => void }> = ({ present, hidden, onToggle, onSelectAll }) => (
  <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 5, width: 150, ...cardSx, p: 1, maxHeight: 320, overflowY: 'auto' }}>
    <Box onClick={onSelectAll} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, py: 0.75, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: '#F7F8FB' } }}>
      <DoneAllIcon sx={{ fontSize: 16, color: EP.muted }} /><Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>Select All</Typography>
    </Box>
    {present.length === 0 && <Typography sx={{ fontSize: '0.72rem', color: EP.faint, px: 0.5, py: 1 }}>No layers yet</Typography>}
    {present.map((type) => {
      const item = byType(type); const isHidden = hidden.has(type);
      return (
        <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, py: 0.6 }}>
          <IconButton size="small" onClick={() => onToggle(type)} sx={{ p: 0.25 }}>
            {isHidden ? <VisibilityOffIcon sx={{ fontSize: 15, color: EP.faint }} /> : <VisibilityIcon sx={{ fontSize: 15, color: EP.muted }} />}
          </IconButton>
          <CompIcon type={type} sx={{ fontSize: 15, color: item?.color === '#9CA3AF' ? EP.muted : EP.primary }} />
          <Typography sx={{ fontSize: '0.76rem', color: isHidden ? EP.faint : EP.text, textDecoration: isHidden ? 'line-through' : 'none' }}>{item?.label || type}</Typography>
        </Box>
      );
    })}
  </Box>
);

// ---------------------------------------------------------------------------
const Canvas: React.FC<{ components: FloorPlanComponent[]; selectedId: string | null; onSelect: (id: string | null) => void; onMove: (id: string, x: number, y: number) => void; zoom: number; is3d: boolean }> = ({ components, selectedId, onSelect, onMove, zoom, is3d }) => {
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const onDown = (e: React.PointerEvent, c: FloorPlanComponent) => { if (is3d) { onSelect(c.id); return; } e.stopPropagation(); onSelect(c.id); setDrag({ id: c.id, ox: e.clientX - c.x, oy: e.clientY - c.y }); };
  const onMoveE = (e: React.PointerEvent) => { if (!drag) return; onMove(drag.id, Math.max(0, e.clientX - drag.ox), Math.max(0, e.clientY - drag.oy)); };

  return (
    <Box onClick={() => onSelect(null)} onPointerMove={onMoveE} onPointerUp={() => setDrag(null)}
      sx={{ position: 'relative', height: 520, borderRadius: `${EP.radiusSm}px`, overflow: 'hidden', border: `1px solid ${EP.line}`,
        bgcolor: is3d ? '#DfE3EA' : '#fff', perspective: is3d ? '1300px' : 'none',
        backgroundImage: is3d ? 'none' : 'repeating-linear-gradient(0deg, #F3F4F7 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, #F3F4F7 0 1px, transparent 1px 26px)' }}>
      <Box sx={{ position: 'absolute', inset: 0, transformOrigin: 'center 60%', transformStyle: 'preserve-3d',
        transform: is3d ? `scale(${zoom / 100 * 0.82}) rotateX(58deg) rotateZ(-2deg)` : `scale(${zoom / 100})` }}>
        {/* 3D room shell */}
        {is3d && (
          <>
            <Box sx={{ position: 'absolute', inset: 24, bgcolor: '#EDEFF3', borderRadius: 1, boxShadow: 'inset 0 0 60px rgba(0,0,0,0.06)' }} />
            <Box sx={{ position: 'absolute', top: 24, left: 24, right: 24, height: 90, bgcolor: '#2B2440', borderRadius: '4px 4px 0 0', transform: 'translateZ(60px) rotateX(-90deg)', transformOrigin: 'top', background: 'linear-gradient(180deg,#3A2F57,#241D38)' }}>
              <Typography sx={{ color: '#C9B4FF', fontWeight: 800, textAlign: 'center', mt: 3, letterSpacing: 1 }}>MAIN STAGE</Typography>
            </Box>
          </>
        )}
        {components.length === 0 && !is3d && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: EP.faint, fontSize: '0.85rem' }}>Click an asset on the right to place it on the plan</Typography>
          </Box>
        )}
        {components.map((c) => {
          const isSel = c.id === selectedId; const round = c.shape === 'circle';
          return (
            <Box key={c.id} onPointerDown={(e) => onDown(e, c)}
              sx={{ position: 'absolute', left: c.x, top: c.y, width: c.width, height: c.height, bgcolor: c.color,
                border: `1.5px solid ${isSel ? EP.primary : 'rgba(0,0,0,0.18)'}`, borderRadius: round ? '50%' : 1,
                transform: `rotate(${c.rotation}deg) ${is3d ? 'translateZ(' + Math.max(14, c.height / 3) + 'px)' : ''}`,
                boxShadow: is3d ? '0 12px 16px rgba(0,0,0,0.22)' : isSel ? `0 0 0 3px ${EP.primary}33` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: is3d ? 'pointer' : 'move',
                fontSize: '0.62rem', fontWeight: 700, color: 'rgba(0,0,0,0.6)', userSelect: 'none' }}>
              {c.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
const AssetCard: React.FC<{ item: CatalogItem; onClick: () => void }> = ({ item, onClick }) => (
  <Box onClick={onClick} sx={{ border: `1px solid ${EP.line}`, borderRadius: 1.5, p: 1, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: EP.primary, bgcolor: EP.primarySoft } }}>
    <CompIcon type={item.type} sx={{ fontSize: 22, color: EP.primary, mb: 0.3 }} />
    <Typography sx={{ fontSize: '0.68rem', color: EP.text, fontWeight: 600, lineHeight: 1.1 }}>{item.label}</Typography>
  </Box>
);

const AssetsPanel: React.FC<{ boothSize: string; setBoothSize: (s: string) => void; onAdd: (i: CatalogItem) => void; onComponentsTab: () => void; selected: FloorPlanComponent | null; onUpdate: (id: string, p: Partial<FloorPlanComponent>) => void; onDelete: (id: string) => void; onAddComponent: () => void }> = ({ boothSize, setBoothSize, onAdd, onComponentsTab, selected, onUpdate, onDelete, onAddComponent }) => {
  const assets = CATALOG.filter((c) => ['booth', 'stage', 'lounge', 'foodcourt', 'restroom', 'infodesk', 'entrance', 'exit', 'emergency', 'wall', 'door', 'column'].includes(c.type));
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, borderBottom: `1px solid ${EP.line}`, mb: 2 }}>
        <Typography sx={{ pb: 1, borderBottom: `2px solid ${EP.primary}`, color: EP.primary, fontWeight: 700, fontSize: '0.85rem' }}>Assets</Typography>
        <Typography onClick={onComponentsTab} sx={{ pb: 1, color: EP.muted, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Components</Typography>
      </Box>
      <Typography sx={{ fontSize: '0.74rem', color: EP.faint, mb: 1 }}>All Assets</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
        {assets.map((a) => <AssetCard key={a.type} item={a} onClick={() => onAdd(a)} />)}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', mb: 1 }}>Booth Sizes</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
        {BOOTH_SIZES.map((s) => (
          <Box key={s} onClick={() => setBoothSize(s)} sx={{ border: `1px solid ${boothSize === s ? EP.primary : EP.line}`, color: boothSize === s ? EP.primary : EP.text, bgcolor: boothSize === s ? EP.primarySoft : '#fff', borderRadius: 1.5, py: 0.75, textAlign: 'center', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>{s}</Box>
        ))}
      </Box>

      {selected && (
        <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: selected.color, borderRadius: 0.5 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{byType(selected.type)?.label} ({byType(selected.type)?.sizeLabel})</Typography>
            </Box>
            <IconButton size="small" onClick={() => onDelete(selected.id)}><DeleteOutlineIcon fontSize="small" sx={{ color: EP.red }} /></IconButton>
          </Box>
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, mb: 0.5 }}>Label (Optional)</Typography>
          <AppInput value={selected.label} onChange={(e) => onUpdate(selected.id, { label: e.target.value })} />
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, mt: 1.5, mb: 0.5 }}>Rotation</Typography>
          <AppDropdown label="Rotation" options={[0, 45, 90, 135, 180, 270].map((d) => ({ label: `${d}°`, value: d }))} value={selected.rotation} onChange={(e) => onUpdate(selected.id, { rotation: Number(e.target.value) })} />
          <Button fullWidth variant="contained" sx={{ mt: 1.5, textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>Apply Changes</Button>
        </Box>
      )}

      <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={onAddComponent} sx={{ textTransform: 'none', borderColor: EP.line, color: EP.text }}>Add Component</Button>
    </Box>
  );
};

// ---------------------------------------------------------------------------
const ComponentsLibrary: React.FC<{ selected: FloorPlanComponent | null; onAdd: (i: CatalogItem) => void; onUpdate: (id: string, p: Partial<FloorPlanComponent>) => void; onDelete: (id: string) => void; onDuplicate: (c: FloorPlanComponent) => void }> = ({ selected, onAdd, onUpdate, onDelete, onDuplicate }) => {
  const [cat, setCat] = useState('All Components');
  const [q, setQ] = useState('');
  const list = CATALOG.filter((c) => (cat === 'All Components' || c.category === cat) && c.label.toLowerCase().includes(q.toLowerCase()));
  const selItem = selected ? byType(selected.type) : null;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' }, gap: 2 }}>
      <Box>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 180 }}>
            <AppInput placeholder="Search components..." value={q} onChange={(e) => setQ(e.target.value)} slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: EP.faint, mr: 1 }} /> } } as any} />
          </Box>
          <Box sx={{ width: 180 }}>
            <AppDropdown label="Category" options={CATEGORIES.map((c) => ({ label: c, value: c }))} value={cat} onChange={(e) => setCat(e.target.value as string)} />
          </Box>
          <Button variant="outlined" startIcon={<SyncIcon />} sx={{ textTransform: 'none', borderColor: EP.line, color: EP.text, whiteSpace: 'nowrap' }}>Drag & drop onto plan</Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '160px 1fr' }, gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: EP.muted, mb: 1 }}>Component Categories</Typography>
            {CATEGORIES.map((c) => (
              <Box key={c} onClick={() => setCat(c)} sx={{ px: 1.5, py: 1, borderRadius: 1.5, cursor: 'pointer', fontSize: '0.82rem', fontWeight: cat === c ? 700 : 500, color: cat === c ? EP.primary : EP.text, bgcolor: cat === c ? EP.primarySoft : 'transparent', mb: 0.3 }}>{c}</Box>
            ))}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>{cat}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }, gap: 1.5 }}>
              {list.map((item) => (
                <Box key={item.type} onClick={() => onAdd(item)} sx={{ border: `1px solid ${EP.line}`, borderRadius: 2, p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: EP.primary, boxShadow: EP.shadowCard } }}>
                  <CompIcon type={item.type} sx={{ fontSize: 30, color: EP.primary, mb: 0.5 }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: EP.faint }}>{item.sizeLabel}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Component Properties */}
      <Box sx={{ ...cardSx, p: 2.5, alignSelf: 'start' }}>
        <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.92rem' }}>Component Properties</Typography>
        <Typography sx={{ color: EP.muted, fontSize: '0.78rem', mb: 2 }}>Configure the selected component.</Typography>
        {!selected ? (
          <Box sx={{ textAlign: 'center', py: 4, border: `2px dashed ${EP.line}`, borderRadius: 2 }}>
            <Typography sx={{ color: EP.faint, fontSize: '0.8rem' }}>Select a component on the plan to edit it.</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ position: 'relative', height: 130, border: `1px solid ${EP.line}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ width: 90, height: 70, bgcolor: selected.color, borderRadius: selected.shape === 'circle' ? '50%' : 1, border: `2px solid ${EP.primary}` }} />
            </Box>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600 }}>Component Type</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CompIcon type={selected.type} sx={{ fontSize: 18, color: EP.primary }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{selItem?.label}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, mb: 0.5 }}>Label (Optional)</Typography>
            <AppInput value={selected.label} onChange={(e) => onUpdate(selected.id, { label: e.target.value })} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>
              <Box><Typography sx={{ fontSize: '0.74rem', fontWeight: 600, mb: 0.5 }}>Width</Typography>
                <AppDropdown label="W" options={[1, 2, 3, 4, 6, 8, 12].map((m) => ({ label: `${m}m`, value: m }))} value={Math.round(selected.width / M)} onChange={(e) => onUpdate(selected.id, { width: Number(e.target.value) * M })} /></Box>
              <Box><Typography sx={{ fontSize: '0.74rem', fontWeight: 600, mb: 0.5 }}>Depth</Typography>
                <AppDropdown label="D" options={[1, 2, 3, 4, 6, 8, 12].map((m) => ({ label: `${m}m`, value: m }))} value={Math.round(selected.height / M)} onChange={(e) => onUpdate(selected.id, { height: Number(e.target.value) * M })} /></Box>
            </Box>

            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, mt: 1.5, mb: 0.5 }}>Rotation</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Slider value={selected.rotation} min={0} max={360} onChange={(_, v) => onUpdate(selected.id, { rotation: v as number })} sx={{ color: EP.primary }} />
              <Box sx={{ width: 56 }}><AppInput value={`${selected.rotation}°`} disabled /></Box>
            </Box>

            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, mt: 1, mb: 0.5 }}>Position</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <AppInput type="number" value={(selected.x / M).toFixed(2)} onChange={(e) => onUpdate(selected.id, { x: Number(e.target.value) * M })} slotProps={{ input: { endAdornment: <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>m</Typography> } } as any} />
              <AppInput type="number" value={(selected.y / M).toFixed(2)} onChange={(e) => onUpdate(selected.id, { y: Number(e.target.value) * M })} slotProps={{ input: { endAdornment: <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>m</Typography> } } as any} />
            </Box>

            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, mt: 1.5, mb: 0.5 }}>Color</Typography>
            <AppInput value={selected.color} onChange={(e) => onUpdate(selected.id, { color: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {['#6C3EF2', '#3B82F6', '#22C55E', '#F59E0B', '#EC4899', '#9CA3AF'].map((c) => (
                <Box key={c} onClick={() => onUpdate(selected.id, { color: c })} sx={{ width: 22, height: 22, borderRadius: 0.5, bgcolor: c, cursor: 'pointer', border: selected.color === c ? `2px solid ${EP.ink}` : 'none' }} />
              ))}
            </Box>

            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, mt: 2, mb: 0.5 }}>Actions</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button fullWidth size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => onDuplicate(selected)} sx={{ textTransform: 'none', borderColor: EP.line, color: EP.text }}>Duplicate</Button>
              <Button fullWidth size="small" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={() => onDelete(selected.id)} sx={{ textTransform: 'none', borderColor: EP.red, color: EP.red }}>Delete</Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
const L: React.FC<{ children: React.ReactNode }> = ({ children }) => <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: EP.text, mb: 0.5 }}>{children}</Typography>;
const Hd: React.FC<{ children: React.ReactNode }> = ({ children }) => <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.85rem', mb: 1.5 }}>{children}</Typography>;
const Tog: React.FC<{ label: string; sub: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, sub, checked, onChange }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
    <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: EP.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: EP.primary } }} />
    <Box><Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</Typography><Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>{sub}</Typography></Box>
  </Box>
);

const AddComponentModal: React.FC<{ open: boolean; onClose: () => void; onCreate: (item: CatalogItem, ov: Partial<FloorPlanComponent>) => void }> = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Booths');
  const [description, setDescription] = useState('');
  const [allowBooking, setAllowBooking] = useState(true);
  const [bookableAs, setBookableAs] = useState('individual');
  const [accessibility, setAccessibility] = useState('accessible');
  const [accessType, setAccessType] = useState('public');
  const [shape, setShape] = useState('rectangle');
  const [width, setWidth] = useState(3);
  const [height, setHeight] = useState(3);
  const [rotation, setRotation] = useState(0);
  const [color, setColor] = useState('#A78BFA');
  const [borderColor, setBorderColor] = useState('#6D28D9');
  const [borderWidth, setBorderWidth] = useState(1);
  const [opacity, setOpacity] = useState(100);
  const [price, setPrice] = useState('0.00');
  const [notes, setNotes] = useState('');
  const [snap, setSnap] = useState(true);
  const [stackable, setStackable] = useState(false);
  const [movable, setMovable] = useState(true);
  const [resizable, setResizable] = useState(true);
  const [defaultLabel, setDefaultLabel] = useState('');
  const [labelPosition, setLabelPosition] = useState('center');
  const [showLabel, setShowLabel] = useState(true);
  const [zIndex, setZIndex] = useState(1);

  const create = () => {
    const base = byType('booth')!;
    const item: CatalogItem = { ...base, label: name || 'Component', color, w: width * M, h: height * M };
    onCreate(item, { label: defaultLabel || name || 'C', width: width * M, height: height * M, rotation, color, shape });
    setName(''); setDescription(''); setDefaultLabel('');
  };

  const colorRow = (val: string, on: (v: string) => void) => (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <input type="color" value={val} onChange={(e) => on(e.target.value)} style={{ width: 38, height: 36, border: `1px solid ${EP.line}`, borderRadius: 6, background: 'none' }} />
      <AppInput value={val} onChange={(e) => on(e.target.value)} />
    </Box>
  );

  return (
    <AppModal open={open} onClose={onClose} title="Add New Component" maxWidth="lg"
      actions={<><Button onClick={onClose} sx={{ textTransform: 'none', color: EP.muted }}>Cancel</Button><Button variant="contained" onClick={create} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>Create Component</Button></>}>
      <Typography sx={{ color: EP.muted, fontSize: '0.82rem', mb: 2 }}>Create a reusable component to use in your floor plans.</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        {/* Column 1 */}
        <Box>
          <Hd>Basic Information</Hd>
          <L>Component Name *</L><AppInput placeholder="e.g., Booth (3m x 3m)" value={name} onChange={(e) => setName(e.target.value)} />
          <Box sx={{ mt: 1.5 }}><L>Category *</L><AppDropdown label="Select Category" options={CATEGORIES.filter((c) => c !== 'All Components').map((c) => ({ label: c, value: c }))} value={category} onChange={(e) => setCategory(e.target.value as string)} /></Box>
          <Box sx={{ mt: 1.5 }}><L>Description (Optional)</L><AppTextarea rows={3} placeholder="Enter component description..." value={description} inputProps={{ maxLength: 250 }} helperText={`${description.length}/250`} onChange={(e) => setDescription(e.target.value)} /></Box>

          <Hd>Shape & Size</Hd>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box><L>Shape *</L><AppDropdown label="Shape" options={[{ label: 'Rectangle', value: 'rectangle' }, { label: 'Circle', value: 'circle' }]} value={shape} onChange={(e) => setShape(e.target.value as string)} /></Box>
            <Box><L>Width *</L><AppInput type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} slotProps={{ input: { endAdornment: <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>m</Typography> } } as any} /></Box>
            <Box><L>Height *</L><AppInput type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} slotProps={{ input: { endAdornment: <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>m</Typography> } } as any} /></Box>
            <Box><L>Rotation</L><AppDropdown label="Rotation" options={[0, 45, 90, 135, 180, 270].map((d) => ({ label: `${d}°`, value: d }))} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} /></Box>
          </Box>

          <Box sx={{ mt: 2 }}><Hd>Placement & Behavior</Hd>
            <Tog label="Snap to Grid" sub="Align component to the grid while placing" checked={snap} onChange={setSnap} />
            <Tog label="Stackable" sub="Allow overlapping with other components" checked={stackable} onChange={setStackable} />
            <Tog label="Movable" sub="Allow component to be moved" checked={movable} onChange={setMovable} />
            <Tog label="Resizable" sub="Allow component to be resized" checked={resizable} onChange={setResizable} />
          </Box>
        </Box>

        {/* Column 2 */}
        <Box>
          <Hd>Booking & Access</Hd>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Allow Booking</Typography>
            <Switch checked={allowBooking} onChange={(e) => setAllowBooking(e.target.checked)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: EP.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: EP.primary } }} />
          </Box>
          <L>Bookable As</L>
          <RadioGroup value={bookableAs} onChange={(e) => setBookableAs(e.target.value)}>
            <FormControlLabel value="individual" control={<Radio size="small" sx={{ '&.Mui-checked': { color: EP.primary } }} />} label={<Box><Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Individual</Typography><Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>Can be booked as a single unit</Typography></Box>} />
            <FormControlLabel value="multiple" control={<Radio size="small" sx={{ '&.Mui-checked': { color: EP.primary } }} />} label={<Box><Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>Multiple</Typography><Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>Can be booked in multiple quantities</Typography></Box>} />
          </RadioGroup>
          <Box sx={{ mt: 1.5 }}><L>Accessibility</L><AppDropdown label="Accessibility" options={[{ label: 'Accessible', value: 'accessible' }, { label: 'Restricted', value: 'restricted' }]} value={accessibility} onChange={(e) => setAccessibility(e.target.value as string)} /></Box>
          <Box sx={{ mt: 1.5 }}><L>Access Type</L><AppDropdown label="Access Type" options={[{ label: 'Public', value: 'public' }, { label: 'Private', value: 'private' }, { label: 'VIP', value: 'vip' }]} value={accessType} onChange={(e) => setAccessType(e.target.value as string)} /><Typography sx={{ fontSize: '0.7rem', color: EP.faint, mt: 0.5 }}>Visible and bookable by all attendees</Typography></Box>

          <Box sx={{ mt: 2 }}><Hd>Appearance</Hd>
            <L>Default Color *</L>{colorRow(color, setColor)}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>
              <Box><L>Border Color</L>{colorRow(borderColor, setBorderColor)}</Box>
              <Box><L>Border Width</L><AppInput type="number" value={borderWidth} onChange={(e) => setBorderWidth(Number(e.target.value))} slotProps={{ input: { endAdornment: <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>px</Typography> } } as any} /></Box>
            </Box>
            <Box sx={{ mt: 1.5 }}><L>Opacity</L>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Slider value={opacity} min={0} max={100} onChange={(_, v) => setOpacity(v as number)} sx={{ color: EP.primary }} />
                <Box sx={{ width: 64 }}><AppInput value={`${opacity}`} onChange={(e) => setOpacity(Number(e.target.value) || 0)} slotProps={{ input: { endAdornment: <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>%</Typography> } } as any} /></Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}><Hd>Additional Settings</Hd>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box><L>Default Label</L><AppInput placeholder="e.g., B1" value={defaultLabel} onChange={(e) => setDefaultLabel(e.target.value)} /></Box>
              <Box><L>Label Position</L><AppDropdown label="Position" options={[{ label: 'Center', value: 'center' }, { label: 'Top', value: 'top' }, { label: 'Bottom', value: 'bottom' }]} value={labelPosition} onChange={(e) => setLabelPosition(e.target.value as string)} /></Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Show Label</Typography><Switch checked={showLabel} onChange={(e) => setShowLabel(e.target.checked)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: EP.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: EP.primary } }} /></Box>
              <Box><L>Z-Index</L><Box sx={{ width: 80 }}><AppInput type="number" value={zIndex} onChange={(e) => setZIndex(Number(e.target.value))} /></Box></Box>
            </Box>
          </Box>
        </Box>

        {/* Column 3 */}
        <Box>
          <Hd>Preview</Hd>
          <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: 2, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <Box sx={{ width: 90, height: 70, bgcolor: color, opacity: opacity / 100, borderRadius: shape === 'circle' ? '50%' : 1, border: `${borderWidth}px solid ${borderColor}`, transform: `rotate(${rotation}deg)` }} />
          </Box>
          <Box sx={{ border: `1px dashed ${EP.primary}66`, borderRadius: 2, p: 2, textAlign: 'center', mb: 1.5, cursor: 'pointer', bgcolor: '#FBFAFF' }}>
            <CloudUploadOutlinedIcon sx={{ color: EP.primary }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Upload Icon</Typography>
            <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>JPG, PNG or SVG (Max. 2MB)</Typography>
          </Box>
          <L>Preview in Floor Plan</L>
          <Box sx={{ width: 36, height: 36, bgcolor: color, opacity: opacity / 100, borderRadius: shape === 'circle' ? '50%' : 0.5, border: `${borderWidth}px solid ${borderColor}`, mb: 2 }} />

          <Hd>Default Booking Price (Optional)</Hd>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ width: 90 }}><AppDropdown label="Cur" options={[{ label: 'INR', value: 'INR' }, { label: 'USD', value: 'USD' }]} value={'INR'} onChange={() => {}} /></Box>
            <AppInput type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Box>
          <Typography sx={{ fontSize: '0.7rem', color: EP.faint, mt: 0.5 }}>Leave blank if price is set during event setup</Typography>
          <Box sx={{ mt: 1.5 }}><L>Notes (Optional)</L><AppTextarea rows={3} placeholder="Add any notes about this component..." value={notes} inputProps={{ maxLength: 250 }} helperText={`${notes.length}/250`} onChange={(e) => setNotes(e.target.value)} /></Box>
        </Box>
      </Box>
    </AppModal>
  );
};

export default Step4FloorPlan;
