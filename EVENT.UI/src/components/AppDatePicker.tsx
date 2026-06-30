import React from 'react';
import { DatePicker } from '@/Ui/date-picker';
import { format } from 'date-fns';
import { UseFormRegisterReturn } from 'react-hook-form';

type AppDatePickerProps = {
  label?: string;
  value?: any;
  onChange?: (e: any) => void;
  register?: UseFormRegisterReturn;
  errorText?: string;
  name?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  slotProps?: any;
};

export const AppDatePicker: React.FC<AppDatePickerProps> = ({
  label,
  value,
  onChange,
  register,
  errorText,
  name,
  disabled,
  minDate,
  maxDate,
  slotProps,
}) => {
  // Resolve value to a Date object
  const resolvedValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    try {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    } catch {
      return undefined;
    }
  }, [value]);

  // Handle date selection
  const handleDateChange = (date: Date | undefined) => {
    const formatted = date ? format(date, 'yyyy-MM-dd') : '';
    
    // Call custom onChange handler
    if (onChange) {
      onChange({ target: { name, value: formatted } });
    }
    
    // Call react-hook-form's register onChange handler
    if (register?.onChange) {
      register.onChange({ target: { name: register.name, value: formatted } });
    }
  };

  // Build disabled dates matchers
  const disabledDates = React.useMemo(() => {
    const matchers: any[] = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  return (
    <div className="flex flex-col w-full gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <DatePicker
        value={resolvedValue}
        onValueChange={handleDateChange}
        disabled={disabled}
        placeholder={label || "Pick a date"}
        disabledDates={disabledDates}
        className={errorText ? 'border-destructive focus:ring-destructive' : ''}
      />
      {/* Hidden input to pass ref/registration to forms */}
      {register && (
        <input
          type="hidden"
          name={register.name}
          ref={register.ref}
          value={resolvedValue ? format(resolvedValue, 'yyyy-MM-dd') : ''}
        />
      )}
      {errorText && (
        <p className="text-xs text-destructive mt-0.5">
          {errorText}
        </p>
      )}
    </div>
  );
};

export default AppDatePicker;
