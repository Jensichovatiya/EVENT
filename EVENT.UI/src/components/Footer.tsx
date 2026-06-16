import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      padding: '40px 20px 20px 20px',
      borderTop: '1px solid rgba(147, 51, 234, 0.15)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1200px',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-gem" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
            <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EVENTX
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Next-generation event management ecosystem.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#privacy" className="help-link" style={{ fontSize: '0.85rem' }}>Privacy Policy</a>
          <a href="#terms" className="help-link" style={{ fontSize: '0.85rem' }}>Terms of Service</a>
          <a href="#support" className="help-link" style={{ fontSize: '0.85rem' }}>Help Center</a>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <i className="fa-brands fa-x-twitter"></i>
          </a>
          <a href="#" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transition: 'var(--transition-smooth)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <i className="fa-brands fa-github"></i>
          </a>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>
        &copy; {new Date().getFullYear()} EVENTX. All rights reserved. Designed with luxury aesthetics.
      </div>
    </footer>
  );
}
