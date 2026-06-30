import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/Ui/dialog';
import { cn } from '@/lib/utils';

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
  // Map maxWidth to Tailwind max-w classes
  let maxWidthClass = 'max-w-lg'; // sm equivalent
  if (maxWidth === 'xs') maxWidthClass = 'max-w-xs';
  else if (maxWidth === 'md') maxWidthClass = 'max-w-2xl';
  else if (maxWidth === 'lg') maxWidthClass = 'max-w-4xl';
  else if (maxWidth === 'xl') maxWidthClass = 'max-w-6xl';

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className={cn('w-[95vw] sm:rounded-xl overflow-hidden p-0 gap-0 border border-border bg-background', maxWidthClass)}>
        <DialogHeader className="border-b border-border p-4 px-6 flex flex-row items-center justify-between">
          <DialogTitle className="font-semibold text-lg text-foreground mt-0">{title}</DialogTitle>
        </DialogHeader>
        <div className="p-6 max-h-[70vh] overflow-y-auto border-b border-border">
          {children}
        </div>
        {actions && (
          <DialogFooter className="p-4 px-6 bg-muted/30 flex flex-row justify-end space-x-2">
            {actions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppModal;
