import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { UseFormRegisterReturn } from 'react-hook-form';

type AppInputProps = TextFieldProps & {
  register?: UseFormRegisterReturn;
  errorText?: string;
  inputProps?: any;
  slotProps?: any;
};

export const AppInput: React.FC<AppInputProps> = ({
  register,
  errorText,
  variant = 'outlined',
  fullWidth = true,
  ...props
}) => {
  return (
    <TextField
      variant={variant}
      fullWidth={fullWidth}
      error={!!errorText}
      helperText={errorText}
      {...register}
      {...props}
      slotProps={{
        input: {
          style: {
            borderRadius: 8,
          },
        },
      }}
      {...props}
    />
  );
};
export default AppInput;
