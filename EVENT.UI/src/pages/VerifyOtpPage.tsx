/// <reference path="../types.d.ts" />
import React from 'react';
import VerifyOtp from '../components/VerifyOtp';

interface VerifyOtpPageProps {
  onNavigate: (page: string) => void;
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
  verifyData: { dialCode: string; mobileNo: string } | null;
}

export default function VerifyOtpPage({ onNavigate, setToast, verifyData }: VerifyOtpPageProps) {
  return (
    <div style={{ maxWidth: '500px', width: '100%', margin: '40px auto' }}>
      <VerifyOtp
        onNavigate={onNavigate}
        setToast={setToast}
        verifyData={verifyData}
      />
    </div>
  );
}
