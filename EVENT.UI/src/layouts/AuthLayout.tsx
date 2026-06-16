import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 450,
          borderRadius: 4,
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            TRACKET EMS
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Event Management System
          </Typography>
        </Box>
        {children}
      </Paper>
    </Box>
  );
};

export default AuthLayout;
