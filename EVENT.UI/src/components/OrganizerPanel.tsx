/// <reference path="../types.d.ts" />
import React, { useState } from 'react';

interface OrganizerPanelProps {
  session: {
    token: string | null;
    userRole: string | null;
    userName: string | null;
    userId: string | null;
    mobileNo: string | null;
  };
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

type SubTab = 'dashboard' | 'create' | 'events' | 'scanners' | 'revenue';

export default function OrganizerPanel({ session, setToast }: OrganizerPanelProps) {
  const [tab, setTab] = useState<SubTab>('dashboard');
  const [eventCreateTab, setEventCreateTab] = useState<'basic' | 'media' | 'floor' | 'location' | 'attendees' | 'reports'>('basic');

  // Create Event Form States
  const [eventName, setEventName] = useState('Yuh');
  const [eventCategory, setEventCategory] = useState('Performing Arts');
  const [subCategory, setSubCategory] = useState('Dance');
  const [currency, setCurrency] = useState('AFN');
  const [startDate, setStartDate] = useState('2026-01-15');
  const [startTime, setStartTime] = useState('13:23');
  const [endTime, setEndTime] = useState('18:23');
  const [isPublic, setIsPublic] = useState(true);
  const [acceptBooking, setAcceptBooking] = useState(true);
  const [about, setAbout] = useState('Lingo');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ type: 'success', message: 'Event details saved successfully!' });
    setTab('events');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '85vh', background: '#0e0d20', borderRadius: '16px', border: '1px solid rgba(147, 51, 234, 0.1)', overflow: 'hidden' }}>
      
      {/* Top Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#131129', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>Dlab</span>
          <i className="fa-solid fa-bars" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}></i>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }}></i>
            <input type="text" placeholder="Search..." style={{ background: '#1c1936', border: 'none', borderRadius: '8px', padding: '8px 12px 8px 36px', color: '#fff', fontSize: '0.85rem', width: '200px' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-neon" style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.8rem', background: '#a855f7' }} onClick={() => setTab('create')}>
            Create Event
          </button>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <i className="fa-regular fa-bell" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}></i>
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', borderRadius: '50%', width: '14px', height: '14px', fontSize: '0.6rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
            {session.userName ? session.userName[0].toUpperCase() : 'O'}
          </div>
        </div>
      </div>

      {/* Main Panel Content with Sidebar */}
      <div style={{ display: 'flex', flexGrow: 1 }}>
        
        {/* Left Dashboard Sidebar */}
        <div style={{ width: '220px', background: '#131129', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '8px' }}>Navigation</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => setTab('dashboard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: tab === 'dashboard' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', border: 'none', color: tab === 'dashboard' ? '#fff' : 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', fontWeight: '600' }}>
                <span><i className="fa-solid fa-house" style={{ marginRight: '8px', width: '16px' }}></i> Dashboard</span>
                <i className="fa-solid fa-angle-right" style={{ fontSize: '0.7rem' }}></i>
              </button>
              <button onClick={() => setTab('events')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: tab === 'events' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', border: 'none', color: tab === 'events' ? '#fff' : 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', fontWeight: '600' }}>
                <span><i className="fa-solid fa-calendar-days" style={{ marginRight: '8px', width: '16px' }}></i> Events</span>
                <i className="fa-solid fa-angle-right" style={{ fontSize: '0.7rem' }}></i>
              </button>
              <button style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', fontWeight: '600' }}>
                <span><i className="fa-solid fa-palette" style={{ marginRight: '8px', width: '16px' }}></i> Color</span>
                <i className="fa-solid fa-angle-right" style={{ fontSize: '0.7rem' }}></i>
              </button>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '8px' }}>App</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', fontWeight: '600' }}>
                <span><i className="fa-solid fa-table-cells" style={{ marginRight: '8px', width: '16px' }}></i> Apps</span>
                <i className="fa-solid fa-angle-right" style={{ fontSize: '0.7rem' }}></i>
              </button>
              <button style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', fontWeight: '600' }}>
                <span><i className="fa-solid fa-chart-simple" style={{ marginRight: '8px', width: '16px' }}></i> Charts</span>
                <i className="fa-solid fa-angle-right" style={{ fontSize: '0.7rem' }}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Area */}
        <div style={{ flexGrow: 1, padding: '24px', overflowY: 'auto' }}>
          
          {tab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Analytics Chart Block */}
                <div style={{ background: '#131129', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Analytics</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: '#a855f7', border: 'none', padding: '4px 12px', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontWeight: '600' }}>Discount Codes</button>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '4px 12px' }}>Page Views</button>
                    </div>
                  </div>
                  {/* Wave Line Chart Simulation */}
                  <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'flex-end' }}>
                    <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%' }}>
                      <path d="M0,120 C50,110 100,50 150,70 C200,90 250,130 300,100 C350,70 400,20 500,40" fill="none" stroke="#3b82f6" strokeWidth="4" />
                      <path d="M0,150 L0,120 C50,110 100,50 150,70 C200,90 250,130 300,100 C350,70 400,20 500,40 L500,150 Z" fill="rgba(59, 130, 246, 0.1)" />
                    </svg>
                  </div>
                </div>

                {/* Net Sales Block */}
                <div style={{ background: '#131129', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Net Sales</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '4px 0 20px 0' }}>$0.00</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>
                      <p>Ticket Sold</p>
                      <p style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>125</p>
                    </div>
                    <div>
                      <p>Gross Sale</p>
                      <p style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>$750.00</p>
                    </div>
                    <div>
                      <p>Page Views</p>
                      <p style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>5635</p>
                    </div>
                    <div>
                      <p>Invites</p>
                      <p style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>23</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower progress row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                <div style={{ background: '#131129', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Event Goals</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Wordpress Theme</span>
                        <span>39%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                        <div style={{ width: '39%', height: '100%', background: '#a855f7', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>UI Design</span>
                        <span>65%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                        <div style={{ width: '65%', height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Circular widgets */}
                <div style={{ background: '#131129', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Bloomreach Connect</p>
                  <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 12px auto' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="75, 100" />
                    </svg>
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.8rem', fontWeight: 'bold' }}>960</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attend</span>
                </div>

                <div style={{ background: '#131129', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Tech Inclusion</p>
                  <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 12px auto' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="85, 100" />
                    </svg>
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.8rem', fontWeight: 'bold' }}>1250</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attended</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'create' && (
            <div style={{ background: '#f8fafc', color: '#334155', borderRadius: '16px', overflow: 'hidden', padding: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
              {/* Form Navigation Tabs */}
              <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
                <span onClick={() => setEventCreateTab('basic')} style={{ fontWeight: 'bold', fontSize: '0.85rem', color: eventCreateTab === 'basic' ? '#ea580c' : '#64748b', cursor: 'pointer', borderBottom: eventCreateTab === 'basic' ? '2px solid #ea580c' : 'none', paddingBottom: '12px', marginBottom: '-14px' }}>Basic Details</span>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>Photo & Video</span>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>Floor Planner</span>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>Location</span>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                  
                  {/* Left Column */}
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Event Name *</label>
                        <input type="text" className="form-control" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', height: '38px', borderRadius: '6px' }} value={eventName} onChange={e => setEventName(e.target.value)} required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Event Category *</label>
                        <select className="form-select" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', height: '38px', borderRadius: '6px', paddingLeft: '12px' }} value={eventCategory} onChange={e => setEventCategory(e.target.value)}>
                          <option value="Performing Arts">Performing Arts</option>
                          <option value="Music">Music</option>
                          <option value="Conference">Conference</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Sub Category *</label>
                        <select className="form-select" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', height: '38px', borderRadius: '6px', paddingLeft: '12px' }} value={subCategory} onChange={e => setSubCategory(e.target.value)}>
                          <option value="Dance">Dance</option>
                          <option value="Concert">Concert</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>Currency *</label>
                        <input type="text" className="form-control" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', height: '38px', borderRadius: '6px' }} value={currency} onChange={e => setCurrency(e.target.value)} />
                      </div>
                    </div>

                    {/* Date and Time Panel */}
                    <div style={{ background: 'rgba(255, 137, 0, 0.05)', border: '1px dashed rgba(255, 137, 0, 0.2)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ea580c' }}>Date & Time</span>
                        <button type="button" style={{ background: '#ea580c', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Add Date & Time +</button>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <input type="date" className="form-control" style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155', height: '36px' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <input type="time" className="form-control" style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155', height: '36px' }} value={startTime} onChange={e => setStartTime(e.target.value)} />
                        <input type="time" className="form-control" style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155', height: '36px' }} value={endTime} onChange={e => setEndTime(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    {/* Media Upload Mock */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b', cursor: 'pointer' }}>
                        <i className="fa-solid fa-plus" style={{ fontSize: '1rem', marginBottom: '4px' }}></i>
                        <span>Add Thumbnail</span>
                      </div>
                      <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b', cursor: 'pointer' }}>
                        <i className="fa-regular fa-image" style={{ fontSize: '1rem', marginBottom: '4px' }}></i>
                        <span>Add / Drag Banner</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>About *</label>
                      <textarea className="form-control" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', height: '100px', borderRadius: '6px', padding: '12px' }} value={about} onChange={e => setAbout(e.target.value)} />
                    </div>

                    {/* Social Media Grid */}
                    <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 'bold', marginBottom: '8px' }}>Social Media</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['facebook', 'globe', 'youtube', 'instagram', 'twitter', 'linkedin'].map((social, idx) => (
                        <div key={idx} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', cursor: 'pointer' }}>
                          <i className={`fa-brands fa-${social === 'globe' ? 'google' : social}`}></i>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                  <button type="submit" style={{ background: '#1e3a8a', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                </div>
              </form>
            </div>
          )}

          {tab === 'events' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>Platform Events</h2>
              
              {/* Grid of Event Cards matching Screenshot 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {[
                  { name: 'Yuh', category: 'Performing Arts', date: '15 Jan, 2026', time: '01:23 PM - 06:23 PM', sold: '1.5k', unsold: '2k' },
                  { name: 'De', category: 'Visual Arts', date: '16 Aug, 2025', time: '08:45 AM - 06:45 AM', sold: '1.5k', unsold: '2k' },
                  { name: 'H2', category: 'Technology', date: '11 Aug, 2025', time: '05:13 PM - 08:13 PM', sold: '1.5k', unsold: '2k' },
                  { name: 'morethan2 date', category: 'Visual Arts', date: '03 Aug, 2025', time: '10:45 AM - 06:45 AM', sold: '1.5k', unsold: '2k' }
                ].map((ev, index) => (
                  <div key={index} style={{ background: '#131129', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <i className="fa-regular fa-image" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ color: '#fff', fontWeight: 'bold' }}>{ev.name}</h4>
                        <div style={{ color: '#fb923c', fontSize: '0.75rem', margin: '4px 0' }}>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>0 Users</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><i className="fa-regular fa-calendar" style={{ marginRight: '6px' }}></i> {ev.date}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i> {ev.time}</p>
                      </div>

                      <span style={{ position: 'absolute', top: '20px', right: '20px', padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {ev.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>Draft</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <i className="fa-solid fa-video" style={{ color: 'var(--text-muted)' }}></i>
                        <i className="fa-solid fa-ellipsis-vertical" style={{ color: 'var(--text-muted)' }}></i>
                      </div>
                    </div>

                    {/* Progress Bar sold/unsold */}
                    <div>
                      <div style={{ height: '8px', background: '#334155', borderRadius: '4px', display: 'flex', overflow: 'hidden' }}>
                        <div style={{ width: '42%', background: '#ea580c' }}></div>
                        <div style={{ width: '58%', background: '#1e3a8a' }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '6px', color: 'var(--text-muted)' }}>
                        <span>{ev.sold} Sold</span>
                        <span>{ev.unsold} Unsold</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
