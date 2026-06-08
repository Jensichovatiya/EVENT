/// <reference path="../types.d.ts" />
import React from 'react';
import SignUp from '../components/SignUp';

interface SignUpPageProps {
  onNavigate: (page: string) => void;
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
  setVerifyData: (data: { dialCode: string; mobileNo: string }) => void;
}

export default function SignUpPage({ onNavigate, setToast, setVerifyData }: SignUpPageProps) {
  return (
    <div style={{ maxWidth: '500px', width: '100%', margin: '40px auto' }}>
      <SignUp
        onNavigate={onNavigate}
        setToast={setToast}
        setVerifyData={setVerifyData}
      />
    </div>
  );
}
