import React, { useMemo } from 'react';
import { Box, Typography, Button, Card, CardContent, Chip } from '@mui/material';

interface SeatItem {
  seatId: number;
  seatNumber: string;
  rowName: string;
  columnNo: number;
  seatStatus: 'Available' | 'Booked' | 'Blocked' | 'Reserved' | 'Hold';
}

interface SeatGridProps {
  rowCount: number;
  columnCount: number;
  seats: SeatItem[];
  onToggleSeatStatus: (seatNumber: string, currentStatus: string) => void;
  onAutoGenerate: () => void;
}

export const SeatGrid: React.FC<SeatGridProps> = ({
  rowCount,
  columnCount,
  seats,
  onToggleSeatStatus,
  onAutoGenerate
}) => {
  
  const rows = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      list.push(String.fromCharCode(65 + i)); // A, B, C, ...
    }
    return list;
  }, [rowCount]);

  const seatMap = useMemo(() => {
    const map = new Map<string, SeatItem>();
    seats.forEach((s) => map.set(s.seatNumber, s));
    return map;
  }, [seats]);

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'Booked': return '#ef4444'; // Red
      case 'Blocked': return '#9ca3af'; // Gray
      case 'Reserved': return '#8b5cf6'; // Purple
      case 'Hold': return '#f59e0b'; // Amber
      default: return '#10b981'; // Green (Available)
    }
  };

  return (
    <Card variant="outlined" style={{ borderRadius: 12 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Seat Configuration & Grid</Typography>
            <Typography variant="caption" color="textSecondary">
              Rows: {rowCount} ({rows.join(', ') || 'None'}), Columns: {columnCount}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={onAutoGenerate}
            disabled={rowCount <= 0 || columnCount <= 0}
            style={{ textTransform: 'none', borderRadius: 8 }}
          >
            Auto Generate Seats
          </Button>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Chip label="Available" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 600 }} />
          <Chip label="Booked" size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 600 }} />
          <Chip label="Blocked" size="small" sx={{ bgcolor: '#9ca3af', color: '#fff', fontWeight: 600 }} />
          <Chip label="Reserved" size="small" sx={{ bgcolor: '#8b5cf6', color: '#fff', fontWeight: 600 }} />
        </Box>

        {seats.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #e5e7eb', borderRadius: 2 }}>
            <Typography variant="body2" color="textSecondary">
              No seats generated yet. Click "Auto Generate Seats" to construct grid.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto', p: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: columnCount * 45 }}>
              {rows.map((row) => (
                <Box key={row} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ width: 20, fontWeight: 700 }}>{row}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {Array.from({ length: columnCount }).map((_, colIdx) => {
                      const colNo = colIdx + 1;
                      const seatNo = `${row}${colNo}`;
                      const seat = seatMap.get(seatNo);
                      const color = getSeatColor(seat?.seatStatus || 'Available');

                      return (
                        <Box
                          key={colNo}
                          onClick={() => seat && onToggleSeatStatus(seatNo, seat.seatStatus)}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: color,
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            '&:hover': {
                              transform: 'scale(1.15)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          {colNo}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SeatGrid;
