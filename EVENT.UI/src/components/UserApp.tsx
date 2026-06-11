/// <reference path="../types.d.ts" />
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface UserAppProps {
  session: {
    token: string | null;
    userRole: string | null;
    userName: string | null;
    userId: string | null;
    mobileNo: string | null;
  };
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function UserApp({ session, setToast }: UserAppProps) {
  const [view, setView] = useState<'listing' | 'details' | 'seats' | 'checkout' | 'success' | 'tickets'>('listing');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Seat layout mock
  const seats = Array.from({ length: 48 }, (_, i) => {
    const row = String.fromCharCode(65 + Math.floor(i / 8));
    const num = (i % 8) + 1;
    return { id: `${row}${num}`, isOccupied: i % 7 === 0 };
  });

  useEffect(() => {
    async function loadEvents() {
      if (!session.token || !session.userId) return;
      setLoading(true);
      try {
        const list = await apiService.getAllEventDetails({
          pageNo: 1,
          pageSize: 20,
          eventId: 0,
          userId: Number(session.userId)
        }, session.token);
        setEvents(list || []);
      } catch (err: any) {
        setToast({ type: 'error', message: err.message || 'Failed to load events.' });
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [session.token, session.userId, setToast]);

  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
      setToast({ type: 'success', message: 'Removed from Wishlist.' });
    } else {
      setWishlist([...wishlist, id]);
      setToast({ type: 'success', message: 'Added to Wishlist!' });
    }
  };

  const handleSeatClick = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBook = () => {
    if (selectedSeats.length === 0) {
      setToast({ type: 'error', message: 'Please select at least one seat.' });
      return;
    }
    setView('checkout');
  };

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newTicket = {
        eventId: selectedEvent.eventId,
        eventName: selectedEvent.eventName,
        seats: selectedSeats.join(', '),
        date: selectedEvent.startDateTime ? new Date(selectedEvent.startDateTime).toLocaleDateString() : 'Today',
        price: selectedSeats.length * 1500,
        ticketNo: 'EV-' + Math.floor(100000 + Math.random() * 900000)
      };
      setTickets([newTicket, ...tickets]);
      setToast({ type: 'success', message: 'Payment Successful!' });
      setView('success');
    }, 1500);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Search and Filters & Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button className={`btn-secondary ${view === 'listing' ? 'active' : ''}`} onClick={() => setView('listing')}>
          <i className="fa-solid fa-compass" style={{ marginRight: '8px' }}></i> Discover Events
        </button>
        <button className={`btn-secondary ${view === 'tickets' ? 'active' : ''}`} onClick={() => setView('tickets')}>
          <i className="fa-solid fa-wallet" style={{ marginRight: '8px' }}></i> My Tickets ({tickets.length})
        </button>
      </div>

      {view === 'listing' && (
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {events.map((event) => (
                <div
                  key={event.eventId}
                  className="card"
                  style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => { setSelectedEvent(event); setView('details'); }}
                >
                  <div style={{ position: 'relative', height: '180px' }}>
                    <img
                      src={event.thumbnailImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&auto=format&fit=crop&q=60'}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={(e) => toggleWishlist(event.eventId, e)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(7, 7, 16, 0.6)',
                        border: 'none',
                        color: wishlist.includes(event.eventId) ? '#ec4899' : '#fff',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className="fa-solid fa-heart"></i>
                    </button>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {event.categoryName || 'General'}
                    </span>
                    <h3 style={{ margin: '8px 0', fontSize: '1.1rem', fontWeight: '700' }}>{event.eventName}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-location-dot"></i> {event.cityName || 'Online'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-users"></i> {event.visitorCount || 0} Attending
                      </span>
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>₹1,500</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'details' && selectedEvent && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '0', overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: '320px' }}>
            <img
              src={selectedEvent.bannerImage || selectedEvent.thumbnailImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80'}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              onClick={() => setView('listing')}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(7, 7, 16, 0.7)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <i className="fa-solid fa-arrow-left"></i> Back
            </button>
          </div>

          <div style={{ padding: '30px' }}>
            <span style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
              {selectedEvent.categoryName} • {selectedEvent.subcategoryName}
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '8px 0 16px 0' }}>{selectedEvent.eventName}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date & Time</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {selectedEvent.startDateTime ? new Date(selectedEvent.startDateTime).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-solid fa-location-crosshairs" style={{ color: 'var(--secondary-color)', fontSize: '1.2rem' }}></i>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{selectedEvent.cityName || 'Online'}</p>
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              Experience the best events in town. Sign up today, book your spots, select custom VIP/General seats, and receive a secure dynamic Apple Wallet pass ticket.
            </p>

            <button className="btn-primary" onClick={() => setView('seats')}>
              <i className="fa-solid fa-ticket"></i> Book Passes Now
            </button>
          </div>
        </div>
      )}

      {view === 'seats' && selectedEvent && (
        <div className="card text-center" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Select Seats</h2>
          <p className="text-subtitle">Choose your preferred seating layout below.</p>

          <div style={{ background: 'rgba(255,255,255,0.03)', height: '8px', width: '80%', margin: '0 auto 20px auto', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}></div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>STAGE</span>

          <div className="seat-map-grid">
            {seats.map((seat) => (
              <button
                key={seat.id}
                disabled={seat.isOccupied}
                className={`seat ${seat.isOccupied ? 'occupied' : ''} ${selectedSeats.includes(seat.id) ? 'selected' : ''}`}
                onClick={() => handleSeatClick(seat.id)}
                title={seat.id}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div><span className="seat" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}></span> Available</div>
            <div><span className="seat selected" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}></span> Selected</div>
            <div><span className="seat occupied" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}></span> Occupied</div>
          </div>

          <button className="btn-primary" onClick={handleBook}>
            Confirm {selectedSeats.length} Seats (₹{selectedSeats.length * 1500})
          </button>
        </div>
      )}

      {view === 'checkout' && selectedEvent && (
        <div className="card" style={{ maxWidth: '460px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '16px' }}>Checkout Order</h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontWeight: 'bold' }}>{selectedEvent.eventName}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedSeats.length} VIP Tickets (Seats: {selectedSeats.join(', ')})</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
              <span>Total Price:</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>₹{selectedSeats.length * 1500}</span>
            </div>
          </div>

          <button className="btn-primary btn-neon" onClick={handlePayment} disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Confirm Payment & Generate Passes'}
          </button>
        </div>
      )}

      {view === 'success' && (
        <div className="card text-center" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '4rem', color: 'var(--accent-color)', marginBottom: '16px' }}></i>
          <h2>Order Confirmed!</h2>
          <p className="text-subtitle">Your passes have been added to your secure wallet.</p>
          <button className="btn-primary" onClick={() => setView('tickets')}>
            Go to My Tickets
          </button>
        </div>
      )}

      {view === 'tickets' && (
        <div>
          {tickets.length === 0 ? (
            <div className="card text-center" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-muted)' }}>You have no booked passes.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {tickets.map((t, index) => (
                <div key={index} className="ticket-pass">
                  <div className="ticket-header">
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>{t.eventName}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VIP Pass</p>
                    </div>
                    <i className="fa-brands fa-apple" style={{ fontSize: '1.5rem', color: '#fff' }}></i>
                  </div>
                  <div className="ticket-body">
                    <div className="ticket-meta-grid">
                      <div>
                        <p className="ticket-label">Date</p>
                        <p className="ticket-value">{t.date}</p>
                      </div>
                      <div>
                        <p className="ticket-label">Seats</p>
                        <p className="ticket-value">{t.seats}</p>
                      </div>
                      <div>
                        <p className="ticket-label">Price</p>
                        <p className="ticket-value">₹{t.price}</p>
                      </div>
                      <div>
                        <p className="ticket-label">Ticket No</p>
                        <p className="ticket-value">{t.ticketNo}</p>
                      </div>
                    </div>
                    <div className="ticket-barcode-container">
                      {/* Mock barcode lines */}
                      <div style={{ width: '100%', height: '50px', background: 'repeating-linear-gradient(90deg, #000, #000 4px, #fff 4px, #fff 8px)' }}></div>
                      <span style={{ fontSize: '0.65rem', color: '#000', fontFamily: 'monospace', marginTop: '6px' }}>{t.ticketNo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
