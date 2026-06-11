import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectProps } from '@mui/material';
import { UseFormRegisterReturn } from 'react-hook-form';

type AppDropdownProps = SelectProps & {
  label: string;
  options: { label: string; value: string | number }[];
  register?: UseFormRegisterReturn;
  errorText?: string;
  fullWidth?: boolean;
};

export const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  options,
  register,
  errorText,
  fullWidth = true,
  ...props
}) => {
  return (
    <FormControl fullWidth={fullWidth} error={!!errorText} variant="outlined">
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        {...register}
        {...props}
        style={{ borderRadius: 8 }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {errorText && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
};
export default AppDropdown;
