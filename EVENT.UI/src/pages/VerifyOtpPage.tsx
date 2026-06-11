import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/authApi';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AuthLayout from '../layouts/AuthLayout';
import { ROUTES } from '../constants/appConstants';
import { Box, Typography } from '@mui/material';

import { toast } from 'sonner';

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || '';
  const mobileNo = location.state?.mobileNo || '';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await authApi.verifyOtp({
        mobileNo,
        otp: data.otp,
      });
      toast.success('Verification successful! You can now log in.');
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      toast.error(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h6" align="center" style={{ fontWeight: 600, marginBottom: 8 }}>
        Verify OTP
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center" style={{ marginBottom: 24 }}>
        We have sent a verification code to {mobileNo || email}.
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 3 }}>
          <AppInput
            label="6-Digit OTP"
            register={register('otp', { required: 'OTP is required' })}
            errorText={errors.otp?.message as string}
          />
        </Box>
        <AppButton type="submit" fullWidth loading={loading}>
          Verify
        </AppButton>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtpPage;
