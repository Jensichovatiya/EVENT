import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/Ui/radio-group';

type AppRadioGroupProps = {
  label?: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (e: any) => void;
  register?: UseFormRegisterReturn;
  errorText?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
};

export const AppRadioGroup: React.FC<AppRadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  register,
  errorText,
  className,
  disabled,
  name,
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(value ?? '');

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (val: string) => {
    setInternalValue(val);

    if (onChange) {
      onChange({ target: { name, value: val } });
    }

    if (register?.onChange) {
      register.onChange({ target: { name: register.name, value: val } });
    }
  };

  const resolvedName = register?.name || name || 'radio-group';

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-sm font-medium text-foreground">
          {label}
        </span>
      )}
      <RadioGroup
        value={internalValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        className={className}
      >
        {options.map((opt) => {
          const itemId = `${resolvedName}-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem value={opt.value} id={itemId} />
              <label
                htmlFor={itemId}
                className="text-sm font-medium leading-none cursor-pointer select-none text-foreground"
              >
                {opt.label}
              </label>
            </div>
          );
        })}
      </RadioGroup>

      {register && (
        <input
          type="hidden"
          name={register.name}
          ref={register.ref}
          value={internalValue}
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

export default AppRadioGroup;
