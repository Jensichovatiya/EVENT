import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { forgotPasswordSchema } from '../validations/schemas';
import { authApi } from '../api/authApi';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AuthLayout from '../layouts/AuthLayout';
import { ROUTES } from '../constants/appConstants';
import { Box, Typography } from '@mui/material';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(data.email);
      setSuccessMsg(res.message || 'OTP sent to your email.');
      toast.success(res.message || 'OTP sent successfully!');
      setTimeout(() => {
        navigate(ROUTES.VERIFY_OTP, { state: { email: data.email } });
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to request reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h6" align="center" style={{ fontWeight: 600, marginBottom: 16 }}>
        Forgot Password
      </Typography>
      {successMsg && (
        <Box sx={{ mb: 2, p: 1, bgcolor: '#e0f2fe', borderRadius: 1, color: '#0369a1' }}>
          <Typography variant="body2">{successMsg}</Typography>
        </Box>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 3 }}>
          <AppInput
            label="Email Address"
            register={register('email')}
            errorText={errors.email?.message}
          />
        </Box>
        <AppButton type="submit" fullWidth loading={loading}>
          Send OTP
        </AppButton>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography
            variant="body2"
            style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 600 }}
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Back to Login
          </Typography>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
