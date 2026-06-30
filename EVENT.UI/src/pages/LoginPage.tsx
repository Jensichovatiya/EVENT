import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../validations/schemas';
import { authApi } from '../api/authApi';
import { loginStart, loginSuccess, loginFailure } from '../redux/authSlice';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import AuthLayout from '../layouts/AuthLayout';
import { ROUTES } from '../constants/appConstants';
import { Box, Typography } from '@mui/material';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    dispatch(loginStart());
    setLoading(true);
    try {
      const res = await authApi.login({
        userName: data.email,
        password: data.password,
      });
      if (res.success && res.data) {
        dispatch(loginSuccess({ token: res.data.token || '', user: res.data }));
        
        // Redirect if OTP verification is required or directly to dashboard
        if (res.statusCode === 201) {
          navigate(ROUTES.VERIFY_OTP, { state: { email: data.email, mobileNo: res.data.mobileNo } });
        } else {
          navigate(ROUTES.DASHBOARD);
        }
      } else {
        dispatch(loginFailure(res.message));
        toast.error(res.message);
      }
    } catch (err: any) {
      dispatch(loginFailure(err.message));
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h6" align="center" style={{ fontWeight: 600, marginBottom: 16 }}>
        Sign In
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 2 }}>
          <AppInput
            label="Email Address"
            register={register('email')}
            errorText={errors.email?.message}
          />
        </Box>
        <Box sx={{ mb: 1 }}>
          <AppInput
            label="Password"
            type="password"
            register={register('password')}
            errorText={errors.password?.message}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Typography
            variant="caption"
            style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 600 }}
            onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
          >
            Forgot Password?
          </Typography>
        </Box>
        <AppButton type="submit" fullWidth loading={loading}>
          Log In
        </AppButton>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <span
              style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 600 }}
              onClick={() => navigate(ROUTES.REGISTER)}
            >
              Sign Up
            </span>
          </Typography>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
