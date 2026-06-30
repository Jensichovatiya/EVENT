import React from 'react';

interface NavbarProps {
  activeRole: 'user' | 'organizer' | 'scanner' | 'admin';
  setActiveRole: (role: 'user' | 'organizer' | 'scanner' | 'admin') => void;
  onLogout: () => void;
  userName?: string | null;
}

export default function Navbar({ activeRole, setActiveRole, onLogout, userName }: NavbarProps) {
  return (
    <div className="floating-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <i className="fa-solid fa-gem" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
        <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          EVENTX
        </span>
      </div>
      
      <div className="nav-links">
        <button className={`nav-btn ${activeRole === 'user' ? 'active' : ''}`} onClick={() => setActiveRole('user')}>
          <i className="fa-solid fa-user"></i> User Side
        </button>
        <button className={`nav-btn ${activeRole === 'organizer' ? 'active' : ''}`} onClick={() => setActiveRole('organizer')}>
          <i className="fa-solid fa-user-tie"></i> Organizer Panel
        </button>
        <button className={`nav-btn ${activeRole === 'scanner' ? 'active' : ''}`} onClick={() => setActiveRole('scanner')}>
          <i className="fa-solid fa-qrcode"></i> Scanner App
        </button>
        <button className={`nav-btn ${activeRole === 'admin' ? 'active' : ''}`} onClick={() => setActiveRole('admin')}>
          <i className="fa-solid fa-user-shield"></i> Admin Panel
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {userName && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Hi, <strong style={{ color: 'var(--text-main)' }}>{userName}</strong>
          </span>
        )}
        <button className="btn-secondary" style={{ height: '36px', padding: '0 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>
    </div>
  );
}
