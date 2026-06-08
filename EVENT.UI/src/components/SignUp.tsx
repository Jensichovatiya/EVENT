/// <reference path="../types.d.ts" />
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import TermsModal from './TermsModal';

interface SignUpProps {
  onNavigate: (page: string) => void;
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
  setVerifyData: (data: { dialCode: string; mobileNo: string }) => void;
}

export default function SignUp({ onNavigate, setToast, setVerifyData }: SignUpProps) {
  const [countries, setCountries] = useState<any[]>([]);
  const [fullname, setFullname] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [mobileNo, setMobileNo] = useState('');
  const [referCode, setReferCode] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (!fullname.trim()) {
      newErrors.fullname = 'Name is required.';
    }
    if (!mobileNo) {
      newErrors.mobileNo = 'Phone number is required.';
    } else if (!/^\d{10,15}$/.test(mobileNo.replace(/\D/g, ''))) {
      newErrors.mobileNo = 'Please enter a valid phone number (minimum 10 digits).';
    }
    if (!isAgreed) {
      newErrors.isAgreed = 'You must agree to the Terms & Conditions.';
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
      const response = await apiService.register({
        fullname,
        mobileNo: rawMobile,
        dialCode,
        refferedByRefferalCode: referCode,
        isAgreedToTerms: isAgreed
      });

      if (response.status) {
        setToast({ type: 'success', message: response.message || 'Registration successful! Verification OTP sent.' });
        setVerifyData({ dialCode, mobileNo: rawMobile });
        setTimeout(() => {
          onNavigate('verify-otp');
        }, 800);
      } else {
        setToast({ type: 'error', message: response.message || 'Registration failed.' });
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
        <h1>Sign Up</h1>
        <p className="text-subtitle">
          Get registered and start with your personal account.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="required">Your Name</label>
          <input
            type="text"
            className={`form-control ${errors.fullname ? 'is-invalid' : ''}`}
            placeholder="Please Enter name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
          {errors.fullname && <span className="error-msg">{errors.fullname}</span>}
        </div>

        <div className="form-group">
          <label className="required">Phone Number</label>
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

        <div className="form-group">
          <div className="label-container">
            <label>Refer Code <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span></label>
            <i className="fa-solid fa-circle-info" style={{ color: '#EF7F1A', cursor: 'pointer' }} title="Register with referral code to earn F-coins"></i>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Please Enter code"
            value={referCode}
            onChange={(e) => setReferCode(e.target.value)}
          />
        </div>

        <div className="checkbox-container" onClick={() => setIsAgreed(!isAgreed)}>
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="checkbox-label">
            By continuing, I agree to the{' '}
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              Terms & Conditions. *
            </a>
          </span>
        </div>
        {errors.isAgreed && <span className="error-msg" style={{ display: 'block', marginTop: '-20px', marginBottom: '20px' }}>{errors.isAgreed}</span>}

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
        Already have an account?{' '}
        <a href="#login" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>
          Sign in
        </a>
      </div>

      <TermsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={() => {
          setIsAgreed(true);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
