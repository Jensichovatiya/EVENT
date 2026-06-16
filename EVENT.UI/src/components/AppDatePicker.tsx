import React from 'react';
import { AppInput } from './AppInput';
import { TextFieldProps } from '@mui/material';
import { UseFormRegisterReturn } from 'react-hook-form';

type AppDatePickerProps = TextFieldProps & {
  register?: UseFormRegisterReturn;
  errorText?: string;
};

export const AppDatePicker: React.FC<AppDatePickerProps> = (props) => {
  return (
    <AppInput
      type="date"
      slotProps={{ inputLabel: { shrink: true } }}
      {...props}
    />
  );
};
export default AppDatePicker;
