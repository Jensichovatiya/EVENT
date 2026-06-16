import React from 'react';
import { Box, Typography } from '@mui/material';

interface AppBarcodeProps {
  value: string;
  height?: number;
  width?: number;
}

export const AppBarcode: React.FC<AppBarcodeProps> = ({ value, height = 60, width = 200 }) => {
  // Generate a mock barcode pattern from the value string
  const getPattern = () => {
    let pattern = '101'; // start
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      pattern += (charCode % 2 === 0) ? '110010' : '100110';
    }
    pattern += '101'; // stop
    return pattern;
  };

  const pattern = getPattern();
  const barWidth = width / pattern.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <svg width={width} height={height} style={{ background: 'white', padding: 4, borderRadius: 4 }}>
        <g fill="#000000">
          {pattern.split('').map((char, index) => {
            if (char === '1') {
              return (
                <rect
                  key={index}
                  x={index * barWidth}
                  y={0}
                  width={barWidth}
                  height={height}
                />
              );
            }
            return null;
          })}
        </g>
      </svg>
      <Typography variant="caption" color="textSecondary" style={{ marginTop: 4, fontFamily: 'monospace', letterSpacing: 2 }}>
        {value}
      </Typography>
    </Box>
  );
};
export default AppBarcode;
