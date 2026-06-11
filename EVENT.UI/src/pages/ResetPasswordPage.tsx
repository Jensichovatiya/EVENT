import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordSchema } from '../validations/schemas';
import { authApi } from '../api/authApi';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AuthLayout from '../layouts/AuthLayout';
import { ROUTES } from '../constants/appConstants';
import { Box, Typography } from '@mui/material';
import { toast } from 'sonner';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || '';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        otp: data.otp,
        newPassword: data.password,
      });
      toast.success('Password reset successfully. Please log in.');
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      toast.error(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h6" align="center" style={{ fontWeight: 600, marginBottom: 16 }}>
        Reset Password
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 2 }}>
          <AppInput
            label="Verification OTP"
            register={register('otp')}
            errorText={errors.otp?.message}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <AppInput
            label="New Password"
            type="password"
            register={register('password')}
            errorText={errors.password?.message}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <AppInput
            label="Confirm New Password"
            type="password"
            register={register('confirmPassword')}
            errorText={errors.confirmPassword?.message}
          />
        </Box>
        <AppButton type="submit" fullWidth loading={loading}>
          Reset Password
        </AppButton>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
