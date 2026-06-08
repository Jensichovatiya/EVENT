/// <reference path="../types.d.ts" />
import React from 'react';
import Login from '../components/Login';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
  setVerifyData: (data: { dialCode: string; mobileNo: string }) => void;
}

export default function LoginPage({ onNavigate, setToast, setVerifyData }: LoginPageProps) {
  return (
    <div style={{ maxWidth: '500px', width: '100%', margin: '40px auto' }}>
      <Login
        onNavigate={onNavigate}
        setToast={setToast}
        setVerifyData={setVerifyData}
      />
    </div>
  );
}
