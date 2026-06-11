import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const AppModal: React.FC<AppModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      slotProps={{
        paper: {
          style: {
            borderRadius: 12,
            padding: 8,
          },
        },
      }}
    >
      <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <Typography variant="h6" style={{ fontWeight: 600 }}>{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#9ca3af',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions style={{ padding: 16 }}>{actions}</DialogActions>}
    </Dialog>
  );
};
export default AppModal;
