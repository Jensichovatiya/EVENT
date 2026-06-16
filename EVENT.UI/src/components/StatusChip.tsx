import React from 'react';
import { Chip } from '@mui/material';

interface StatusChipProps {
  status: number | string;
  type?: 'booking' | 'payment' | 'approval' | 'publish';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, type = 'booking' }) => {
  let label = '';
  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

  const s = status.toString().toUpperCase();

  if (type === 'booking') {
    if (s === '1' || s === 'CONFIRMED' || s === 'SUCCESS') {
      label = 'Confirmed';
      color = 'success';
    } else if (s === '0' || s === 'PENDING') {
      label = 'Pending';
      color = 'warning';
    } else {
      label = 'Cancelled';
      color = 'error';
    }
  } else if (type === 'payment') {
    if (s === '1' || s === 'PAID') {
      label = 'Paid';
      color = 'success';
    } else if (s === '0' || s === 'UNPAID') {
      label = 'Unpaid';
      color = 'warning';
    } else {
      label = 'Refunded';
      color = 'info';
    }
  } else if (type === 'approval') {
    if (s === '1' || s === 'APPROVED') {
      label = 'Approved';
      color = 'success';
    } else if (s === '0' || s === 'PENDING') {
      label = 'Pending';
      color = 'warning';
    } else {
      label = 'Rejected';
      color = 'error';
    }
  } else if (type === 'publish') {
    if (s === 'TRUE' || s === '1' || s === 'PUBLISHED') {
      label = 'Published';
      color = 'success';
    } else {
      label = 'Draft';
      color = 'default';
    }
  }

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      style={{ fontWeight: 600, borderRadius: 6 }}
    />
  );
};
export default StatusChip;
