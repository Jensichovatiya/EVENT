/// <reference path="../types.d.ts" />
import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';

interface VerifyOtpProps {
  onNavigate: (page: string) => void;
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
  verifyData: { dialCode: string; mobileNo: string } | null;
}

export default function VerifyOtp({ onNavigate, setToast, verifyData }: VerifyOtpProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { dialCode = '+91', mobileNo = '6353446278' } = verifyData || {};

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    const cleanValue = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtp(newOtp);

    if (cleanValue && index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      const focusIndex = Math.min(pastedData.length, 5);
      if (inputsRef.current[focusIndex]) {
        inputsRef.current[focusIndex]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setToast({ type: 'error', message: 'Please enter a 6-digit OTP code.' });
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyOtp({
        otp: otpString,
        mobileNo,
        dialCode,
        deviceId: 'WEB_BROWSER',
        fcmToken: ''
      });

      if (response.status || response.token) {
        setToast({ type: 'success', message: response.message || 'OTP Verified! Redirecting...' });
        
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.userRole || 'EventOrganizer');
        localStorage.setItem('userId', response.userId || '');
        localStorage.setItem('mobileNo', response.mobileNo || mobileNo);
        localStorage.setItem('userName', response.name || response.userName || 'Organizer');
        localStorage.setItem('email', response.email || response.emailId || '');

        setTimeout(() => {
          onNavigate('dashboard');
        }, 1200);
      } else {
        setToast({ type: 'error', message: response.message || 'The entered OTP is invalid.' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to verify OTP.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = (e: React.MouseEvent) => {
    e.preventDefault();
    setToast({ type: 'success', message: 'Verification OTP sent again.' });
  };

  return (
    <div className="card">
      <div className="mb-10">
        <h1 className="mb-3">Enter OTP</h1>
        <p className="text-subtitle">
          Enter the 6-digit code sent to your mobile number.
          <br />
          <span style={{ color: '#EF7F1A', fontWeight: 'bold' }}>{dialCode} {mobileNo}</span>{' '}
          <a
            href="#change"
            style={{ color: '#264484', textDecoration: 'underline', marginLeft: '6px' }}
            onClick={(e) => { e.preventDefault(); onNavigate('login'); }}
          >
            Change
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label style={{ marginBottom: '16px', fontWeight: 'bold' }}>Enter OTP Number</label>
          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                className="otp-box"
                value={digit}
                ref={(el) => (inputsRef.current[idx] = el)}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
          <button type="submit" className="btn-primary" style={{ width: '60%' }} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div> Please wait...
              </>
            ) : (
              'Verify & Process'
            )}
          </button>
          
          <a href="#resend" style={{ color: '#264484', fontWeight: '600', textDecoration: 'none' }} onClick={handleResend}>
            Resend OTP
          </a>
        </div>
      </form>
    </div>
  );
}
