import React from 'react';
import { Button, ButtonProps } from '@/Ui/button';

interface AppButtonProps extends Omit<ButtonProps, 'color'> {
  variant?: any;
  color?: any;
  fullWidth?: boolean;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(({
  children,
  loading = false,
  disabled,
  variant = 'contained',
  color = 'primary',
  fullWidth,
  className,
  ...props
}, ref) => {
  // Translate MUI variants/colors to Tailwind variants
  let mappedVariant: any = 'default';
  if (variant === 'outlined') mappedVariant = 'outline';
  else if (variant === 'text') mappedVariant = 'ghost';
  
  if (color === 'error') mappedVariant = 'destructive';
  else if (color === 'success') mappedVariant = 'success';
  else if (color === 'secondary') mappedVariant = 'secondary';

  return (
    <Button
      ref={ref}
      variant={mappedVariant}
      loading={loading}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
});

export default AppButton;
