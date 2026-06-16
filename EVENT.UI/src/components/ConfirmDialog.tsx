import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { borderRadius: 12 } }}>
      <DialogTitle style={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="textSecondary">{message}</Typography>
      </DialogContent>
      <DialogActions style={{ padding: 16 }}>
        <Button onClick={onClose} style={{ textTransform: 'none', fontWeight: 600 }}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmDialog;
