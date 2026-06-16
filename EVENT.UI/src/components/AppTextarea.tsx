import React from 'react';
import { AppInput } from './AppInput';
import { TextFieldProps } from '@mui/material';
import { UseFormRegisterReturn } from 'react-hook-form';

type AppTextareaProps = TextFieldProps & {
  register?: UseFormRegisterReturn;
  errorText?: string;
};

export const AppTextarea: React.FC<AppTextareaProps> = (props) => {
  return (
    <AppInput
      multiline
      rows={4}
      {...props}
    />
  );
};
export default AppTextarea;
