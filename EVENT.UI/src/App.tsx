/// <reference path="./types.d.ts" />
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import DashboardPage from './pages/DashboardPage';

interface SessionState {
  token: string | null;
  userRole: string | null;
  userName: string | null;
  userId: string | null;
  mobileNo: string | null;
}

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

export default function App() {
  const [page, setPage] = useState<string>('login');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [verifyData, setVerifyData] = useState<{ dialCode: string; mobileNo: string } | null>({ dialCode: '+91', mobileNo: '' });
  
  const [session, setSession] = useState<SessionState>({
    token: localStorage.getItem('authToken'),
    userRole: localStorage.getItem('userRole'),
    userName: localStorage.getItem('userName'),
    userId: localStorage.getItem('userId'),
    mobileNo: localStorage.getItem('mobileNo'),
  });

  useEffect(() => {
    if (session.token) {
      setPage('home');
    }
  }, [session.token]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('mobileNo');
    setSession({
      token: null,
      userRole: null,
      userName: null,
      userId: null,
      mobileNo: null,
    });
    setToast({ type: 'success', message: 'Logged out successfully.' });
    setPage('login');
  };

  const handleNavigate = (targetPage: string) => {
    if (targetPage === 'home') {
      setSession({
        token: localStorage.getItem('authToken'),
        userRole: localStorage.getItem('userRole'),
        userName: localStorage.getItem('userName'),
        userId: localStorage.getItem('userId'),
        mobileNo: localStorage.getItem('mobileNo'),
      });
    }
    setPage(targetPage);
  };

  return (
    <div className="app-container">
      {page === 'login' && (
        <LoginPage
          onNavigate={handleNavigate}
          setToast={setToast}
          setVerifyData={setVerifyData}
        />
      )}

      {page === 'signup' && (
        <SignUpPage
          onNavigate={handleNavigate}
          setToast={setToast}
          setVerifyData={setVerifyData}
        />
      )}

      {page === 'verify-otp' && (
        <VerifyOtpPage
          onNavigate={handleNavigate}
          setToast={setToast}
          verifyData={verifyData}
        />
      )}

      {page === 'home' && (
        <DashboardPage
          session={session}
          onLogout={handleLogout}
          setToast={setToast}
        />
      )}

      {/* Global Toast Alerts */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <i className={toast.type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'} style={{ color: toast.type === 'error' ? '#ef4444' : '#10b981', fontSize: '1.1rem' }}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
