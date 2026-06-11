import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '../validations/schemas';
import { authApi } from '../api/authApi';
import AppInput from '../components/AppInput';
import AppDropdown from '../components/AppDropdown';
import AppButton from '../components/AppButton';
import AuthLayout from '../layouts/AuthLayout';
import { ROUTES, ROLES } from '../constants/appConstants';
import { Box, Typography } from '@mui/material';
import { toast } from 'sonner';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await authApi.getRoles();
        if (res.success && res.data) {
          // Exclude SuperAdmin from public register options
          const filtered = res.data.filter(
            (r: any) => r.roleCode !== 'SUPER_ADMIN' && r.roleName?.toLowerCase() !== 'superadmin'
          );
          setRoles(filtered);
        }
      } catch (err) {
        console.error('Failed to load roles', err);
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        name: data.userName,
        emailId: data.email,
        mobileNo: data.mobileNo,
        dialCode: '+91',
        password: data.password,
        userRole: Number(data.roleName),
      });
      toast.success(res.message || 'Account created! Please verify OTP.');
      navigate(ROUTES.VERIFY_OTP, { state: { email: data.email, mobileNo: data.mobileNo } });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = roles.map((r: any) => ({
    label: r.roleName,
    value: String(r.roleId)
  }));

  return (
    <AuthLayout>
      <Typography variant="h6" align="center" style={{ fontWeight: 600, marginBottom: 16 }}>
        Create Account
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 2 }}>
          <AppInput
            label="Full Name"
            register={register('userName')}
            errorText={errors.userName?.message}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <AppInput
            label="Email Address"
            register={register('email')}
            errorText={errors.email?.message}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <AppInput
            label="Mobile Number (10 digits)"
            register={register('mobileNo')}
            errorText={errors.mobileNo?.message}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <AppDropdown
            label="Account Type"
            options={roleOptions}
            register={register('roleName')}
            errorText={errors.roleName?.message}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <AppInput
            label="Password"
            type="password"
            register={register('password')}
            errorText={errors.password?.message}
          />
        </Box>
        <AppButton type="submit" fullWidth loading={loading}>
          Register
        </AppButton>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <span
              style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 600 }}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Sign In
            </span>
          </Typography>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default SignUpPage;
