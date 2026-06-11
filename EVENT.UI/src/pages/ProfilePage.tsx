import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, Grid } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'Guest';
  const mobileNo = localStorage.getItem('mobileNo') || '';

  const { register, handleSubmit } = useForm({
    defaultValues: {
      userName,
      mobileNo,
      email: 'user@tracket.com',
    }
  });

  const onSubmit = (data: any) => {
    localStorage.setItem('userName', data.userName);
    localStorage.setItem('mobileNo', data.mobileNo);
    toast.success('Profile updated successfully!');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Account Profile</Typography>
        <Typography variant="body2" color="textSecondary">Manage your account profile details and verification contacts.</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card style={{ borderRadius: 12, width: '100%', padding: 24, textAlign: 'center' }}>
            <Avatar style={{ width: 100, height: 100, margin: '0 auto 16px', backgroundColor: '#3b82f6', fontSize: '2.5rem' }}>
              {userName[0].toUpperCase()}
            </Avatar>
            <Typography variant="h6" style={{ fontWeight: 700 }}>{userName}</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>{userRole}</Typography>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 66.67%' } }}>
          <Card style={{ borderRadius: 12 }}>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <AppInput label="Full Name" register={register('userName')} />
                  <AppInput label="Email Address" register={register('email')} disabled />
                  <AppInput label="Mobile Number" register={register('mobileNo')} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <AppButton type="submit">Update Profile</AppButton>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ProfilePage;
