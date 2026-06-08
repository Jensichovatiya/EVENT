/// <reference path="../types.d.ts" />
import React, { useState } from 'react';

interface AdminPanelProps {
  session: {
    token: string | null;
    userRole: string | null;
    userName: string | null;
    userId: string | null;
    mobileNo: string | null;
  };
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function AdminPanel({ session, setToast }: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'approvals' | 'refunds' | 'settings'>('dashboard');

  // Users data mock
  const [users, setUsers] = useState([
    { id: 1, name: 'Jensi Patel', role: 'EventOrganizer', mobile: '6354211192', status: 'Active' },
    { id: 2, name: 'John Doe', role: 'User', mobile: '9375784248', status: 'Active' },
    { id: 3, name: 'Spam Account', role: 'User', mobile: '5551234567', status: 'Banned' }
  ]);

  // Pending event approvals mock
  const [approvals, setApprovals] = useState([
    { id: 101, name: 'Sunburn Music Festival 2026', organizer: 'Cassowary Events', city: 'Goa', date: 'Dec 28, 2026' },
    { id: 102, name: 'National Tech Summit', organizer: 'TechHub', city: 'Ahmedabad', date: 'Nov 12, 2026' }
  ]);

  // Refund requests mock
  const [refunds, setRefunds] = useState([
    { id: 301, ticket: 'EV-857392', user: 'John Doe', amount: '₹1,500', reason: 'Event cancelled by organizer', status: 'Pending' }
  ]);

  const handleUserStatus = (userId: number, action: 'ban' | 'activate') => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: action === 'ban' ? 'Banned' : 'Active' } : u));
    setToast({ type: 'success', message: `User status changed to ${action === 'ban' ? 'Banned' : 'Active'}` });
  };

  const handleApproveEvent = (eventId: number, approved: boolean) => {
    setApprovals(approvals.filter(a => a.id !== eventId));
    setToast({
      type: approved ? 'success' : 'error',
      message: approved ? 'Event successfully approved and published!' : 'Event registration request rejected.'
    });
  };

  const handleRefundAction = (refundId: number, approved: boolean) => {
    setRefunds(refunds.map(r => r.id === refundId ? { ...r, status: approved ? 'Refunded' : 'Rejected' } : r));
    setToast({ type: 'success', message: approved ? 'Refund request approved!' : 'Refund request declined.' });
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <button className={`sidebar-btn ${adminTab === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminTab('dashboard')}>
          <i className="fa-solid fa-solar-panel"></i> Overview
        </button>
        <button className={`sidebar-btn ${adminTab === 'users' ? 'active' : ''}`} onClick={() => setAdminTab('users')}>
          <i className="fa-solid fa-users"></i> Users Control
        </button>
        <button className={`sidebar-btn ${adminTab === 'approvals' ? 'active' : ''}`} onClick={() => setAdminTab('approvals')}>
          <i className="fa-solid fa-shield-check"></i> Event Approvals ({approvals.length})
        </button>
        <button className={`sidebar-btn ${adminTab === 'refunds' ? 'active' : ''}`} onClick={() => setAdminTab('refunds')}>
          <i className="fa-solid fa-hand-holding-dollar"></i> Refund Board
        </button>
        <button className={`sidebar-btn ${adminTab === 'settings' ? 'active' : ''}`} onClick={() => setAdminTab('settings')}>
          <i className="fa-solid fa-gears"></i> Global Settings
        </button>
      </div>

      {/* Main Content Area */}
      <div className="card" style={{ flexGrow: 1 }}>
        {adminTab === 'dashboard' && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Global Overview</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Platform Users</p>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: '4px 0' }}>1,845</h3>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Active Events</p>
                <h3 style={{ fontSize: '1.8rem', color: '#3b82f6', margin: '4px 0' }}>42 Events</h3>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Overall Revenue</p>
                <h3 style={{ fontSize: '1.8rem', color: '#10b981', margin: '4px 0' }}>₹12,49,200</h3>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>System Logs</h3>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                <span>[INFO] WebAPI Connection Pool Healthy</span>
                <span style={{ color: 'var(--accent-color)' }}>Online</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                <span>[SMS] Gate Verify alert dispatched to +91 635***</span>
                <span style={{ color: 'var(--text-muted)' }}>1 min ago</span>
              </div>
            </div>
          </div>
        )}

        {adminTab === 'users' && (
          <div>
            <h2 style={{ marginBottom: '16px' }}>Platform Users</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '12px 8px' }}>Name</th>
                  <th style={{ padding: '12px 8px' }}>Role</th>
                  <th style={{ padding: '12px 8px' }}>Mobile</th>
                  <th style={{ padding: '12px 8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '16px 8px', fontWeight: 'bold' }}>{u.name}</td>
                    <td style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>{u.role}</td>
                    <td style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>{u.mobile}</td>
                    <td style={{ padding: '16px 8px' }}>
                      {u.status === 'Active' ? (
                        <button className="btn-neon" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', background: '#ef4444', boxShadow: 'none' }} onClick={() => handleUserStatus(u.id, 'ban')}>Ban User</button>
                      ) : (
                        <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', width: 'auto', background: '#10b981', boxShadow: 'none' }} onClick={() => handleUserStatus(u.id, 'activate')}>Unban User</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {adminTab === 'approvals' && (
          <div>
            <h2 style={{ marginBottom: '16px' }}>Event Verification Request Panel</h2>
            <p className="text-subtitle">Verify details, category mappings, and locations before publishing events live.</p>

            {approvals.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No pending event approvals.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {approvals.map(a => (
                  <div key={a.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '4px' }}>{a.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Organizer: {a.organizer} • Date: {a.date} • Venue: {a.city}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-primary" style={{ width: 'auto', padding: '0 16px', height: '34px', fontSize: '0.8rem', backgroundColor: '#10b981', boxShadow: 'none' }} onClick={() => handleApproveEvent(a.id, true)}>Approve</button>
                      <button className="btn-secondary" style={{ height: '34px', fontSize: '0.8rem', border: '1px solid #ef4444', color: '#ef4444' }} onClick={() => handleApproveEvent(a.id, false)}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {adminTab === 'refunds' && (
          <div>
            <h2 style={{ marginBottom: '16px' }}>Refund Claims</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '12px 8px' }}>Ticket</th>
                  <th style={{ padding: '12px 8px' }}>User</th>
                  <th style={{ padding: '12px 8px' }}>Amount</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '16px 8px', fontWeight: 'bold' }}>{r.ticket}</td>
                    <td style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>{r.user}</td>
                    <td style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>{r.amount}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        backgroundColor: r.status === 'Pending' ? 'rgba(239, 110, 26, 0.15)' : r.status === 'Refunded' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: r.status === 'Pending' ? '#EF7F1A' : r.status === 'Refunded' ? '#10b981' : '#ef4444'
                      }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      {r.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-primary" style={{ width: 'auto', padding: '0 10px', height: '28px', fontSize: '0.75rem', background: '#10b981', boxShadow: 'none' }} onClick={() => handleRefundAction(r.id, true)}>Approve</button>
                          <button className="btn-secondary" style={{ height: '28px', padding: '0 10px', fontSize: '0.75rem' }} onClick={() => handleRefundAction(r.id, false)}>Decline</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {adminTab === 'settings' && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>System Setup</h2>
            <div className="form-group">
              <label>SMS Gateway Config</label>
              <input type="text" className="form-control" defaultValue="http://api.sms-gateway.com/send" />
            </div>
            <div className="form-group">
              <label>Payment Mode Toggles</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked /> RazorPay Payments
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked /> Apple Pay
                </label>
              </div>
            </div>
            <button className="btn-primary btn-neon" style={{ marginTop: '16px' }} onClick={() => setToast({ type: 'success', message: 'System configurations updated!' })}>
              Save Configuration Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
