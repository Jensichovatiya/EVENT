import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AppLoaderProps {
  message?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ message = 'Loading, please wait...' }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
      <CircularProgress size={48} thickness={4} style={{ color: '#3b82f6' }} />
      {message && (
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 16, fontWeight: 500 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};
export default AppLoader;
