import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/Ui/alert-dialog';

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
    <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
      <AlertDialogContent className="max-w-md rounded-xl p-6 border border-border bg-background shadow-lg">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-lg font-semibold text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-2">
          <AlertDialogCancel onClick={onClose} className="rounded-lg h-9">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="rounded-lg h-9 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export default ConfirmDialog;
