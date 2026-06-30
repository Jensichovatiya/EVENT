import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { Checkbox } from '@/Ui/checkbox';

type AppCheckboxProps = {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  register?: UseFormRegisterReturn;
  errorText?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
};

export const AppCheckbox: React.FC<AppCheckboxProps> = ({
  label,
  checked,
  onCheckedChange,
  register,
  errorText,
  className,
  disabled,
  id,
  name,
}) => {
  const [internalChecked, setInternalChecked] = React.useState<boolean>(checked ?? false);

  const handleCheckedChange = (val: boolean) => {
    setInternalChecked(val);

    if (onCheckedChange) {
      onCheckedChange(val);
    }

    if (register?.onChange) {
      register.onChange({ target: { name: register.name, value: val } });
    }
  };

  const reactId = React.useId();
  const resolvedId = id || register?.name || name || reactId;
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Checkbox
          id={resolvedId}
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          className={className}
        />
        {label && (
          <label
            htmlFor={resolvedId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none text-foreground"
          >
            {label}
          </label>
        )}
      </div>

      {register && (
        <input
          type="hidden"
          name={register.name}
          ref={register.ref}
          value={isChecked ? 'true' : 'false'}
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

export default AppCheckbox;
