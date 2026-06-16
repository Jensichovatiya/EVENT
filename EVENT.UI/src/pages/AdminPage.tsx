/// <reference path="../types.d.ts" />
import React from 'react';
import AdminPanel from '../components/AdminPanel';

interface AdminPageProps {
  session: {
    token: string | null;
    userRole: string | null;
    userName: string | null;
    userId: string | null;
    mobileNo: string | null;
  };
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function AdminPage({ session, setToast }: AdminPageProps) {
  return (
    <div style={{ width: '100%' }}>
      <AdminPanel session={session} setToast={setToast} />
    </div>
  );
}
