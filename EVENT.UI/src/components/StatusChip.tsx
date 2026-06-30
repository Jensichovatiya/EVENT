import React from 'react';
import { Badge } from '@/Ui/badge';

interface StatusChipProps {
  status: number | string;
  type?: 'booking' | 'payment' | 'approval' | 'publish';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, type = 'booking' }) => {
  let label = '';
  let variant: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'default' = 'default';

  const s = status.toString().toUpperCase();

  if (type === 'booking') {
    if (s === '1' || s === 'CONFIRMED' || s === 'SUCCESS') {
      label = 'Confirmed'; variant = 'success';
    } else if (s === '0' || s === 'PENDING') {
      label = 'Pending'; variant = 'warning';
    } else if (s === '4' || s === 'EXPIRED') {
      label = 'Expired'; variant = 'secondary';
    } else {
      label = 'Cancelled'; variant = 'destructive';
    }
  } else if (type === 'payment') {
    if (s === '1' || s === 'PAID') {
      label = 'Paid'; variant = 'success';
    } else if (s === '0' || s === 'UNPAID') {
      label = 'Unpaid'; variant = 'warning';
    } else {
      label = 'Refunded'; variant = 'info';
    }
  } else if (type === 'approval') {
    if (s === '1' || s === 'APPROVED') {
      label = 'Approved'; variant = 'success';
    } else if (s === '0' || s === 'PENDING') {
      label = 'Pending'; variant = 'warning';
    } else {
      label = 'Rejected'; variant = 'destructive';
    }
  } else if (type === 'publish') {
    if (s === 'TRUE' || s === '1' || s === 'PUBLISHED') {
      label = 'Published'; variant = 'success';
    } else {
      label = 'Draft'; variant = 'secondary';
    }
  }

  return (
    <Badge variant={variant} size="sm" className="font-semibold">
      {label}
    </Badge>
  );
};

export default StatusChip;
