/// <reference path="../types.d.ts" />
import React from 'react';
import OrganizerPanel from '../components/OrganizerPanel';

interface OrganizerPageProps {
  session: {
    token: string | null;
    userRole: string | null;
    userName: string | null;
    userId: string | null;
    mobileNo: string | null;
  };
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function OrganizerPage({ session, setToast }: OrganizerPageProps) {
  return (
    <div style={{ width: '100%' }}>
      <OrganizerPanel session={session} setToast={setToast} />
    </div>
  );
}
