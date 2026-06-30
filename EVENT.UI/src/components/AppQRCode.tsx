import React from 'react';
import { Box, Typography } from '@mui/material';

interface AppQRCodeProps {
  value: string;
  size?: number;
}

export const AppQRCode: React.FC<AppQRCodeProps> = ({ value, size = 128 }) => {
  // SVG representation of a QR code
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 29 29"
        shapeRendering="crispEdges"
        style={{ border: '4px solid white', background: 'white', borderRadius: 8 }}
      >
        <path fill="#000000" d="M0 0h7v7H0zm1 1h5v5H1zm1 1h3v3H2zm19-2h7v7h-7zm1 1h5v5h-5zm1 1h3v3h-3zM0 22h7v7H0zm1 1h5v5H1zm1 1h3v3H2zm10-14h1v1h-1zm1 1h1v1h-1zm2 1h1v1h-1zm-4 2h2v1h-2zm3 1h1v2h-1zm-1 3h2v1h-2zm-2 2h3v1h-3zm4 0h1v1h-1zm-6-8h1v1h-1zm5-3h1v1h-1zm-2 1h1v1h-1zm3 2h1v1h-1zm-5 4h1v1h-1zm1 2h1v1h-1zm-4-3h1v1h-1zm6 3h1v1h-1zm-4 4h1v1h-1z" />
      </svg>
      <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, fontFamily: 'monospace' }}>
        {value}
      </Typography>
    </Box>
  );
};
export default AppQRCode;
