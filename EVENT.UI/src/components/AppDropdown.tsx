import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Ui/select';

type AppDropdownProps = {
  label?: string;
  options: { label: string; value: string | number }[];
  value?: any;
  onChange?: (e: any) => void;
  register?: UseFormRegisterReturn;
  errorText?: string;
  fullWidth?: boolean;
  name?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
};

export const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  register,
  errorText,
  fullWidth = true,
  name,
  className,
  disabled,
  placeholder = 'Select option...',
  ...props
}) => {
  // Resolve value to string format
  const resolvedValue = React.useMemo(() => {
    if (value === undefined || value === null) return '';
    return value.toString();
  }, [value]);

  const [internalValue, setInternalValue] = React.useState(resolvedValue);

  // Intercept react-hook-form setting the value property directly on the DOM element
  const refCallback = React.useCallback((el: HTMLInputElement | null) => {
    if (register) {
      register.ref(el);
    }
    if (el) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      if (descriptor && descriptor.set) {
        Object.defineProperty(el, 'value', {
          ...descriptor,
          set(val) {
            descriptor.set!.call(this, val);
            setInternalValue(val !== undefined && val !== null ? val.toString() : '');
          }
        });
      }
      // Also capture the initial value when RHF mounts it
      if (el.value !== undefined && el.value !== null && el.value.toString() !== internalValue) {
        setInternalValue(el.value.toString());
      }
    }
  }, [register, internalValue]);

  const handleValueChange = (val: string) => {
    setInternalValue(val);
    
    // Parse value back to number if options match number types
    const matchedOption = options.find(o => o.value.toString() === val);
    const parsedVal = matchedOption ? matchedOption.value : val;

    // Call custom onChange handler
    if (onChange) {
      onChange({ target: { name, value: parsedVal } });
    }

    // Call react-hook-form's register onChange handler
    if (register?.onChange) {
      register.onChange({ target: { name: register.name, value: parsedVal } });
    }
  };

  const isControlled = value !== undefined;
  const selectValue = isControlled ? resolvedValue : internalValue;

  return (
    <div className="flex flex-col w-full gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Select
        value={selectValue}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={`${errorText ? 'border-destructive focus:ring-destructive' : ''} ${className || ''} w-full bg-background`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border border-border shadow-lg">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value.toString()} className="hover:bg-accent hover:text-accent-foreground cursor-pointer">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Hidden input to pass ref/registration to forms */}
      {register && (
        <input
          type="hidden"
          name={register.name}
          ref={refCallback}
          value={selectValue}
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

export default AppDropdown;
