import React, { useState } from 'react';
import { Box, Button, ButtonGroup, Typography, Card, CardContent, IconButton, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CropFreeIcon from '@mui/icons-material/CropFree';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';
import SaveIcon from '@mui/icons-material/Save';

interface ZoneDesignItem {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  shape: 'rect' | 'circle';
}

interface BlueprintDesignerProps {
  blueprintImage: string;
  stagePosition: string;
  setStagePosition: (pos: string) => void;
  zones: ZoneDesignItem[];
  onAddZone: (shape: 'rect' | 'circle') => void;
  onSelectZone: (zone: ZoneDesignItem) => void;
  onUpdateZonePosition?: (zoneId: string, x: number, y: number) => void;
  onSaveLayout?: () => void;
}

export const BlueprintDesigner: React.FC<BlueprintDesignerProps> = ({
  blueprintImage,
  stagePosition,
  setStagePosition,
  zones,
  onAddZone,
  onSelectZone,
  onUpdateZonePosition,
  onSaveLayout,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [dragState, setDragState] = useState<{
    zoneId: string;
    startX: number;
    startY: number;
    startMouseX: number;
    startMouseY: number;
  } | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleZoneMouseDown = (e: React.MouseEvent, zone: ZoneDesignItem) => {
    e.stopPropagation();
    e.preventDefault();
    setDragState({
      zoneId: zone.id,
      startX: zone.x,
      startY: zone.y,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    });
    onSelectZone(zone);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !onUpdateZonePosition) return;
    e.preventDefault();
    const deltaX = (e.clientX - dragState.startMouseX) / zoom;
    const deltaY = (e.clientY - dragState.startMouseY) / zoom;

    const zone = zones.find(z => z.id === dragState.zoneId);
    if (!zone) return;

    let newX = Math.round(dragState.startX + deltaX);
    let newY = Math.round(dragState.startY + deltaY);

    // Constrain zone within canvas (600 x 350)
    newX = Math.max(0, Math.min(newX, 600 - zone.width));
    newY = Math.max(0, Math.min(newY, 350 - zone.height));

    onUpdateZonePosition(dragState.zoneId, newX, newY);
  };

  const handleCanvasMouseUp = () => {
    setDragState(null);
  };

  return (
    <Card variant="outlined" style={{ borderRadius: 12, overflow: 'hidden' }}>
      <Box sx={{ borderBottom: '1px solid #e5e7eb', p: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, bg: '#f9fafb' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewModuleIcon />}
            onClick={() => onAddZone('rect')}
            style={{ textTransform: 'none', borderRadius: 6 }}
          >
            Add Rect Zone
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewModuleIcon />}
            onClick={() => onAddZone('circle')}
            style={{ textTransform: 'none', borderRadius: 6 }}
          >
            Add Circle Zone
          </Button>
          {onSaveLayout && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={onSaveLayout}
              style={{ textTransform: 'none', borderRadius: 6, fontWeight: 600 }}
            >
              Save Layout
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#4b5563' }}>
            Stage Position:
          </Typography>
          <ButtonGroup size="small" variant="outlined">
            {['Top', 'Bottom', 'Left', 'Right'].map((pos) => (
              <Button
                key={pos}
                variant={stagePosition === pos ? 'contained' : 'outlined'}
                onClick={() => setStagePosition(pos)}
                style={{ textTransform: 'none', minWidth: 60 }}
              >
                {pos}
              </Button>
            ))}
          </ButtonGroup>

          <Box sx={{ display: 'flex', borderLeft: '1px solid #e5e7eb', pl: 2 }}>
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={handleZoomIn}><ZoomInIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={handleZoomOut}><ZoomOutIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Reset Zoom">
              <IconButton size="small" onClick={handleResetZoom}><CropFreeIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <CardContent style={{ padding: 0 }}>
        <Box 
          sx={{ position: 'relative', height: 450, overflow: 'auto', bgcolor: '#111827', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          
          {/* Stage Representation */}
          {stagePosition === 'Top' && (
            <Box sx={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10, bgcolor: '#f59e0b', px: 4, py: 1, borderRadius: 1.5, boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              <Typography variant="caption" style={{ color: '#fff', fontWeight: 800, letterSpacing: 1 }}>STAGE AREA</Typography>
            </Box>
          )}
          {stagePosition === 'Bottom' && (
            <Box sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10, bgcolor: '#f59e0b', px: 4, py: 1, borderRadius: 1.5, boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              <Typography variant="caption" style={{ color: '#fff', fontWeight: 800, letterSpacing: 1 }}>STAGE AREA</Typography>
            </Box>
          )}
          {stagePosition === 'Left' && (
            <Box sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: '#f59e0b', px: 1, py: 4, borderRadius: 1.5, writingMode: 'vertical-lr', textOrientation: 'mixed', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              <Typography variant="caption" style={{ color: '#fff', fontWeight: 800, letterSpacing: 1 }}>STAGE AREA</Typography>
            </Box>
          )}
          {stagePosition === 'Right' && (
            <Box sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: '#f59e0b', px: 1, py: 4, borderRadius: 1.5, writingMode: 'vertical-lr', textOrientation: 'mixed', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              <Typography variant="caption" style={{ color: '#fff', fontWeight: 800, letterSpacing: 1 }}>STAGE AREA</Typography>
            </Box>
          )}

          {/* Interactive Canvas Grid */}
          <Box
            style={{
              width: 600,
              height: 350,
              position: 'relative',
              backgroundImage: blueprintImage ? `url(${blueprintImage})` : 'radial-gradient(#374151 1px, transparent 0)',
              backgroundSize: blueprintImage ? 'cover' : '20px 20px',
              backgroundColor: '#1f2937',
              transform: `scale(${zoom})`,
              transition: dragState ? 'none' : 'transform 0.1s ease',
              borderRadius: 8,
              border: '2px dashed #4b5563',
            }}
          >
            {zones.map((zone) => (
              <Box
                key={zone.id}
                onMouseDown={(e) => handleZoneMouseDown(e, zone)}
                sx={{
                  position: 'absolute',
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                  border: `2px solid ${zone.color}`,
                  bgcolor: `${zone.color}25`,
                  borderRadius: zone.shape === 'circle' ? '50%' : 1.5,
                  cursor: 'move',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  userSelect: 'none',
                  boxShadow: dragState?.zoneId === zone.id ? '0 12px 24px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.25)',
                  transform: dragState?.zoneId === zone.id ? 'scale(1.05)' : 'scale(1)',
                  zIndex: dragState?.zoneId === zone.id ? 100 : 10,
                  transition: dragState?.zoneId === zone.id ? 'none' : 'all 0.2s',
                  '&:hover': {
                    bgcolor: `${zone.color}45`,
                  }
                }}
              >
                {zone.type === 'VIP' ? <StarIcon style={{ color: zone.color, fontSize: 16 }} /> : <SecurityIcon style={{ color: zone.color, fontSize: 16 }} />}
                <Typography variant="caption" style={{ color: '#fff', fontWeight: 700, textShadow: '1px 1px 2px #000' }}>
                  {zone.name}
                </Typography>
                <Typography variant="caption" style={{ color: '#fff', fontSize: '9px', opacity: 0.8 }}>
                  {zone.type}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlueprintDesigner;
