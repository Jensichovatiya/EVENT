import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Avatar, AvatarFallback } from '@/Ui/avatar';
import { Card, CardContent } from '@/Ui/card';
import { Badge } from '@/Ui/badge';
import DashboardLayout from '../layouts/DashboardLayout';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'Guest';
  const mobileNo = localStorage.getItem('mobileNo') || '';
  const email = localStorage.getItem('email') || 'user@tracket.com';

  const { register, handleSubmit } = useForm({
    defaultValues: { userName, mobileNo, email }
  });

  const onSubmit = (data: any) => {
    localStorage.setItem('userName', data.userName);
    localStorage.setItem('mobileNo', data.mobileNo);
    toast.success('Profile updated successfully!');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Account Profile</Typography>
        <Typography variant="body2" color="textSecondary">Manage your account profile details and verification contacts.</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

        {/* Left — Avatar card */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
          <Card className="p-6 text-center flex flex-col items-center gap-3">
            <Avatar size="xl" className="mx-auto" style={{ background: '#3b82f6' }}>
              <AvatarFallback style={{ background: '#3b82f6', color: '#fff', fontSize: '2rem', fontWeight: 700 }}>
                {userName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Typography variant="h6" style={{ fontWeight: 700 }}>{userName}</Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
                {email}
              </Typography>
              <div style={{ marginTop: 8 }}>
                <Badge variant="info" size="sm">{userRole}</Badge>
              </div>
            </div>
          </Card>
        </Box>

        {/* Right — Edit form card */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 66.67%' } }}>
          <Card>
            <CardContent className="p-6">
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
