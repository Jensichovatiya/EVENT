import React from 'react';
import { Button, CircularProgress, ButtonProps } from '@mui/material';

interface AppButtonProps extends ButtonProps {
  loading?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  loading = false,
  disabled,
  variant = 'contained',
  color = 'primary',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      disabled={loading || disabled}
      {...props}
      style={{
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 600,
        boxShadow: variant === 'contained' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        ...props.style
      }}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
};
export default AppButton;
