import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/Ui/input';
import { Textarea } from '@/Ui/textarea';

type AppInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
  register?: UseFormRegisterReturn;
  errorText?: string;
  multiline?: boolean;
  rows?: any;
  label?: string;
  slotProps?: any;
  InputProps?: any;
  inputProps?: any;
  variant?: any;
  fullWidth?: any;
  size?: any;
  margin?: any;
  helperText?: any;
  error?: any;
};

export const AppInput = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, AppInputProps>(({
  register,
  errorText,
  multiline,
  rows = 4,
  label,
  className,
  type = 'text',
  
  slotProps,
  InputProps,
  inputProps,
  variant,
  fullWidth,
  size,
  margin,
  helperText,
  error,
  ...props
}, ref) => {
  const readOnly = InputProps?.readOnly || inputProps?.readOnly;
  const step = inputProps?.step;
  const min = inputProps?.min;
  const max = inputProps?.max;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {multiline ? (
        <Textarea
          rows={Number(rows || 4)}
          className={`${errorText ? 'border-destructive focus-visible:ring-destructive' : ''} ${className || ''}`}
          ref={ref as any}
          readOnly={readOnly}
          {...(register as any)}
          {...(props as any)}
        />
      ) : (
        <Input
          type={type}
          step={step}
          min={min}
          max={max}
          className={`${errorText ? 'border-destructive focus-visible:ring-destructive' : ''} ${className || ''}`}
          ref={ref as any}
          readOnly={readOnly}
          {...register}
          {...props}
        />
      )}
      {errorText && (
        <p className="text-xs text-destructive mt-0.5">
          {errorText}
        </p>
      )}
    </div>
  );
});

export default AppInput;
