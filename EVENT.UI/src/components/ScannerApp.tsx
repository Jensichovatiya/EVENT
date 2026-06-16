/// <reference path="../types.d.ts" />
import React, { useState } from 'react';

interface ScannerAppProps {
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function ScannerApp({ setToast }: ScannerAppProps) {
  const [scanCode, setScanCode] = useState('');
  const [result, setResult] = useState<{ status: 'success' | 'error'; message: string; name?: string; seat?: string } | null>(null);
  const [history, setHistory] = useState([
    { ticket: 'EV-857392', time: '12:30 PM', name: 'John Doe', status: 'Success' },
    { ticket: 'EV-492813', time: '12:34 PM', name: 'Unknown', status: 'Invalid' }
  ]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;

    // Simulate validation check
    const code = scanCode.toUpperCase();
    if (code.startsWith('EV-') && code.length === 9) {
      const isDuplicated = history.some(h => h.ticket === code && h.status === 'Success');
      if (isDuplicated) {
        setResult({
          status: 'error',
          message: 'Ticket already scanned! Ticket is invalid for second entry.'
        });
        setHistory([{ ticket: code, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), name: 'Duplicate Gate Entry', status: 'Duplicate' }, ...history]);
      } else {
        setResult({
          status: 'success',
          message: 'Entry Verified Success!',
          name: 'Jensi Patel',
          seat: 'Row A, Seat 4'
        });
        setHistory([{ ticket: code, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), name: 'Jensi Patel', status: 'Success' }, ...history]);
      }
    } else {
      setResult({
        status: 'error',
        message: 'Invalid barcode signature. Ticket not recognized.'
      });
      setHistory([{ ticket: code, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), name: 'Unknown', status: 'Invalid' }, ...history]);
    }
    setScanCode('');
  };

  const triggerMockScan = (type: 'valid' | 'duplicate' | 'invalid') => {
    if (type === 'valid') {
      const code = 'EV-' + Math.floor(100000 + Math.random() * 900000);
      setScanCode(code);
    } else if (type === 'duplicate') {
      setScanCode('EV-857392');
    } else {
      setScanCode('INVALID_CODE');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="card text-center" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '10px' }}>Security QR Scanner</h2>
        <p className="text-subtitle">Gate Entry Pass Validation</p>

        {/* Mock QR Camera View */}
        <div style={{
          position: 'relative',
          width: '240px',
          height: '240px',
          margin: '0 auto 24px auto',
          background: 'rgba(0,0,0,0.4)',
          border: '2px solid rgba(147, 51, 234, 0.4)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Scanning box outlines */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', width: '20px', height: '20px', borderTop: '4px solid #a855f7', borderLeft: '4px solid #a855f7' }}></div>
          <div style={{ position: 'absolute', top: '20px', right: '20px', width: '20px', height: '20px', borderTop: '4px solid #a855f7', borderRight: '4px solid #a855f7' }}></div>
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '20px', height: '20px', borderBottom: '4px solid #a855f7', borderLeft: '4px solid #a855f7' }}></div>
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '20px', height: '20px', borderBottom: '4px solid #a855f7', borderRight: '4px solid #a855f7' }}></div>
          
          {/* Laser beam line */}
          <div style={{
            position: 'absolute',
            width: '80%',
            height: '2px',
            background: '#a855f7',
            boxShadow: '0 0 10px #a855f7',
            animation: 'scanBeam 2s infinite ease-in-out',
            top: '50%'
          }}></div>

          <i className="fa-solid fa-qrcode" style={{ fontSize: '4rem', opacity: '0.15' }}></i>
        </div>

        {/* Laser animation CSS injection */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scanBeam {
            0% { top: 10%; }
            50% { top: 90%; }
            100% { top: 10%; }
          }
        `}} />

        {/* Input verification form */}
        <form onSubmit={handleScan}>
          <div className="form-group">
            <input
              type="text"
              className="form-control text-center"
              style={{ letterSpacing: '0.05em', fontWeight: 'bold' }}
              placeholder="SCAN QR OR ENTER TICKET ID"
              value={scanCode}
              onChange={e => setScanCode(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary btn-neon">Validate Ticket</button>
        </form>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
          <button className="btn-secondary" style={{ fontSize: '0.75rem', height: '28px' }} onClick={() => triggerMockScan('valid')}>Load Valid Code</button>
          <button className="btn-secondary" style={{ fontSize: '0.75rem', height: '28px' }} onClick={() => triggerMockScan('duplicate')}>Load Duplicate Code</button>
          <button className="btn-secondary" style={{ fontSize: '0.75rem', height: '28px' }} onClick={() => triggerMockScan('invalid')}>Load Invalid Code</button>
        </div>
      </div>

      {/* Result Popups */}
      {result && (
        <div className="modal-overlay" onClick={() => setResult(null)}>
          <div className="modal-content" style={{ maxWidth: '340px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <i className={result.status === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'} style={{
                fontSize: '4rem',
                color: result.status === 'success' ? '#10b981' : '#ef4444',
                marginBottom: '16px'
              }}></i>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '8px' }}>
                {result.status === 'success' ? 'Access Approved' : 'Access Denied'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{result.message}</p>
              
              {result.status === 'success' && (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'left', fontSize: '0.8rem', marginBottom: '20px' }}>
                  <p><span style={{ color: 'var(--text-muted)' }}>Holder:</span> {result.name}</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>Seat:</span> {result.seat}</p>
                </div>
              )}
              
              <button className="btn-primary" onClick={() => setResult(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Scan History Log */}
      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Scan History Logs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((h, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', fontSize: '0.8rem' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{h.ticket}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.name} • {h.time}</p>
              </div>
              <span style={{
                fontWeight: 'bold',
                color: h.status === 'Success' ? '#10b981' : '#ef4444'
              }}>{h.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
