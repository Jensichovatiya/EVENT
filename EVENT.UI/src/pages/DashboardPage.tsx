/// <reference path="../types.d.ts" />
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserPage from './UserPage';
import OrganizerPage from './OrganizerPage';
import ScannerPage from './ScannerPage';
import AdminPage from './AdminPage';

interface DashboardPageProps {
  session: {
    token: string | null;
    userRole: string | null;
    userName: string | null;
    userId: string | null;
    mobileNo: string | null;
  };
  onLogout: () => void;
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

type RoleTab = 'user' | 'organizer' | 'scanner' | 'admin';

export default function DashboardPage({ session, onLogout, setToast }: DashboardPageProps) {
  const [activeRole, setActiveRole] = useState<RoleTab>('user');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 32px)', width: '100%' }}>
      {/* Floating Luxury Common Navbar Selector */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onLogout={onLogout}
        userName={session.userName}
      />

      {/* Render Active Page Dashboard */}
      <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {activeRole === 'user' && (
          <UserPage session={session} setToast={setToast} />
        )}

        {activeRole === 'organizer' && (
          <OrganizerPage session={session} setToast={setToast} />
        )}

        {activeRole === 'scanner' && (
          <ScannerPage setToast={setToast} />
        )}

        {activeRole === 'admin' && (
          <AdminPage session={session} setToast={setToast} />
        )}
      </main>

      {/* Common Footer */}
      <Footer />
    </div>
  );
}
