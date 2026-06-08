/// <reference path="../types.d.ts" />
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface LoginProps {
  onNavigate: (page: string) => void;
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
  setVerifyData: (data: { dialCode: string; mobileNo: string }) => void;
}

export default function Login({ onNavigate, setToast, setVerifyData }: LoginProps) {
  const [countries, setCountries] = useState<any[]>([]);
  const [dialCode, setDialCode] = useState('+91');
  const [mobileNo, setMobileNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadCountries() {
      try {
        const list = await apiService.getCountryList();
        setCountries(list || []);
        if (list && list.length > 0) {
          const hasDefault = list.find(c => c.dialCode === '+91');
          if (hasDefault) {
            setDialCode(hasDefault.dialCode);
          } else {
            setDialCode(list[0].dialCode);
          }
        }
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load country list.' });
      }
    }
    loadCountries();
  }, [setToast]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!mobileNo) {
      newErrors.mobileNo = 'Phone number is required.';
    } else if (!/^\d{10,15}$/.test(mobileNo.replace(/\D/g, ''))) {
      newErrors.mobileNo = 'Please enter a valid phone number (minimum 10 digits).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const rawMobile = mobileNo.replace(/\D/g, '');
    try {
      const response = await apiService.login({ dialCode, mobileNo: rawMobile });
      if (response.status) {
        setToast({ type: 'success', message: response.message || 'OTP sent successfully!' });
        setVerifyData({ dialCode, mobileNo: rawMobile });
        setTimeout(() => {
          onNavigate('verify-otp');
        }, 800);
      } else {
        setToast({ type: 'error', message: response.message || 'Mobile number is not registered.' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = countries.find(c => c.dialCode === dialCode);

  return (
    <div className="card">
      <div className="mb-11">
        <h1>Welcome Back!</h1>
        <p className="text-subtitle">
          Log in with the mobile number you entered during your registration.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="label-container">
            <label className="required">Phone Number</label>
            <a href="#help" className="help-link" onClick={(e) => { e.preventDefault(); setToast({ type: 'success', message: 'Support team notified!' }); }}>
              Help <i className="fa-solid fa-circle-question"></i>
            </a>
          </div>

          <div className="input-row">
            <div className="select-wrapper">
              {selectedCountry && selectedCountry.flag && (
                <img src={selectedCountry.flag} alt="" />
              )}
              <select
                className="form-select"
                value={dialCode}
                onChange={(e) => setDialCode(e.target.value)}
              >
                {countries.map((country, idx) => (
                  <option key={idx} value={country.dialCode}>
                    {country.dialCode}
                  </option>
                ))}
                {countries.length === 0 && <option value="+91">+91</option>}
              </select>
            </div>

            <input
              type="tel"
              className={`form-control ${errors.mobileNo ? 'is-invalid' : ''}`}
              placeholder="Enter Your Phone Number"
              value={mobileNo}
              maxLength={15}
              onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          {errors.mobileNo && <span className="error-msg">{errors.mobileNo}</span>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner"></div> Please wait...
            </>
          ) : (
            'Get OTP'
          )}
        </button>
      </form>

      <div className="footer-text">
        Don’t have an account? 
        <a href="#signup" onClick={(e) => { e.preventDefault(); onNavigate('signup'); }}>
          Sign Up
        </a>
      </div>

      <div className="footer-text" style={{ marginTop: '16px' }}>
        <a href="#subpartner" style={{ fontSize: '0.85rem' }} onClick={(e) => { e.preventDefault(); setToast({ type: 'success', message: 'Sub-partner login routing active' }); }}>
          Login As A Sub Partner
        </a>
      </div>
    </div>
  );
}
