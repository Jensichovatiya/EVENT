/// <reference path="../types.d.ts" />
import React from 'react';
import UserApp from '../components/UserApp';

interface UserPageProps {
  session: {
    token: string | null;
    userRole: string | null;
    userName: string | null;
    userId: string | null;
    mobileNo: string | null;
  };
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function UserPage({ session, setToast }: UserPageProps) {
  return (
    <div style={{ width: '100%' }}>
      <UserApp session={session} setToast={setToast} />
    </div>
  );
}
