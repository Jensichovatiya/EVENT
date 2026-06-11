import React from 'react';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface NoDataFoundProps {
  message?: string;
}

export const NoDataFound: React.FC<NoDataFoundProps> = ({ message = 'No data available' }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
      <InboxIcon style={{ fontSize: 60, color: '#d1d5db', marginBottom: 16 }} />
      <Typography variant="body1" color="textSecondary" style={{ fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};
export default NoDataFound;
