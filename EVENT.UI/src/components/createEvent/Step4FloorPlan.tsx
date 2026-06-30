import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GridViewIcon from '@mui/icons-material/GridView';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import CloseIcon from '@mui/icons-material/Close';

import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import AppLoader from '../AppLoader';
import { EP } from './theme';
import { StepHeading } from './parts';
import { StepProps } from './stepProps';
import { AssetItem, EventDetailsInfo } from './types';
import { assetApi } from '../../api/assetApi';
import { blueprintApi } from '../../api/blueprintApi';
import { componentApi, ComponentItem } from '../../api/componentApi';
import AddComponentModal from './AddComponentModal';
import { Asset } from '../../models';
import { toast } from 'sonner';
import { CATALOG, CompIcon, CATEGORIES } from './floorCatalog';
import WidgetsIcon from '@mui/icons-material/Widgets';

const cardSx = { borderRadius: `${EP.radius}px`, border: `1px solid ${EP.line}`, background: EP.surface, boxShadow: EP.shadowCard };

// Helper to determine component type from asset name/code
const getAssetType = (assetName: string, assetCode: string, iconUrl?: string): string => {
  const name = String(assetName || '').toLowerCase();
  const code = String(assetCode || '').toLowerCase();
  const icon = String(iconUrl || '').toLowerCase();

  if (name.includes('sofa') || name.includes('couch') || code.includes('sof') || icon.includes('sofa') || icon.includes('couch')) return 'sofa';
  if (name.includes('booth') || code === 'b') return 'booth';
  if (name.includes('stage') || code === 's') return 'stage';
  if (name.includes('lounge') || code === 'l') return 'lounge';
  if (name.includes('table') || code === 't') return 'table_round';
  if (name.includes('chair') || name.includes('seat') || code === 'c' || code.includes('chr')) return 'chair';
  if (name.includes('entrance') || name.includes('login')) return 'entrance';
  if (name.includes('exit') || name.includes('logout')) return 'exit';
  if (name.includes('emerg')) return 'emergency';
  if (name.includes('wall')) return 'wall';
  if (name.includes('door')) return 'door';
  if (name.includes('column')) return 'column';
  if (name.includes('food') || name.includes('canteen')) return 'foodcourt';
  if (name.includes('restroom') || name.includes('washroom') || name.includes('toilet')) return 'restroom';
  if (name.includes('info')) return 'infodesk';
  if (name.includes('registr')) return 'registration';
  if (name.includes('storage') || name.includes('store')) return 'storage';
  if (name.includes('counter')) return 'counter';
  return 'booth'; // fallback
};

// Fallback to determine component type from seat label if type is not saved
const getTypeFromLabel = (label: string): string => {
  const lower = label.toLowerCase();
  if (lower.startsWith('entrance') || lower === 'entrance') return 'entrance';
  if (lower.startsWith('exit') || lower === 'exit') return 'exit';
  if (lower.startsWith('emerg') || lower.includes('emergency')) return 'emergency';
  if (lower.startsWith('b') && !isNaN(Number(lower.substring(1)))) return 'booth';
  if (lower.startsWith('s') && !isNaN(Number(lower.substring(1)))) return 'stage';
  if (lower.startsWith('l') && !isNaN(Number(lower.substring(1)))) return 'lounge';
  if (lower.startsWith('t') && !isNaN(Number(lower.substring(1)))) return 'table_round';
  if (lower.startsWith('id') || lower.includes('info')) return 'infodesk';
  if (lower.startsWith('fc') || lower.includes('food')) return 'foodcourt';
  if (lower.startsWith('r') && !isNaN(Number(lower.substring(1)))) return 'restroom';
  if (lower.startsWith('w') || lower.includes('wall')) return 'wall';
  if (lower.startsWith('d') || lower.includes('door')) return 'door';
  if (lower.startsWith('c') && !isNaN(Number(lower.substring(1)))) return 'column';
  return 'booth'; // default
};

export const Step4FloorPlan: React.FC<StepProps> = ({ draft, onChange, ddl }) => {
  const det = draft.details;
  const set = (p: Partial<EventDetailsInfo>) => onChange('details', { ...det, ...p });

  // Sub-tabs (Floor Plan 2D, 3D View, Placed Components manager)
  const [activeSubTab, setActiveSubTab] = useState<number>(0);

  // Left sidebar tabs (0 = Assets, 1 = Components)
  const [leftTab, setLeftTab] = useState<number>(0);
  const [selectedCompCategory, setSelectedCompCategory] = useState<string>('All Components');

  // Zooming & Canvas scroll
  const [zoom, setZoom] = useState(100);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Local API states
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [dbComponents, setDbComponents] = useState<ComponentItem[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [openAddCompModal, setOpenAddCompModal] = useState(false);

  // Load components dynamically from API on mount
  useEffect(() => {
    setLoadingComponents(true);
    componentApi.getComponents()
      .then(res => {
        if (res.success && res.data) {
          setDbComponents(res.data);
        }
      })
      .catch(err => console.error('Failed to load components dynamically:', err))
      .finally(() => setLoadingComponents(false));
  }, []);

  const selectedZone = ddl.eventZones?.find(z => z.value === Number(det.zoneId));
  const selectedAsset = assets.find(a => a.assetId === Number(det.assetId));
  const selectedItem = det.assetItems.find(item => item.itemId === selectedId) || null;

  const displayComponents = dbComponents.length > 0
    ? dbComponents.map(comp => {
      const category = comp.category || 'Decor & Misc';
      const type = comp.componentCode || comp.componentRId || comp.componentName;

      const lowerName = comp.componentName.toLowerCase();
      let matchedIcon: any = WidgetsIcon;
      const staticMatch = CATALOG.find(c =>
        lowerName.includes(c.type) ||
        c.type.includes(lowerName) ||
        c.label.toLowerCase().includes(lowerName) ||
        lowerName.includes(c.label.toLowerCase())
      );
      if (staticMatch) {
        matchedIcon = staticMatch.Icon;
      }

      return {
        type,
        label: comp.componentName,
        category,
        color: comp.defaultColor || '#C9B9F7',
        w: (comp.defaultWidth || 3) * 20, // 20px = 1m
        h: (comp.defaultHeight || 3) * 20,
        sizeLabel: `${comp.defaultWidth}m x ${comp.defaultHeight}m`,
        Icon: matchedIcon,
        iconUrl: comp.iconUrl,
        price: comp.defaultPrice || 0
      };
    })
    : CATALOG.map(c => ({
      ...c,
      price: 0,
      iconUrl: ''
    }));

  const dynamicCategories = dbComponents.length > 0
    ? ['All Components', ...Array.from(new Set(displayComponents.map(c => c.category).filter(Boolean)))]
    : CATEGORIES;

  const defaultPrice = selectedAsset?.unitPrice || 0;
  const assetLimit = selectedAsset?.availableQty || 50;

  // Load assets dynamically from API when Zone is selected
  useEffect(() => {
    if (det.zoneId) {
      setLoadingAssets(true);
      assetApi.getAssets()
        .then(res => {
          if (res.success && res.data) {
            setAssets(res.data);
          }
        })
        .catch(err => console.error('Failed to load assets:', err))
        .finally(() => setLoadingAssets(false));

      const currentZoneLayout = det.zones?.[Number(det.zoneId)];
      const hasLayoutInMemory = currentZoneLayout && currentZoneLayout.assetItems.length > 0;

      if (!hasLayoutInMemory) {
        setLoadingSeats(true);
        blueprintApi.getSeatsByZone(Number(det.zoneId), Number(draft.eventId))
          .then(res => {
            if (res.success && res.data && res.data.length > 0) {
              const mappedItems: AssetItem[] = res.data.map(s => {
                const existingItem = det.assetItems.find(item => item.rowName === s.rowName && item.columnNo === s.columnNo);
                const assumedType = getTypeFromLabel(s.seatNumber);
                const cat = CATALOG.find(c => c.type === assumedType);
                return {
                  itemId: s.seatId ? String(s.seatId) : `seat_${s.rowName}_${s.columnNo}`,
                  rowName: s.rowName,
                  columnNo: s.columnNo,
                  label: s.seatNumber,
                  status: (s.isBlocked ? 'Blocked' : s.isReserved ? 'Reserved' : 'Available') as AssetItem['status'],
                  price: s.price,
                  remarks: s.remarks,
                  x: existingItem?.x ?? (50 + s.columnNo * 60),
                  y: existingItem?.y ?? (50 + (s.rowName.charCodeAt(0) - 65) * 60),
                  type: (existingItem as any)?.type || assumedType,
                  w: (existingItem as any)?.w || cat?.w || 44,
                  h: (existingItem as any)?.h || cat?.h || 44,
                  rotation: (existingItem as any)?.rotation || 0,
                  assetId: (s as any).assetId ? String((s as any).assetId) : (existingItem?.assetId || ''),
                  zoneAssetId: s.zoneAssetId ? Number(s.zoneAssetId) : (existingItem?.zoneAssetId || undefined),
                } as AssetItem;
              });

              if (det.assetItems.length === 0) {
                const maxRow = Math.max(...res.data.map(s => s.rowName.charCodeAt(0) - 64), 5);
                const maxCol = Math.max(...res.data.map(s => s.columnNo), 5);

                const updatedZones = { ...(det.zones || {}) };
                updatedZones[Number(det.zoneId)] = {
                  assetItems: mappedItems,
                  rows: maxRow,
                  columns: maxCol,
                  arrangementType: det.arrangementType || '',
                  assetId: det.assetId || '',
                };

                onChange('details', {
                  ...det,
                  assetItems: mappedItems,
                  rows: maxRow,
                  columns: maxCol,
                  zones: updatedZones,
                });
              }
            }
          })
          .catch(err => console.error('Failed to load zone seats:', err))
          .finally(() => setLoadingSeats(false));
      }
    }
  }, [det.zoneId]);

  // Local state for auto arrange grid inputs
  const [localRows, setLocalRows] = useState<number>(det.rows || 5);
  const [localCols, setLocalCols] = useState<number>(det.columns || 5);
  const [localQty, setLocalQty] = useState<number>(Number(det.quantity) || 50);

  useEffect(() => {
    if (det.rows) setLocalRows(det.rows);
    if (det.columns) setLocalCols(det.columns);
    if (det.quantity !== undefined && det.quantity !== '') setLocalQty(Number(det.quantity));
  }, [det.rows, det.columns, det.quantity]);

  // Generate Grid layout (Auto Arrange)
  const handleGenerateLayout = () => {
    if (!selectedAsset) {
      toast.warning('Please select an asset from the list first.');
      return;
    }

    const currentAssetId = selectedAsset.assetId;
    const assetType = getAssetType(selectedAsset.assetName, selectedAsset.assetCode, selectedAsset.iconUrl);
    const cat = CATALOG.find(c => c.type === assetType);
    const customW = cat?.w || 60;
    const customH = cat?.h || 60;

    // 1. Separate existing items of other assets or layout components
    const otherItems = det.assetItems.filter(item =>
      item.assetId === undefined ||
      item.assetId === null ||
      item.assetId === '' ||
      Number(item.assetId) !== currentAssetId
    );

    // 2. Determine y-offset so the new grid doesn't overlap existing items
    let yOffset = 0;
    if (otherItems.length > 0) {
      const maxY = Math.max(...otherItems.map(item => (item.y || 0) + (item.h || 0)));
      yOffset = Math.ceil((maxY + 20) / 80) * 80; // offset by maxY + margin, snapped to grid
    }

    // 3. Generate new grid for the current asset
    const newAssetItems: AssetItem[] = [];
    let count = 0;
    const finalQty = Math.min(localQty, assetLimit);

    for (let r = 0; r < localRows; r++) {
      const rowName = String.fromCharCode(65 + r);
      for (let c = 1; c <= localCols; c++) {
        if (count >= finalQty) break;

        // Visual label cleanup for generated chairs and sofas
        let shortenedPrefix = rowName;
        newAssetItems.push({
          itemId: `seat_${currentAssetId}_${rowName}_${c}_${Date.now()}`,
          rowName,
          columnNo: c,
          label: `${rowName}${c}`,
          status: 'Available',
          price: defaultPrice,
          x: 50 + c * 80,
          y: 50 + r * 80 + yOffset,
          type: assetType,
          w: customW,
          h: customH,
          rotation: 0,
          assetId: currentAssetId
        } as any);
        count++;
      }
      if (count >= finalQty) break;
    }

    // 4. Combine existing other items and new asset items
    const combined = [...otherItems, ...newAssetItems];

    set({
      rows: localRows,
      columns: localCols,
      quantity: combined.length,
      assetItems: combined,
      arrangementType: 'Auto Arrange'
    });
    toast.success(`Generated arrangement preview of ${newAssetItems.length} items.`);
  };

  // Generic helper to add a component to the floor plan (supports drag-drop and click-add)
  const handleAddComponent = (
    type: string,
    label: string,
    price: number,
    w: number,
    h: number,
    assetId?: number | string,
    dropX?: number,
    dropY?: number
  ) => {
    // If it's a dynamic asset, enforce quantity limit
    if (assetId) {
      const assetObj = assets.find(a => a.assetId === Number(assetId));
      const limit = assetObj?.availableQty || 50;
      const count = det.assetItems.filter(item => item.assetId === Number(assetId)).length;
      if (count >= limit) {
        toast.warning(`Cannot exceed available asset quantity of ${limit} for ${label}.`);
        return;
      }
    }

    const nextIndex = det.assetItems.length + 1;
    const rowName = String.fromCharCode(65 + Math.floor((nextIndex - 1) / 5));
    const columnNo = ((nextIndex - 1) % 5) + 1;

    let shortenedLabel = label.split(' ')[0].substring(0, 5).toUpperCase();
    if (type === 'sofa' && (shortenedLabel.includes('CHAIR') || shortenedLabel.includes('PLAST'))) {
      shortenedLabel = 'SOFA';
    } else if (type === 'chair' && shortenedLabel.includes('SOFA')) {
      shortenedLabel = 'CHAIR';
    }

    const newItem: AssetItem = {
      itemId: `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      rowName,
      columnNo,
      label: `${shortenedLabel}-${nextIndex}`,
      status: 'Available',
      price: price,
      x: dropX !== undefined ? dropX : 150 + (Math.random() * 150),
      y: dropY !== undefined ? dropY : 150 + (Math.random() * 150),
      type,
      w,
      h,
      rotation: 0,
      assetId: assetId || ''
    };

    set({ assetItems: [...det.assetItems, newItem], quantity: det.assetItems.length + 1, arrangementType: 'Manual Arrange' });
    setSelectedId(newItem.itemId);
    toast.success(`Added ${label} to canvas.`);
  };

  // Add Item manual (Manual Arrange)
  const handleAddManualItem = () => {
    if (!selectedAsset) {
      toast.warning('Please select an asset from the list to add.');
      return;
    }
    const assetType = getAssetType(selectedAsset.assetName, selectedAsset.assetCode, selectedAsset.iconUrl);
    const cat = CATALOG.find(c => c.type === assetType);
    const customW = cat?.w || 60;
    const customH = cat?.h || 60;

    handleAddComponent(
      assetType,
      selectedAsset.assetName,
      defaultPrice,
      customW,
      customH,
      selectedAsset.assetId
    );
  };

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, itemData: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(itemData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (activeSubTab !== 0) {
      toast.warning('Please switch to 2D Floor Plan layout to drop items.');
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = zoom / 100;
    const dropX = (e.clientX - rect.left) / scale;
    const dropY = (e.clientY - rect.top) / scale;

    // Snap to grid (10px increments)
    const snapX = Math.round(dropX / 10) * 10;
    const snapY = Math.round(dropY / 10) * 10;

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      handleAddComponent(
        data.type,
        data.label,
        data.price || 0,
        data.w || 60,
        data.h || 60,
        data.assetId,
        Math.max(10, snapX),
        Math.max(10, snapY)
      );
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
  };

  const updateItem = (itemId: string, patch: Partial<AssetItem>) => {
    set({
      assetItems: det.assetItems.map(item => item.itemId === itemId ? { ...item, ...patch } : item)
    });
  };

  const deleteItem = (itemId: string) => {
    const remainingItems = det.assetItems.filter(item => item.itemId !== itemId);
    set({ assetItems: remainingItems, quantity: remainingItems.length });
    if (selectedId === itemId) setSelectedId(null);
  };

  // Drag and drop event handling
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, item: AssetItem) => {
    e.stopPropagation();
    setSelectedId(item.itemId);
    if (det.arrangementType !== 'Manual Arrange') return;
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    setDragState({
      id: item.itemId,
      startX: (e.clientX - rect.left) / (zoom / 100) - (item.x || 0),
      startY: (e.clientY - rect.top) / (zoom / 100) - (item.y || 0)
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect) return;
    const newX = (e.clientX - rect.left) / (zoom / 100) - dragState.startX;
    const newY = (e.clientY - rect.top) / (zoom / 100) - dragState.startY;
    const snapX = Math.round(newX / 10) * 10;
    const snapY = Math.round(newY / 10) * 10;
    updateItem(dragState.id, { x: Math.max(10, snapX), y: Math.max(10, snapY) });
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  // Helper to resolve styled colors and properties based on component type
  const getAssetStyle = (type: string, baseColor: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType === 'chair') {
      return {
        bg: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
        border: '1.5px solid #818CF8',
        text: '#312E81',
        muted: '#4F46E5',
        hoverBorder: '#4F46E5',
        shadow: '0 2px 5px rgba(99, 102, 241, 0.15)',
      };
    }
    if (lowerType === 'sofa') {
      return {
        bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
        border: '1.5px solid #34D399',
        text: '#064E3B',
        muted: '#059669',
        hoverBorder: '#059669',
        shadow: '0 2px 5px rgba(16, 185, 129, 0.15)',
      };
    }
    if (lowerType.includes('table')) {
      return {
        bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        border: '1.5px solid #FDBA74',
        text: '#7C2D12',
        muted: '#EA580C',
        hoverBorder: '#EA580C',
        shadow: '0 2px 5px rgba(249, 115, 22, 0.15)',
      };
    }
    if (lowerType === 'booth') {
      return {
        bg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
        border: '1.5px solid #C084FC',
        text: '#581C87',
        muted: '#7C3AED',
        hoverBorder: '#7C3AED',
        shadow: '0 2px 5px rgba(139, 92, 246, 0.15)',
      };
    }
    if (lowerType === 'stage') {
      return {
        bg: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
        border: '1.5px solid #D8B4FE',
        text: '#6B21A8',
        muted: '#9333EA',
        hoverBorder: '#9333EA',
        shadow: '0 4px 8px rgba(147, 51, 234, 0.12)',
      };
    }
    if (lowerType === 'entrance' || lowerType === 'exit' || lowerType === 'emergency') {
      return {
        bg: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
        border: '1.5px solid #F43F5E',
        text: '#9F1239',
        muted: '#E11D48',
        hoverBorder: '#E11D48',
        shadow: '0 2px 5px rgba(244, 63, 94, 0.15)',
      };
    }
    return {
      bg: `linear-gradient(135deg, ${baseColor}0D 0%, ${baseColor}22 100%)`,
      border: `1.5px solid ${baseColor}88`,
      text: baseColor,
      muted: `${baseColor}CC`,
      hoverBorder: baseColor,
      shadow: '0 2px 4px rgba(0,0,0,0.05)',
    };
  };

  // Render individual component shape on 2D canvas
  const renderCatalogShape = (item: AssetItem, isSel: boolean) => {
    const asset = item.assetId ? assets.find(a => a.assetId === Number(item.assetId)) : null;
    let type = (item as any).type || '';
    if (!type || type === 'booth') {
      if (asset) {
        type = getAssetType(asset.assetName, asset.assetCode, asset.iconUrl);
      } else {
        type = getTypeFromLabel(item.label);
      }
    }
    const cat = displayComponents.find(c => c.type === type) || CATALOG.find(c => c.type === type);

    let w = (item as any).w || cat?.w || 44;
    let h = (item as any).h || cat?.h || 44;

    // Enforce high-quality minimum visual dimensions on canvas
    if (type === 'chair') {
      w = Math.max(w, 42);
      h = Math.max(h, 42);
    } else if (type === 'sofa') {
      w = Math.max(w, 75);
      h = Math.max(h, 42);
    } else {
      w = Math.max(w, 32);
      h = Math.max(h, 32);
    }

    const color = cat?.color || '#C9B9F7';
    const rotation = (item as any).rotation || 0;
    const status = item.status || 'Available';

    const finalIconUrl = asset?.iconUrl || (cat as any)?.iconUrl || '';
    const IconComponent = cat?.Icon;

    const styles = getAssetStyle(type, color);

    let statusBadgeColor = '#10B981';
    if (status === 'Blocked') statusBadgeColor = '#EF4444';
    if (status === 'Reserved') statusBadgeColor = '#F59E0B';

    // Premium selection indicators
    const selectionBorder = isSel ? `2px dashed ${EP.primary}` : 'none';

    return (
      <Box
        key={item.itemId}
        onPointerDown={(e) => handlePointerDown(e, item)}
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'absolute',
          left: item.x ?? 0,
          top: item.y ?? 0,
          width: w,
          height: h,
          background: isSel ? 'rgba(108, 99, 255, 0.08)' : 'transparent',
          border: selectionBorder,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: det.arrangementType === 'Manual Arrange' ? 'move' : 'pointer',
          boxShadow: isSel ? '0 0 0 3px rgba(108, 62, 242, 0.25)' : 'none',
          userSelect: 'none',
          transform: `rotate(${rotation}deg)`,
          transition: dragState?.id === item.itemId ? 'none' : 'transform 0.1s ease, border-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.03)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
          }
        }}
      >
        {isSel && (
          <IconButton
            size="small"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              deleteItem(item.itemId);
            }}
            sx={{
              position: 'absolute',
              top: -9,
              right: -9,
              width: 18,
              height: 18,
              bgcolor: EP.red,
              color: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transform: `rotate(${-rotation}deg)`,
              '&:hover': { bgcolor: '#DC2626' },
              zIndex: 10,
            }}
          >
            <CloseIcon sx={{ fontSize: 10 }} />
          </IconButton>
        )}

        {/* Status dot indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: statusBadgeColor,
            border: '1.5px solid #ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            zIndex: 3,
          }}
        />

        {/* Centered Realistic Asset Icon/Image - Fully opaque */}
        {finalIconUrl ? (
          <Box
            component="img"
            src={finalIconUrl}
            alt={item.label}
            onError={(e: any) => {
              e.currentTarget.style.display = 'none';
            }}
            sx={{
              width: '90%',
              height: '90%',
              objectFit: 'contain',
              opacity: 1,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        ) : IconComponent ? (
          <IconComponent
            sx={{
              fontSize: Math.min(w, h) * 0.85,
              color: isSel ? '#7C3AED' : color,
              opacity: 1,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        ) : null}

        {/* Pill overlay badge for Item Label & Price */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: isSel ? EP.primary : '#ffffff',
            color: isSel ? '#ffffff' : '#0f172a',
            border: `1px solid ${isSel ? EP.primary : '#cbd5e1'}`,
            borderRadius: '10px',
            px: 1,
            py: 0.1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.62rem',
              fontWeight: 900,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              lineHeight: 1.1,
            }}
          >
            {item.label}
          </Typography>
          {item.price > 0 && (
            <Typography
              sx={{
                fontSize: '0.5rem',
                fontWeight: 700,
                opacity: 0.85,
                lineHeight: 1,
                mt: 0.1,
              }}
            >
              ₹{item.price}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Render 3D isometric representation combining 3D volume with realistic asset graphics
  const renderIsometricShape = (item: AssetItem, isSel: boolean) => {
    const asset = item.assetId ? assets.find(a => a.assetId === Number(item.assetId)) : null;
    let type = (item as any).type || '';
    if (!type || type === 'booth') {
      if (asset) {
        type = getAssetType(asset.assetName, asset.assetCode, asset.iconUrl);
      } else {
        type = getTypeFromLabel(item.label);
      }
    }
    const cat = displayComponents.find(c => c.type === type) || CATALOG.find(c => c.type === type);

    let w = (item as any).w || cat?.w || 44;
    let h = (item as any).h || cat?.h || 44;

    // Enforce high-quality visual dimensions
    if (type === 'chair') {
      w = Math.max(w, 42);
      h = Math.max(h, 42);
    } else if (type === 'sofa') {
      w = Math.max(w, 75);
      h = Math.max(h, 42);
    } else {
      w = Math.max(w, 32);
      h = Math.max(h, 32);
    }

    const color = cat?.color || '#C9B9F7';
    const rotation = (item as any).rotation || 0;
    const status = item.status || 'Available';

    const finalIconUrl = asset?.iconUrl || (cat as any)?.iconUrl || '';
    const IconComponent = cat?.Icon;

    let statusColor = color;
    if (status === 'Blocked') statusColor = '#EF4444';
    else if (status === 'Reserved') statusColor = '#F59E0B';
    else if (status === 'Available') statusColor = '#10B981';

    let statusBadgeColor = '#10B981';
    if (status === 'Blocked') statusBadgeColor = '#EF4444';
    if (status === 'Reserved') statusBadgeColor = '#F59E0B';

    // Compute stage Z-height offset if this item is placed on top of a Stage
    let zOffset = 0;
    if (type !== 'stage') {
      const stageItem = det.assetItems.find(i => {
        const t = (i as any).type || getTypeFromLabel(i.label);
        return t === 'stage';
      });
      if (stageItem) {
        const stageW = (stageItem as any).w || 240;
        const stageH = (stageItem as any).h || 120;
        const stageX = stageItem.x ?? 0;
        const stageY = stageItem.y ?? 0;
        const itemX = item.x ?? 0;
        const itemY = item.y ?? 0;

        const itemCenterX = itemX + w / 2;
        const itemCenterY = itemY + h / 2;

        if (
          itemCenterX >= stageX &&
          itemCenterX <= stageX + stageW &&
          itemCenterY >= stageY &&
          itemCenterY <= stageY + stageH
        ) {
          zOffset = 35; // Stage height offset in 3D
        }
      }
    }

    // Depth based on asset type
    let depth = 20;
    if (type === 'stage') depth = 35;
    else if (type === 'sofa') depth = 22;
    else if (type === 'chair') depth = 16;
    else if (type === 'speaker' || type.includes('led') || type === 'pa') depth = 55;
    else if (type === 'booth') depth = 40;
    else if (type === 'lounge') depth = 4; // Flat grass base

    const hasShadow = type !== 'wall';

    return (
      <Box
        key={item.itemId}
        onPointerDown={(e) => handlePointerDown(e, item)}
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'absolute',
          left: item.x ?? 0,
          top: item.y ?? 0,
          width: w,
          height: h,
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
          transform: `translate3d(0, 0, ${zOffset + (isSel ? 15 : 0)}px) rotateZ(${rotation}deg)`,
          transition: 'transform 0.15s ease',
        }}
      >
        {/* Ground Drop Shadow */}
        {hasShadow && (
          <Box
            sx={{
              position: 'absolute',
              top: 5,
              left: 5,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(15, 23, 42, 0.22)',
              filter: 'blur(4px)',
              transform: 'translateZ(-1px)',
              borderRadius: type === 'chair' ? '50%' : '6px',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* 1. BOOTH (Hollow walls + Icon flat inside) */}
        {type === 'booth' && (
          <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
            {/* Floor Inside */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(255,255,255,0.75)',
                border: `1.5px solid ${isSel ? EP.primary : '#E2E8F0'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSel ? EP.primary : '#475569',
                transform: 'translateZ(1px)',
              }}
            >
              {finalIconUrl ? (
                <Box component="img" src={finalIconUrl} alt={item.label} sx={{ width: '50%', height: '50%', objectFit: 'contain', opacity: 0.85 }} />
              ) : IconComponent ? (
                <IconComponent sx={{ fontSize: '1.25rem', color: isSel ? EP.primary : '#8B5CF6', opacity: 0.8 }} />
              ) : null}
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 900, mt: 0.25 }}>
                {item.label}
              </Typography>
            </Box>
            {/* Back Wall */}
            <Box sx={{ position: 'absolute', width: w, height: depth, background: 'linear-gradient(180deg, rgba(167, 139, 250, 0.45) 0%, rgba(167, 139, 250, 0.2) 100%)', border: '1.5px solid #8B5CF6', borderBottom: 'none', top: 0, left: 0, transform: 'rotateX(90deg)', transformOrigin: 'top' }} />
            {/* Front Wall */}
            <Box sx={{ position: 'absolute', width: w, height: depth, background: 'linear-gradient(180deg, rgba(167, 139, 250, 0.45) 0%, rgba(167, 139, 250, 0.2) 100%)', border: '1.5px solid #8B5CF6', borderBottom: 'none', bottom: 0, left: 0, transform: 'rotateX(-90deg)', transformOrigin: 'bottom' }} />
            {/* Left Wall */}
            <Box sx={{ position: 'absolute', width: depth, height: h, background: 'linear-gradient(180deg, rgba(167, 139, 250, 0.4) 0%, rgba(167, 139, 250, 0.15) 100%)', border: '1.5px solid #8B5CF6', borderBottom: 'none', top: 0, left: 0, transform: 'rotateY(-90deg)', transformOrigin: 'left' }} />
            {/* Right Wall */}
            <Box sx={{ position: 'absolute', width: depth, height: h, background: 'linear-gradient(180deg, rgba(167, 139, 250, 0.4) 0%, rgba(167, 139, 250, 0.15) 100%)', border: '1.5px solid #8B5CF6', borderBottom: 'none', top: 0, right: 0, transform: 'rotateY(90deg)', transformOrigin: 'right' }} />
          </Box>
        )}

        {/* 2. WOODEN/SLATE STAGE + Backdrop curtain */}
        {type === 'stage' && (
          <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
            {/* Backdrop standing wall */}
            <Box
              sx={{
                position: 'absolute',
                width: w,
                height: h * 0.7,
                background: 'linear-gradient(180deg, #7C3AED 0%, #4C1D95 100%)',
                border: '2px solid #5B21B6',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
                top: 0,
                left: 0,
                transform: 'rotateX(90deg)',
                transformOrigin: 'top',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 900,
                letterSpacing: '2px',
              }}
            >
              {finalIconUrl ? (
                <Box component="img" src={finalIconUrl} sx={{ width: 20, height: 20, mr: 1, objectFit: 'contain', filter: 'brightness(1.5)' }} />
              ) : IconComponent ? (
                <IconComponent sx={{ fontSize: '1.1rem', mr: 1, color: '#fff' }} />
              ) : null}
              MAIN STAGE
            </Box>
            {/* Sides */}
            <Box sx={{ position: 'absolute', width: w, height: depth, bgcolor: '#0f172a', border: '1px solid #1e293b', bottom: 0, left: 0, transform: 'rotateX(-90deg)', transformOrigin: 'bottom' }} />
            <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: '#1e293b', filter: 'brightness(0.8)', top: 0, left: 0, transform: 'rotateY(-90deg)', transformOrigin: 'left' }} />
            <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: '#1e293b', filter: 'brightness(0.9)', top: 0, right: 0, transform: 'rotateY(90deg)', transformOrigin: 'right' }} />
            {/* Stage Deck Top */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                transform: `translateZ(${depth}px)`,
                border: `2px solid ${isSel ? '#ffffff' : '#334155'}`,
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.6)',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color: '#ffffff', opacity: 0.85 }}>
                {item.label} (₹{item.price})
              </Typography>
            </Box>
          </Box>
        )}

        {/* 3. LOUNGE (Grass base + Mini sofa) */}
        {type === 'lounge' && (
          <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
            {/* Grass Carpet Base */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                border: `2px solid ${isSel ? '#ffffff' : '#15803d'}`,
                borderRadius: '8px',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                transform: 'translateZ(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {finalIconUrl ? (
                <Box component="img" src={finalIconUrl} sx={{ width: '50%', height: '50%', objectFit: 'contain', opacity: 0.4 }} />
              ) : IconComponent ? (
                <IconComponent sx={{ fontSize: '1.5rem', color: '#064e3b', opacity: 0.3 }} />
              ) : null}
            </Box>
            {/* Mini Sofa Cushion */}
            <Box
              sx={{
                position: 'absolute',
                width: '45%',
                height: '35%',
                bgcolor: '#F3F4F6',
                border: '1.5px solid #D1D5DB',
                borderRadius: '3px 3px 1px 1px',
                top: '32%',
                left: '27%',
                transform: 'translateZ(10px) rotateX(5deg)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                transformStyle: 'preserve-3d',
              }}
            >
              <Box sx={{ width: '100%', height: '35%', bgcolor: '#E5E7EB', borderBottom: '1px solid #9CA3AF', position: 'absolute', top: 0 }} />
            </Box>
          </Box>
        )}

        {/* 4. REGISTRATION / DESK counters */}
        {(type === 'registration' || type === 'infodesk' || type === 'counter') && (
          <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
            {/* Front Labeled Counter Facade */}
            <Box
              sx={{
                position: 'absolute',
                width: w,
                height: depth,
                background: 'linear-gradient(180deg, #ea580c 0%, #c2410c 100%)',
                border: '1.5px solid #9a3412',
                bottom: 0,
                left: 0,
                transform: 'rotateX(-90deg)',
                transformOrigin: 'bottom',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '0.55rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.2)',
              }}
            >
              {item.label}
            </Box>
            <Box sx={{ position: 'absolute', width: w, height: depth, bgcolor: '#7c2d12', top: 0, left: 0, transform: 'rotateX(90deg)', transformOrigin: 'top' }} />
            <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: '#9a3412', top: 0, left: 0, transform: 'rotateY(-90deg)', transformOrigin: 'left' }} />
            <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: '#9a3412', top: 0, right: 0, transform: 'rotateY(90deg)', transformOrigin: 'right' }} />
            {/* Top counter deck with Desk Icon overlay */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                transform: `translateZ(${depth}px)`,
                border: `1.5px solid ${isSel ? '#ffffff' : '#ea580c'}`,
                borderRadius: '3px',
                boxShadow: `inset 0 2px 3px rgba(255,255,255,0.4), ${isSel ? '0 5px 12px rgba(249, 115, 22, 0.4)' : '0 3px 6px rgba(0,0,0,0.15)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {finalIconUrl ? (
                <Box component="img" src={finalIconUrl} sx={{ width: '40%', height: '40%', objectFit: 'contain', filter: 'brightness(1.5)' }} />
              ) : IconComponent ? (
                <IconComponent sx={{ fontSize: '0.85rem', color: '#ffffff' }} />
              ) : null}
            </Box>
          </Box>
        )}

        {/* 5. GATES (Entrance / Exit / Emergency) - Structural 3D Arch Gate */}
        {(type === 'entrance' || type === 'exit' || type === 'emergency') && (
          <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
            {/* Front Arch Frame (Stands vertically) */}
            <Box
              sx={{
                position: 'absolute',
                width: w,
                height: 52,
                bottom: 0,
                left: 0,
                transform: 'rotateX(-90deg)',
                transformOrigin: 'bottom center',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Left Pillar */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: '8px',
                  height: '100%',
                  bgcolor: statusColor,
                  border: '1px solid rgba(0,0,0,0.25)',
                  boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.4)',
                }}
              />
              {/* Right Pillar */}
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  width: '8px',
                  height: '100%',
                  bgcolor: statusColor,
                  border: '1px solid rgba(0,0,0,0.25)',
                  boxShadow: 'inset -2px 2px 4px rgba(255,255,255,0.4)',
                }}
              />
              {/* Top Header Beam */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '14px',
                  bgcolor: statusColor,
                  border: '1px solid rgba(0,0,0,0.25)',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Typography sx={{ fontSize: '0.45rem', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {item.label}
                </Typography>
              </Box>

              {/* Glowing Walkway glass passage */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '8px',
                  right: '8px',
                  top: '14px',
                  bottom: 0,
                  background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0.02) 100%)',
                  border: '1.5px dashed rgba(56, 189, 248, 0.35)',
                  borderBottom: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {finalIconUrl ? (
                  <Box
                    component="img"
                    src={finalIconUrl}
                    sx={{ width: 15, height: 15, objectFit: 'contain', filter: 'brightness(1.3) drop-shadow(0 0 4px rgba(56, 189, 248, 0.7))' }}
                  />
                ) : IconComponent ? (
                  <IconComponent sx={{ fontSize: 16, color: '#38bdf8' }} />
                ) : null}
              </Box>
            </Box>

            {/* Back Arch Frame to give 3D Thickness (translated on Z axis by -8px) */}
            <Box
              sx={{
                position: 'absolute',
                width: w,
                height: 52,
                bottom: 0,
                left: 0,
                transform: 'translateZ(-8px) rotateX(-90deg)',
                transformOrigin: 'bottom center',
                transformStyle: 'preserve-3d',
                opacity: 0.85,
              }}
            >
              {/* Left Pillar */}
              <Box sx={{ position: 'absolute', left: 0, bottom: 0, width: '8px', height: '100%', bgcolor: statusColor, filter: 'brightness(0.8)' }} />
              {/* Right Pillar */}
              <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: '8px', height: '100%', bgcolor: statusColor, filter: 'brightness(0.8)' }} />
              {/* Top Header Beam */}
              <Box sx={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '14px', bgcolor: statusColor, filter: 'brightness(0.8)' }} />
            </Box>

            {/* Connective Top Roof for the Archway */}
            <Box
              sx={{
                position: 'absolute',
                width: w,
                height: '8px',
                bgcolor: statusColor,
                filter: 'brightness(1.1)',
                top: 0,
                left: 0,
                transform: 'rotateX(0deg) translateZ(52px)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                border: '1px solid rgba(0,0,0,0.15)',
              }}
            />
          </Box>
        )}

        {/* 6. SPEAKER vertical cabinets */}
        {(type === 'speaker' || type === 'pa') && (
          <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
            <Box
              sx={{
                position: 'absolute',
                width: w,
                height: depth,
                background: 'linear-gradient(180deg, #334155 0%, #0f172a 100%)',
                border: '1.5px solid #1e293b',
                bottom: 0,
                left: 0,
                transform: 'rotateX(-90deg)',
                transformOrigin: 'bottom',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
              }}
            >
              <Box sx={{ width: '75%', height: '65%', border: '1px dashed #38bdf8', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {IconComponent ? <IconComponent sx={{ fontSize: 16 }} /> : null}
              </Box>
              <Typography sx={{ fontSize: '0.45rem', fontWeight: 900, color: '#fff', mt: 0.25 }}>
                {item.label}
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', width: w, height: depth, bgcolor: '#1e293b', top: 0, left: 0, transform: 'rotateX(90deg)', transformOrigin: 'top' }} />
            <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: '#0f172a', top: 0, left: 0, transform: 'rotateY(-90deg)', transformOrigin: 'left' }} />
            <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: '#0f172a', top: 0, right: 0, transform: 'rotateY(90deg)', transformOrigin: 'right' }} />
            <Box sx={{ position: 'absolute', width: '100%', height: '100%', bgcolor: '#334155', transform: `translateZ(${depth}px)`, border: '1px solid #475569' }} />
          </Box>
        )}

        {/* 7. LED SCREEN panels */}
        {(type.includes('led') || type === 'window') && (
          <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
            <Box
              sx={{
                position: 'absolute',
                width: w,
                height: depth,
                background: 'radial-gradient(circle, #0284c7 0%, #0369a1 100%)',
                border: `1.5px solid ${isSel ? '#fff' : '#0284c7'}`,
                bottom: 0,
                left: 0,
                transform: 'rotateX(-90deg)',
                transformOrigin: 'bottom',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
              }}
            >
              {finalIconUrl ? (
                <Box component="img" src={finalIconUrl} sx={{ width: '60%', height: '60%', objectFit: 'contain' }} />
              ) : IconComponent ? (
                <IconComponent sx={{ fontSize: 18, filter: 'drop-shadow(0 0 4px #0284c7)' }} />
              ) : null}
              <Typography sx={{ fontSize: '0.45rem', fontWeight: 900, mt: 0.25 }}>
                {item.label}
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', width: w, height: depth, bgcolor: '#0f172a', top: 0, left: 0, transform: 'rotateX(90deg)', transformOrigin: 'top' }} />
            <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: '#1e293b', top: 0, left: 0, transform: 'rotateY(-90deg)', transformOrigin: 'left' }} />
            <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: '#1e293b', top: 0, right: 0, transform: 'rotateY(90deg)', transformOrigin: 'right' }} />
            <Box sx={{ position: 'absolute', width: '100%', height: '100%', bgcolor: '#1e293b', transform: `translateZ(${depth}px)`, border: '1px solid #334155' }} />
          </Box>
        )}

        {/* 8. CHAIR realistic cushion + backrest + icon overlay */}
        {type === 'chair' && (
          <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
            {/* Cushion seat base */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 2,
                width: w - 4,
                height: h - 14,
                bgcolor: statusColor,
                borderRadius: '50%',
                boxShadow: `0 4px 0 ${statusColor}99, inset 0 2px 2px rgba(255,255,255,0.35)`,
                border: '1px solid rgba(0,0,0,0.15)',
                transform: 'translateZ(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {finalIconUrl ? (
                <Box component="img" src={finalIconUrl} sx={{ width: '50%', height: '50%', objectFit: 'contain', filter: 'brightness(1.5)' }} />
              ) : IconComponent ? (
                <IconComponent sx={{ fontSize: '0.62rem', color: '#ffffff' }} />
              ) : null}
            </Box>
            {/* Backrest vertically standing */}
            <Box
              sx={{
                position: 'absolute',
                width: w - 4,
                height: 22,
                bgcolor: statusColor,
                filter: 'brightness(0.9)',
                borderRadius: '6px 6px 0 0',
                border: '1px solid rgba(0,0,0,0.15)',
                boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.2)',
                top: 2,
                left: 2,
                transform: 'rotateX(90deg) translateZ(10px)',
                transformOrigin: 'top',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.52rem', fontWeight: 900, color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.6)' }}>
                {item.label}
              </Typography>
            </Box>
          </Box>
        )}

        {/* 9. SOFA realistic cushions + backrest + icon overlay */}
        {type === 'sofa' && (
          <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
            {/* Cushion seat base */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 3,
                width: w - 6,
                height: h - 12,
                bgcolor: statusColor,
                borderRadius: '5px',
                boxShadow: `0 6px 0 ${statusColor}99, inset 0 2px 3px rgba(255,255,255,0.35)`,
                border: '1.5px solid rgba(0,0,0,0.15)',
                transform: 'translateZ(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {finalIconUrl ? (
                <Box component="img" src={finalIconUrl} sx={{ width: '35%', height: '35%', objectFit: 'contain', filter: 'brightness(1.5)' }} />
              ) : IconComponent ? (
                <IconComponent sx={{ fontSize: '0.85rem', color: '#ffffff' }} />
              ) : null}
            </Box>
            {/* Backrest vertically standing */}
            <Box
              sx={{
                position: 'absolute',
                width: w - 6,
                height: 24,
                bgcolor: statusColor,
                filter: 'brightness(0.85)',
                borderRadius: '6px 6px 0 0',
                border: '1px solid rgba(0,0,0,0.15)',
                top: 3,
                left: 3,
                transform: 'rotateX(90deg) translateZ(12px)',
                transformOrigin: 'top',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 900, color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.6)' }}>
                {item.label}
              </Typography>
            </Box>
          </Box>
        )}

        {/* 10. GENERAL SOLID BOX (tables, columns, utilities) */}
        {type !== 'booth' &&
          type !== 'stage' &&
          type !== 'lounge' &&
          type !== 'registration' &&
          type !== 'infodesk' &&
          type !== 'counter' &&
          type !== 'entrance' &&
          type !== 'exit' &&
          type !== 'emergency' &&
          type !== 'speaker' &&
          type !== 'pa' &&
          !type.includes('led') &&
          type !== 'window' &&
          type !== 'chair' &&
          type !== 'sofa' && (
            <Box sx={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
              {/* Back Face */}
              <Box sx={{ position: 'absolute', width: w, height: depth, bgcolor: statusColor, filter: 'brightness(0.8)', top: 0, left: 0, transform: 'rotateX(90deg)', transformOrigin: 'top', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px' }} />
              {/* Front Face */}
              <Box sx={{ position: 'absolute', width: w, height: depth, bgcolor: statusColor, filter: 'brightness(0.9)', bottom: 0, left: 0, transform: 'rotateX(-90deg)', transformOrigin: 'bottom', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px' }} />
              {/* Left Face */}
              <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: statusColor, filter: 'brightness(0.7)', top: 0, left: 0, transform: 'rotateY(-90deg)', transformOrigin: 'left', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px' }} />
              {/* Right Face */}
              <Box sx={{ position: 'absolute', width: depth, height: h, bgcolor: statusColor, filter: 'brightness(0.75)', top: 0, right: 0, transform: 'rotateY(90deg)', transformOrigin: 'right', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px' }} />
              {/* Top Face */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%)`,
                  transform: `translateZ(${depth}px)`,
                  border: `1.5px solid ${isSel ? '#ffffff' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 0.5,
                  color: '#ffffff',
                  boxShadow: `inset 0 2px 4px rgba(255,255,255,0.4), ${isSel ? '0 5px 15px rgba(108, 62, 242, 0.5)' : '0 4px 8px rgba(0,0,0,0.15)'}`,
                  userSelect: 'none',
                }}
              >
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.6)', lineHeight: 1, textAlign: 'center' }}>
                  {item.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, my: 0.25, width: '100%', pointerEvents: 'none' }}>
                  {finalIconUrl ? (
                    <Box component="img" src={finalIconUrl} alt={item.label} sx={{ maxWidth: '75%', maxHeight: '75%', objectFit: 'contain', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5)) brightness(1.2)' }} />
                  ) : IconComponent ? (
                    <IconComponent sx={{ fontSize: Math.min(w, h) * 0.45, color: '#ffffff', filter: 'drop-shadow(0px 1.5px 2px rgba(0,0,0,0.45))' }} />
                  ) : null}
                </Box>
                {w >= 45 ? (
                  <Typography sx={{ fontSize: '0.48rem', fontWeight: 800, textShadow: '0 1px 1px rgba(0,0,0,0.6)', lineHeight: 1 }}>
                    ₹{item.price}
                  </Typography>
                ) : (
                  <Box sx={{ height: 2 }} />
                )}
              </Box>
            </Box>
          )}
      </Box>
    );
  };

  // Asset Card component for visual selection
  const AssetCard: React.FC<{ asset: Asset; isSelected: boolean; onSelect: () => void }> = ({ asset, isSelected, onSelect }) => {
    const assetType = getAssetType(asset.assetName, asset.assetCode, asset.iconUrl);
    const cat = CATALOG.find(c => c.type === assetType);
    const Icon = cat?.Icon ?? CropSquareIcon;
    const color = cat?.color || '#C9B9F7';
    const isLow = asset.availableQty <= 5;
    const isNone = asset.availableQty === 0;
    const hasImage = !!asset.iconUrl && asset.iconUrl.trim() !== '';

    return (
      <Box
        onClick={() => !isNone && onSelect()}
        draggable={!isNone}
        onDragStart={(e) => {
          if (isNone) return;
          handleDragStart(e, {
            type: assetType,
            label: asset.assetName,
            price: asset.unitPrice || 0,
            w: cat?.w || 60,
            h: cat?.h || 60,
            assetId: asset.assetId
          });
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (isNone) return;
          handleAddComponent(
            assetType,
            asset.assetName,
            asset.unitPrice || 0,
            cat?.w || 60,
            cat?.h || 60,
            asset.assetId
          );
        }}
        sx={{
          position: 'relative',
          border: isSelected ? `2px solid ${EP.primary}` : `1.5px solid ${EP.line}`,
          borderRadius: '12px',
          p: 1.5,
          cursor: isNone ? 'not-allowed' : 'grab',
          bgcolor: isSelected ? `${EP.primary}12` : '#ffffff',
          boxShadow: isSelected ? `0 0 0 3px ${EP.primary}22` : '0 1px 4px rgba(0,0,0,0.06)',
          transition: 'all 0.18s ease',
          opacity: isNone ? 0.45 : 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          minHeight: 110,
          userSelect: 'none',
          '&:hover': !isNone ? {
            borderColor: EP.primary,
            boxShadow: `0 4px 14px rgba(0,0,0,0.1)`,
            transform: 'translateY(-2px)'
          } : {},
          '&:active': !isNone ? { cursor: 'grabbing' } : {},
        }}
      >
        {/* Selected checkmark */}
        {isSelected && (
          <CheckCircleIcon
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              fontSize: 18,
              color: EP.primary,
            }}
          />
        )}

        {/* Icon/Image area — shows API image if available, else catalog icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '10px',
            bgcolor: hasImage ? 'transparent' : (color + '33'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: hasImage ? 'none' : `1px solid ${color}66`,
            overflow: 'hidden',
          }}
        >
          {hasImage ? (
            <Box
              component="img"
              src={asset.iconUrl}
              alt={asset.assetName}
              onError={(e: any) => {
                // On image load error, hide img and show fallback icon
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'flex';
              }}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px',
              }}
            />
          ) : null}
          {/* Fallback icon (shown if no image or image fails) */}
          <Box
            sx={{
              display: hasImage ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Icon sx={{ fontSize: 26, color: color }} />
          </Box>
        </Box>

        {/* Asset Name */}
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textAlign: 'center',
            color: EP.text,
            lineHeight: 1.2,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {asset.assetName}
        </Typography>

        {/* Code chip */}
        <Chip
          label={asset.assetCode}
          size="small"
          sx={{
            fontSize: '0.6rem',
            height: 18,
            bgcolor: color + '22',
            color: color,
            fontWeight: 700,
            border: `1px solid ${color}55`,
            px: 0.5,
          }}
        />

        {/* Availability */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: isNone ? '#EF4444' : isLow ? '#F59E0B' : '#10B981',
            }}
          />
          <Typography sx={{ fontSize: '0.62rem', color: isNone ? '#EF4444' : isLow ? '#F59E0B' : EP.muted, fontWeight: 600 }}>
            {isNone ? 'Unavailable' : `${asset.availableQty} avail`}
          </Typography>
        </Box>

        {/* Price if available */}
        {asset.unitPrice !== undefined && asset.unitPrice > 0 && (
          <Typography sx={{ fontSize: '0.62rem', color: EP.primary, fontWeight: 700 }}>
            ₹{asset.unitPrice}
          </Typography>
        )}
      </Box>
    );
  };


  return (
    <Box sx={{ ...cardSx, p: { xs: 2, md: 3 } }}>
      <StepHeading
        title="Event Details & Floor Plan Arrangement"
        subtitle="Manage event resource allocations and lay out components zone-wise."
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '370px 1fr' }, gap: 3, mt: 2 }}>

        {/* Left Side: Parameters Form Configuration */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            borderRight: { lg: `1px solid ${EP.line}` },
            pr: { lg: 3 },
            maxHeight: { lg: 650 },
            overflowY: { lg: 'auto' },
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: EP.line, borderRadius: 4 },
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: EP.primary }}>Arrangement Parameters</Typography>

          {/* Select Zone Dropdown */}
          <AppDropdown
            label="Select Zone"
            options={(ddl.eventZones || []).map(z => ({ label: z.label, value: z.value }))}
            value={det.zoneId}
            onChange={(e) => {
              const newZoneId = Number(e.target.value);
              const currentZoneId = Number(det.zoneId);

              // 1. Prepare updated zones dict including current zone's layout
              const updatedZones = { ...(det.zones || {}) };
              if (currentZoneId) {
                updatedZones[currentZoneId] = {
                  assetItems: det.assetItems,
                  rows: det.rows,
                  columns: det.columns,
                  arrangementType: det.arrangementType,
                  assetId: det.assetId,
                };
              }

              // 2. Retrieve new zone's layout
              const newZoneLayout = updatedZones[newZoneId];

              if (newZoneLayout) {
                // If the target zone has a saved layout in memory, restore it!
                onChange('details', {
                  ...det,
                  zoneId: newZoneId,
                  assetId: newZoneLayout.assetId,
                  arrangementType: newZoneLayout.arrangementType,
                  rows: newZoneLayout.rows,
                  columns: newZoneLayout.columns,
                  assetItems: newZoneLayout.assetItems,
                  zones: updatedZones,
                });
              } else {
                // If it does not exist, set empty layout (it will trigger API load)
                onChange('details', {
                  ...det,
                  zoneId: newZoneId,
                  assetId: '',
                  arrangementType: '',
                  rows: 5,
                  columns: 5,
                  assetItems: [],
                  zones: updatedZones,
                });
              }
              setSelectedId(null);
            }}
          />

          {det.zoneId ? (
            <>
              {/* Left Panel Tabs */}
              <Box sx={{ borderBottom: `1px solid ${EP.line}`, mb: 1.5 }}>
                <Tabs
                  value={leftTab}
                  onChange={(_, val) => setLeftTab(val)}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    minHeight: 36,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      minWidth: '50%',
                      py: 1,
                      minHeight: 36,
                    }
                  }}
                >
                  <Tab label="Assets" />
                  <Tab label="Components" />
                </Tabs>
              </Box>

              {leftTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Asset Visual Card Selection */}
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 1, color: EP.text }}>
                      Select Asset (Drag & Drop or Double-Click)
                    </Typography>

                    {loadingAssets ? (
                      <AppLoader message="Loading assets..." />
                    ) : assets.length === 0 ? (
                      <Alert severity="info" sx={{ py: 0.5, fontSize: '0.78rem' }}>
                        No assets found. Please add assets in the Asset Management module.
                      </Alert>
                    ) : (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                          gap: 1.25,
                          maxHeight: 220,
                          overflowY: 'auto',
                          pr: 0.5,
                          '&::-webkit-scrollbar': { width: 4 },
                          '&::-webkit-scrollbar-thumb': { bgcolor: EP.line, borderRadius: 4 },
                        }}
                      >
                        {assets.map(asset => (
                          <AssetCard
                            key={asset.assetId}
                            asset={asset}
                            isSelected={Number(det.assetId) === asset.assetId}
                            onSelect={() => {
                              set({ assetId: asset.assetId });
                              setSelectedId(null);
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {det.assetId && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Arrangement Type Select */}
                      <AppDropdown
                        label="Arrangement Type"
                        options={(ddl.arrangementTypes || []).map(a => ({ label: a.label, value: a.value }))}
                        value={det.arrangementType}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          if (val === 'Auto Arrange') {
                            set({ arrangementType: val, assetItems: [] });
                          } else {
                            set({ arrangementType: val });
                          }
                          setSelectedId(null);
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Asset Quantity Limit:</Typography>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: EP.primary }}>{assetLimit} items</Typography>
                      </Box>

                      {det.arrangementType === 'Auto Arrange' && (
                        <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: `${EP.radiusSm}px`, border: `1px solid ${EP.line}` }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', mb: 1.5 }}>Configure Grid Dimensions</Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 1.5 }}>
                            <AppInput
                              label="Rows"
                              type="number"
                              value={localRows}
                              onChange={(e) => setLocalRows(Math.max(1, Number(e.target.value) || 1))}
                            />
                            <AppInput
                              label="Columns"
                              type="number"
                              value={localCols}
                              onChange={(e) => setLocalCols(Math.max(1, Number(e.target.value) || 1))}
                            />
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <AppInput
                              label="Quantity"
                              type="number"
                              value={localQty}
                              onChange={(e) => setLocalQty(Math.max(1, Number(e.target.value) || 1))}
                            />
                          </Box>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<GridViewIcon />}
                            onClick={handleGenerateLayout}
                            sx={{ textTransform: 'none', bgcolor: EP.primary, fontWeight: 600, '&:hover': { bgcolor: EP.primaryDark } }}
                          >
                            Generate Layout
                          </Button>
                          <Typography sx={{ fontSize: '0.68rem', color: EP.faint, mt: 1 }}>
                            Auto-generated grid cells will represent asset items. Grid is capped by asset availability.
                          </Typography>
                        </Box>
                      )}

                      {det.arrangementType === 'Manual Arrange' && (
                        <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: `${EP.radiusSm}px`, border: `1px solid ${EP.line}` }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', mb: 1 }}>Manual Arrangement</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: EP.muted, mb: 2 }}>
                            Drag & drop the selected asset card or click below to add assets manually.
                          </Typography>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddManualItem}
                            sx={{ textTransform: 'none', color: EP.primary, borderColor: EP.primary, fontWeight: 700 }}
                          >
                            Add Asset to Canvas
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {leftTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.74rem', color: EP.muted }}>
                      Drag components onto the floor plan or double-click to add.
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenAddCompModal(true)}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        bgcolor: EP.primary,
                        borderRadius: '6px',
                        '&:hover': { bgcolor: EP.primaryDark ?? EP.primary }
                      }}
                    >
                      Add Component
                    </Button>
                  </Box>

                  {/* Category Chips */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.75,
                      overflowX: 'auto',
                      pb: 1,
                      '&::-webkit-scrollbar': { height: 4 },
                      '&::-webkit-scrollbar-thumb': { bgcolor: EP.line, borderRadius: 4 },
                    }}
                  >
                    {dynamicCategories.map(cat => (
                      <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        clickable
                        color={selectedCompCategory === cat ? 'primary' : 'default'}
                        onClick={() => setSelectedCompCategory(cat)}
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          bgcolor: selectedCompCategory === cat ? EP.primary : 'rgba(0,0,0,0.04)',
                          color: selectedCompCategory === cat ? '#ffffff' : EP.text,
                          '&:hover': { bgcolor: selectedCompCategory === cat ? EP.primaryDark : 'rgba(0,0,0,0.08)' }
                        }}
                      />
                    ))}
                  </Box>

                  {/* Grid of Catalog Components */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                      gap: 1.25,
                      maxHeight: 280,
                      overflowY: 'auto',
                      pr: 0.5,
                      '&::-webkit-scrollbar': { width: 4 },
                      '&::-webkit-scrollbar-thumb': { bgcolor: EP.line, borderRadius: 4 },
                    }}
                  >
                    {displayComponents.filter(item => selectedCompCategory === 'All Components' || item.category === selectedCompCategory).map(item => {
                      const Icon = item.Icon;
                      return (
                        <Box
                          key={item.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, {
                            type: item.type,
                            label: item.label,
                            price: item.price || 0,
                            w: item.w,
                            h: item.h
                          })}
                          onDoubleClick={() => handleAddComponent(
                            item.type,
                            item.label,
                            item.price || 0,
                            item.w,
                            item.h
                          )}
                          sx={{
                            border: `1.5px solid ${EP.line}`,
                            borderRadius: '12px',
                            p: 1.5,
                            cursor: 'grab',
                            bgcolor: '#ffffff',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            transition: 'all 0.18s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.75,
                            minHeight: 100,
                            userSelect: 'none',
                            '&:hover': {
                              borderColor: EP.primary,
                              boxShadow: `0 4px 14px rgba(0,0,0,0.1)`,
                              transform: 'translateY(-2px)'
                            },
                            '&:active': { cursor: 'grabbing' }
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '8px',
                              bgcolor: item.color + '22',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${item.color}44`,
                            }}
                          >
                            {item.iconUrl ? (
                              <img src={item.iconUrl} alt={item.label} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                            ) : (
                              <Icon sx={{ fontSize: 22, color: item.color }} />
                            )}
                          </Box>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textAlign: 'center', color: EP.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                            {item.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: EP.muted, fontWeight: 500 }}>
                            {item.sizeLabel}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info" sx={{ py: 0.5 }}>Please select a Zone to load available assets.</Alert>
          )}

          {/* Placed Item properties inspector panel */}
          {selectedItem && (
            <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2, mt: 2, bgcolor: '#FBFAFF' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: EP.primary }}>Item Properties</Typography>
                <IconButton size="small" onClick={() => deleteItem(selectedItem.itemId)}>
                  <DeleteOutlineIcon fontSize="small" sx={{ color: EP.red }} />
                </IconButton>
              </Box>

              <AppInput
                label="Custom Label"
                value={selectedItem.label}
                onChange={(e) => updateItem(selectedItem.itemId, { label: e.target.value })}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>
                <AppDropdown
                  label="Status"
                  options={['Available', 'Blocked', 'Reserved'].map(st => ({ label: st, value: st }))}
                  value={selectedItem.status}
                  onChange={(e) => updateItem(selectedItem.itemId, { status: e.target.value as any })}
                />
                <AppInput
                  label="Price (₹)"
                  type="number"
                  value={selectedItem.price}
                  onChange={(e) => updateItem(selectedItem.itemId, { price: Number(e.target.value) || 0 })}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>
                <AppInput
                  label="Width (px)"
                  type="number"
                  value={selectedItem.w || 44}
                  onChange={(e) => updateItem(selectedItem.itemId, { w: Math.max(10, Number(e.target.value) || 10) })}
                />
                <AppInput
                  label="Height (px)"
                  type="number"
                  value={selectedItem.h || 44}
                  onChange={(e) => updateItem(selectedItem.itemId, { h: Math.max(10, Number(e.target.value) || 10) })}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1.5 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, mb: 0.5, color: EP.muted }}>Rotation (deg)</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Slider
                    size="small"
                    value={(selectedItem as any).rotation || 0}
                    min={0}
                    max={360}
                    step={15}
                    onChange={(_, val) => updateItem(selectedItem.itemId, { rotation: val as number } as any)}
                    sx={{ flex: 1 }}
                  />
                  <Typography sx={{ fontSize: '0.72rem', minWidth: 28, fontWeight: 700 }}>
                    {((selectedItem as any).rotation || 0)}°
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Side: Canvas Visual Representation */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Horizontal sub-tabs for rendering modes */}
          <Box sx={{ borderBottom: `1px solid ${EP.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', pb: 0.5 }}>
            <Tabs
              value={activeSubTab}
              onChange={(_, val) => {
                setActiveSubTab(val);
                if (val === 1) setZoom(90);
              }}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', minWidth: 100 }
              }}
            >
              <Tab label="Floor Plan" id="floor-plan-tab-2d" />
              <Tab label="3D View" id="floor-plan-tab-3d" />
              <Tab label="Components" id="floor-plan-tab-list" />
            </Tabs>

            {/* Canvas controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F3F4F6', p: 0.5, borderRadius: '8px' }}>
              <IconButton size="small" onClick={() => setZoom(z => Math.max(30, z - 10))} sx={{ bgcolor: '#ffffff', border: `1px solid ${EP.line}` }}>
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ fontSize: '0.78rem', minWidth: 42, textAlign: 'center', fontWeight: 700 }}>
                {zoom}%
              </Typography>
              <IconButton size="small" onClick={() => setZoom(z => Math.min(150, z + 10))} sx={{ bgcolor: '#ffffff', border: `1px solid ${EP.line}` }}>
                <AddIcon fontSize="small" />
              </IconButton>

              <Tooltip title="Fit Canvas to Screen">
                <IconButton size="small" onClick={() => setZoom(100)} sx={{ bgcolor: '#ffffff', border: `1px solid ${EP.line}`, ml: 0.5 }}>
                  <AspectRatioIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Button
                size="small"
                variant="contained"
                onClick={() => setActiveSubTab(activeSubTab === 1 ? 0 : 1)}
                startIcon={<GridViewIcon fontSize="small" />}
                sx={{ textTransform: 'none', bgcolor: EP.primary, fontSize: '0.72rem', px: 1, '&:hover': { bgcolor: EP.primaryDark } }}
              >
                {activeSubTab === 1 ? '2D Layout' : '3D View'}
              </Button>

              <Button
                size="small"
                variant="outlined"
                onClick={() => toast.info('Loading blueprints from files coming soon.')}
                startIcon={<UploadIcon fontSize="small" />}
                sx={{ textTransform: 'none', color: EP.text, borderColor: EP.line, fontSize: '0.72rem', px: 1, bgcolor: '#ffffff', '&:hover': { bgcolor: '#f9f9f9', borderColor: EP.faint } }}
              >
                Upload Plan
              </Button>
            </Box>
          </Box>

          {activeSubTab === 2 ? (
            /* Sub-tab 3: Placed Components manager table view */
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 2, color: EP.primary }}>Placed Components Manager</Typography>
              {det.assetItems.length === 0 ? (
                <Alert severity="info">No components placed yet. Generate a layout or add manually on the floor plan.</Alert>
              ) : (
                <TableContainer component={Paper} sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, boxShadow: 'none' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: EP.canvas }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Label</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Position (X, Y)</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {det.assetItems.map((item) => {
                        return (
                          <TableRow key={item.itemId} hover>
                            <TableCell>
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateItem(item.itemId, { label: e.target.value })}
                                style={{ border: `1px solid ${EP.line}`, padding: '4px 8px', borderRadius: '4px', fontSize: '0.78rem', width: 120 }}
                              />
                            </TableCell>
                            <TableCell sx={{ textTransform: 'capitalize', fontSize: '0.78rem' }}>{(item as any).type || 'Booth/Seat'}</TableCell>
                            <TableCell>
                              <select
                                value={item.status}
                                onChange={(e) => updateItem(item.itemId, { status: e.target.value as any })}
                                style={{ border: `1px solid ${EP.line}`, padding: '4px 6px', borderRadius: '4px', fontSize: '0.78rem' }}
                              >
                                <option value="Available">Available</option>
                                <option value="Blocked">Blocked</option>
                                <option value="Reserved">Reserved</option>
                              </select>
                            </TableCell>
                            <TableCell>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItem(item.itemId, { price: Number(e.target.value) || 0 })}
                                style={{ border: `1px solid ${EP.line}`, padding: '4px 6px', borderRadius: '4px', fontSize: '0.78rem', width: 80 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.78rem', color: EP.muted }}>{item.x ?? 0}px, {item.y ?? 0}px</TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => deleteItem(item.itemId)}>
                                <DeleteOutlineIcon fontSize="small" sx={{ color: EP.red }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ) : (
            /* Sub-tab 1 & 2: 2D & 3D visual grid canvas views */
            <>
              <Box>
                <Typography sx={{ fontSize: '0.74rem', color: EP.muted }}>
                  Active items placed: {det.assetItems.length} / {assetLimit}
                </Typography>
              </Box>

              {/* Canvas viewport */}
              <Box
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={() => setSelectedId(null)}
                sx={{
                  position: 'relative',
                  height: 520,
                  borderRadius: `${EP.radiusSm}px`,
                  border: `1px solid ${EP.line}`,
                  overflow: activeSubTab === 1 ? 'hidden' : 'auto',
                  bgcolor: activeSubTab === 1 ? '#0F172A' : '#ffffff',
                  perspective: activeSubTab === 1 ? '1600px' : 'none',
                  backgroundImage: activeSubTab === 1 ? 'none' : 'repeating-linear-gradient(0deg, #F3F4F6 0 1px, transparent 1px 20px), repeating-linear-gradient(90deg, #F3F4F6 0 1px, transparent 1px 20px)',
                  boxShadow: activeSubTab === 1 ? 'inset 0 0 80px rgba(0,0,0,0.6)' : 'none',
                  transition: 'background-color 0.3s ease',
                }}
              >
                {/* Inner zoom scale layout container */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: activeSubTab === 1 ? 1100 : 1400,
                    height: activeSubTab === 1 ? 1100 : 1400,
                    left: activeSubTab === 1 ? '50%' : 0,
                    top: activeSubTab === 1 ? '50%' : 0,
                    transformOrigin: activeSubTab === 1 ? 'center center' : 'top left',
                    transform: activeSubTab === 1
                      ? `translate(-50%, -30%) scale(${zoom / 100}) rotateX(32deg) rotateZ(0deg)`
                      : `scale(${zoom / 100})`,
                    transformStyle: activeSubTab === 1 ? 'preserve-3d' : 'flat',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Zone boundary box */}
                  <Box
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    sx={{
                      position: 'absolute',
                      top: activeSubTab === 1 ? 0 : 10,
                      left: activeSubTab === 1 ? 0 : 10,
                      width: 1100,
                      height: 1100,
                      border: activeSubTab === 1 ? 'none' : `2px dashed ${EP.primary}55`,
                      borderRadius: '8px',
                      bgcolor: activeSubTab === 1 ? '#E2E8F0' : 'transparent',
                      backgroundImage: activeSubTab === 1
                        ? 'radial-gradient(circle, #FFFFFF 0%, #CBD5E1 100%)'
                        : 'none',
                      boxShadow: activeSubTab === 1 ? '0 50px 100px rgba(0,0,0,0.5)' : 'none',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {activeSubTab === 1 && (
                      <>
                        {/* 3D Room Surrounding Walls */}
                        {/* Back Wall */}
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '60px',
                          bgcolor: '#94A3B8',
                          border: '2.5px solid #64748B',
                          borderBottom: 'none',
                          transform: 'rotateX(90deg)',
                          transformOrigin: 'top',
                          boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.15)',
                          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 198px, #64748B 200px)',
                          zIndex: 10,
                        }} />
                        {/* Left Wall */}
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '60px',
                          height: '100%',
                          bgcolor: '#64748B',
                          border: '2.5px solid #475569',
                          borderRight: 'none',
                          transform: 'rotateY(-90deg)',
                          transformOrigin: 'left',
                          boxShadow: 'inset -20px 0 40px rgba(0,0,0,0.15)',
                          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 198px, #475569 200px)',
                          zIndex: 10,
                        }} />
                        {/* Right Wall */}
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '60px',
                          height: '100%',
                          bgcolor: '#64748B',
                          border: '2.5px solid #475569',
                          borderLeft: 'none',
                          transform: 'rotateY(90deg)',
                          transformOrigin: 'right',
                          boxShadow: 'inset 20px 0 40px rgba(0,0,0,0.15)',
                          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 198px, #475569 200px)',
                          zIndex: 10,
                        }} />
                        {/* Front Wall with Gate Opening Cutouts */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '60px',
                          bgcolor: '#cbd5e1',
                          border: '2.5px solid #94A3B8',
                          borderTop: 'none',
                          transform: 'rotateX(-90deg)',
                          transformOrigin: 'bottom',
                          boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.15)',
                          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 198px, #94A3B8 200px)',
                          zIndex: 10,
                        }} />
                      </>
                    )}
                    <Typography sx={{ position: 'absolute', top: 10, right: 15, fontSize: '0.72rem', color: EP.primary, fontWeight: 800, opacity: 0.65 }}>
                      ZONE BOUNDARY ({selectedZone?.label || 'NO ZONE SELECTED'})
                    </Typography>

                    {det.assetItems.length === 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography sx={{ color: EP.faint, fontSize: '0.85rem' }}>
                          No assets arranged. Select a zone and asset on the left panel to begin.
                        </Typography>
                      </Box>
                    )}

                    {/* Render visual shapes */}
                    {det.assetItems.map((item) => {
                      const isSel = item.itemId === selectedId;
                      if (activeSubTab === 1) {
                        return renderIsometricShape(item, isSel);
                      }
                      return renderCatalogShape(item, isSel);
                    })}
                  </Box>
                </Box>
              </Box>

              {/* Canvas controls bottom-bar */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<RestartAltIcon />}
                  onClick={() => {
                    set({ assetItems: [] });
                    setSelectedId(null);
                  }}
                  sx={{ textTransform: 'none', color: EP.red, fontWeight: 700 }}
                >
                  Clear Arrangement
                </Button>
                <Typography sx={{ fontSize: '0.72rem', color: EP.faint }}>
                  Drag placed components to arrange. Click a cell to edit.
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: EP.muted }}>
                  Scale: Fit to Screen
                </Typography>
              </Box>
            </>
          )}

      </Box>
    </Box>

      <AddComponentModal
        open={openAddCompModal}
        onClose={() => setOpenAddCompModal(false)}
        onSaved={() => {
          // Re-fetch database components to update the list in the side tab
          componentApi.getComponents()
            .then(res => {
              if (res.success && res.data) {
                setDbComponents(res.data);
              }
            })
            .catch(err => console.error('Failed to load components dynamically:', err));
        }}
      />
    </Box>
  );
};

export default Step4FloorPlan;
