import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CircularProgress, Container } from '@mui/material';
import { Download, ArrowLeft, DownloadCloud } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { passApi } from '../api/passApi';
import { ROUTES } from '../constants/appConstants';

export const BookingPassesPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingSingle, setDownloadingSingle] = useState<string | null>(null);

  useEffect(() => {
    const fetchPasses = async () => {
      const userIdStr = localStorage.getItem('userId') || '0';
      const userId = Number(userIdStr);
      if (userId === 0 || !bookingId) return;

      setLoading(true);
      try {
        const res = await passApi.getUserPasses(userId);
        if (res.success && res.data) {
          const filtered = res.data.filter((p: any) => (p.bookingId ?? p.BookingId) === Number(bookingId));
          setPasses(filtered);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to retrieve entry passes.');
      } finally {
        setLoading(false);
      }
    };
    fetchPasses();
  }, [bookingId]);

  const handleDownloadSingle = async (pass: any) => {
    const code = pass.passCode ?? pass.PassCode;
    const name = pass.eventName ?? pass.EventName;
    const seat = pass.seatNo ?? pass.SeatNo;
    const elementId = `ticket-container-${code}`;
    const element = document.getElementById(elementId);
    if (!element) {
      toast.error('Pass container not found.');
      return;
    }

    setDownloadingSingle(code);
    try {
      // Small timeout to let any dynamic images load fully
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2, // Double resolution for high quality print
        useCORS: true, // Allow external QR code images
        backgroundColor: null, // Transparent background for rounded corners
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Pass_${(name || '').replace(/\s+/g, '_')}_Seat_${seat || 'NA'}_${code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Pass downloaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate image download.');
    } finally {
      setDownloadingSingle(null);
    }
  };

  const handleDownloadAll = async () => {
    if (passes.length === 0) return;
    setDownloadingAll(true);
    toast.info(`Preparing ${passes.length} passes for download...`);

    try {
      for (let i = 0; i < passes.length; i++) {
        const pass = passes[i];
        const code = pass.passCode ?? pass.PassCode;
        const name = pass.eventName ?? pass.EventName;
        const seat = pass.seatNo ?? pass.SeatNo;
        const elementId = `ticket-container-${code}`;
        const element = document.getElementById(elementId);
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            logging: false,
          });

          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = `Pass_${i + 1}_${(name || '').replace(/\s+/g, '_')}_Seat_${seat || 'NA'}_${code}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          // Wait 500ms between downloads to avoid browser block
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      toast.success('All passes downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error occurred while exporting passes.');
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2, bgcolor: '#f8fafc' }}>
        <CircularProgress size={50} />
        <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 600 }}>Loading security entrance passes...</Typography>
      </Box>
    );
  }

  if (passes.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 3, bgcolor: '#f8fafc', p: 3 }}>
        <Typography variant="h5" color="textSecondary" sx={{ fontWeight: 800 }}>No passes found for this booking.</Typography>
        <Button variant="contained" startIcon={<ArrowLeft />} onClick={() => navigate(ROUTES.DASHBOARD)}>Go to Dashboard</Button>
      </Box>
    );
  }

  const firstPass = passes[0];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 6 }}>
      {/* CSS Stylesheet Injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .ticket-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px 0;
          width: 100%;
        }
        .ticket-container {
          display: flex;
          width: 760px;
          height: 270px;
          background-color: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          position: relative;
          font-family: 'Outfit', 'Inter', sans-serif;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .ticket-left {
          flex: 1.1;
          background: linear-gradient(135deg, #2a0845 0%, #6441a5 100%);
          position: relative;
          color: #fff;
          display: flex;
          flex-direction: column;
          padding: 24px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .ticket-left-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
          z-index: 1;
        }
        .ticket-left-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .ticket-logo-section {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .ticket-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo-diamond {
          width: 14px;
          height: 14px;
          border: 2px solid #ff7597;
          transform: rotate(45deg);
          display: inline-block;
          background: linear-gradient(135deg, #ff7597, #6441a5);
        }
        .logo-text {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #ff7597;
        }
        .ticket-presentation {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.65);
          font-style: italic;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .ticket-slanted-badge {
          background: linear-gradient(90deg, #ff7597, #e23e57);
          padding: 8px 18px;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 1px;
          color: #fff;
          text-transform: uppercase;
          transform: skewX(-10deg);
          width: fit-content;
          box-shadow: 0 4px 15px rgba(226, 62, 87, 0.4);
          margin-bottom: 8px;
        }
        .ticket-sub-badge {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: auto;
          padding-left: 2px;
        }
        .ticket-description {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.4;
          margin-bottom: 10px;
          max-width: 90%;
        }
        .ticket-socials {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }
        .social-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.3);
        }
        .ticket-divider {
          width: 20px;
          background-color: #fff;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .notch {
          width: 20px;
          height: 20px;
          background-color: #f8fafc;
          border-radius: 50%;
          position: absolute;
          z-index: 10;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .top-notch {
          top: -11px;
          left: 0;
        }
        .bottom-notch {
          bottom: -11px;
          left: 0;
        }
        .divider-line {
          height: calc(100% - 30px);
          border-left: 2px dashed #e2e8f0;
        }
        .ticket-right {
          flex: 1.4;
          background: linear-gradient(135deg, #fff5f7 0%, #ffeef1 40%, #ffdce2 100%);
          display: flex;
          padding: 16px 20px;
          box-sizing: border-box;
          position: relative;
          justify-content: space-between;
        }
        .ticket-right::before {
          content: '';
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,117,151,0.25) 0%, rgba(255,117,151,0) 70%);
          top: 10%;
          right: 5%;
          pointer-events: none;
        }
        .ticket-right-content {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1.5;
          z-index: 2;
        }
        .ticket-event-name {
          font-size: 20px;
          font-weight: 800;
          color: #3b0066;
          margin-bottom: 2px;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .ticket-date-display {
          font-size: 16px;
          font-weight: 800;
          color: #e23e57;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ticket-time-display {
          font-size: 8.5px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .ticket-location-display {
          font-size: 8.5px;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 6px;
          line-height: 1.2;
        }
        .ticket-location-display strong {
          color: #e23e57;
          font-weight: 800;
        }
        .ticket-location-address {
          font-size: 8px;
          color: #64748b;
          margin-top: 1px;
          line-height: 1.2;
        }
        .ticket-map-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 700;
          margin-left: 5px;
        }
        .ticket-map-link:hover {
          text-decoration: underline;
        }
        .ticket-details-table {
          display: flex;
          background-color: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(226, 62, 87, 0.25);
          border-radius: 12px;
          padding: 6px 10px;
          margin-bottom: 8px;
          backdrop-filter: blur(5px);
          width: fit-content;
          gap: 12px;
        }
        .details-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 55px;
        }
        .detail-label {
          font-size: 8px;
          font-weight: 800;
          color: #e23e57;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .detail-value {
          font-size: 14px;
          font-weight: 800;
          color: #2a0845;
        }
        .details-divider {
          width: 1px;
          background-color: rgba(226, 62, 87, 0.15);
          align-self: stretch;
        }
        .ticket-admit-box {
          background: linear-gradient(135deg, #e23e57, #6441a5);
          border-radius: 8px;
          padding: 6px 14px;
          width: fit-content;
          display: flex;
          gap: 8px;
          align-items: center;
          box-shadow: 0 4px 10px rgba(100, 65, 165, 0.25);
        }
        .admit-label {
          font-size: 9px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 1.5px;
        }
        .ticket-qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 0.7;
          border-left: 2px dashed rgba(226, 62, 87, 0.15);
          padding-left: 16px;
          z-index: 2;
        }
        .qr-code-wrapper {
          background-color: #fff;
          padding: 6px;
          border-radius: 8px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .ticket-qr-code {
          width: 95px;
          height: 95px;
          display: block;
        }
        .ticket-serial {
          font-size: 8px;
          font-weight: 800;
          color: #6441a5;
          margin-top: 6px;
          letter-spacing: 0.5px;
        }
        @media (max-width: 768px) {
          .ticket-container {
            flex-direction: column;
            width: 320px;
            height: auto;
          }
          .ticket-divider {
            display: none;
          }
          .ticket-left {
            height: 140px;
            padding: 16px;
          }
          .ticket-right {
            flex-direction: column;
            padding: 16px;
            gap: 16px;
          }
          .ticket-qr-section {
            border-left: none;
            border-top: 2px dashed rgba(226, 62, 87, 0.15);
            padding-left: 0;
            padding-top: 16px;
          }
          .ticket-slanted-badge {
            font-size: 18px;
            padding: 6px 14px;
          }
        }
      `}} />

      <Container maxWidth="md">
        {/* Header section */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 5 }}>
          <Box>
            <Button
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(ROUTES.BOOKINGS)}
              sx={{ mb: 1, textTransform: 'none', color: '#64748b', '&:hover': { color: '#0f172a' } }}
            >
              Back to Bookings
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a' }}>
              Your Entry Passes
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Booking Ref: <strong style={{ color: '#3b82f6' }}>{(firstPass.passCode ?? firstPass.PassCode ?? '').split('-')[0] || bookingId}</strong> | Event: <strong>{firstPass.eventName ?? firstPass.EventName}</strong>
            </Typography>
          </Box>

          {passes.length > 1 && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={downloadingAll ? <CircularProgress size={16} color="inherit" /> : <DownloadCloud size={18} />}
              onClick={handleDownloadAll}
              disabled={downloadingAll || passes.length === 0}
              sx={{
                textTransform: 'none',
                borderRadius: 2.5,
                fontWeight: 700,
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
              }}
            >
              {downloadingAll ? 'Exporting All...' : 'Download All Passes'}
            </Button>
          )}
        </Box>

        {/* Passes grid list */}
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {passes.map((pass, index) => {
            const passId = pass.passId ?? pass.PassId;
            const code = pass.passCode ?? pass.PassCode;
            const name = pass.eventName ?? pass.EventName;
            const date = pass.slotDate ?? pass.SlotDate;
            const start = pass.startTime ?? pass.StartTime;
            const end = pass.endTime ?? pass.EndTime;
            const seat = pass.seatNo ?? pass.SeatNo;
            const zone = pass.zoneName ?? pass.ZoneName;
            const holder = pass.holderName ?? pass.HolderName;
            const venue = pass.venueName ?? pass.VenueName;
            const addr1 = pass.addressLine1 ?? pass.AddressLine1;
            const addr2 = pass.addressLine2 ?? pass.AddressLine2;
            const city = pass.city ?? pass.City;
            const state = pass.state ?? pass.State;
            const country = pass.country ?? pass.Country;
            const mapLink = pass.googleMapLink ?? pass.GoogleMapLink;
            const passType = pass.passType ?? pass.PassType;

            return (
              <Grid item xs={12} key={passId || index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Card sx={{ p: 0.5, borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', bgcolor: '#fff', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                  <div id={`ticket-container-${code}`} className="ticket-container">
                    {/* Left side (Violet/Purple Gradient Stub) */}
                    <div className="ticket-left">
                      <div className="ticket-left-overlay"></div>
                      <div className="ticket-left-content">
                        <div className="ticket-logo-section">
                          <div className="ticket-logo">
                            <span className="logo-diamond"></span>
                            <span className="logo-text">EVENT PASS</span>
                          </div>
                        </div>
                        <div className="ticket-presentation">Festum Evanto Presenting...</div>
                        <div className="ticket-slanted-badge">{passType || 'EVENT TICKET'}</div>
                        <div className="ticket-sub-badge">YOUR ENTRY PASS</div>
                        <div className="ticket-description">Show this pass with QR Code at the entrance. Valid for single entry only.</div>
                        <div className="ticket-socials">
                          <span className="social-dot"></span>
                          <span className="social-dot"></span>
                          <span className="social-dot"></span>
                        </div>
                      </div>
                    </div>

                    {/* Divider with notches */}
                    <div className="ticket-divider">
                      <div className="notch top-notch"></div>
                      <div className="divider-line"></div>
                      <div className="notch bottom-notch"></div>
                    </div>

                    {/* Right side (Pink/Orange Stub) */}
                    <div className="ticket-right">
                      <div className="ticket-right-content">
                        <div className="ticket-event-name">{name}</div>
                        <div className="ticket-date-display">
                          {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="ticket-time-display">
                          DOORS WILL OPEN AT {start ? start.substring(0, 5) : '00:00'}
                        </div>

                        {(venue || addr1) && (
                          <div className="ticket-location-display">
                            <strong>VENUE:</strong> {venue || 'N/A'}
                            {(addr1 || addr2 || city) && (
                              <div className="ticket-location-address">
                                {[addr1, addr2, city, state, country].filter(Boolean).join(', ')}
                                {mapLink && (
                                  <a href={mapLink} target="_blank" rel="noopener noreferrer" className="ticket-map-link">
                                    (View Map)
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="ticket-details-table">
                          <div className="details-column">
                            <span className="detail-label">SEAT</span>
                            <span className="detail-value">{seat || 'N/A'}</span>
                          </div>
                          <div className="details-divider"></div>
                          <div className="details-column">
                            <span className="detail-label">ZONE</span>
                            <span className="detail-value">{zone || 'General'}</span>
                          </div>
                          <div className="details-divider"></div>
                          <div className="details-column">
                            <span className="detail-label">SLOT TIME</span>
                            <span className="detail-value">
                              {start ? start.substring(0, 5) : '00:00'} - {end ? end.substring(0, 5) : 'END'}
                            </span>
                          </div>
                        </div>

                        <div className="ticket-admit-box">
                          <span className="admit-label">HOLDER: {(holder || '').toUpperCase()}</span>
                        </div>
                      </div>

                      {/* QR Code section */}
                      <div className="ticket-qr-section">
                        <div className="qr-code-wrapper">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`}
                            alt="Pass QR Code"
                            className="ticket-qr-code"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Download Action for this card */}
                <Box sx={{ mt: 2, mb: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={downloadingSingle === code ? <CircularProgress size={14} /> : <Download size={15} />}
                    onClick={() => handleDownloadSingle(pass)}
                    disabled={downloadingSingle !== null || downloadingAll}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: '#cbd5e1',
                      color: '#475569',
                      fontWeight: 600,
                      px: 3.5,
                      '&:hover': {
                        borderColor: '#94a3b8',
                        bgcolor: '#f1f5f9',
                        color: '#0f172a'
                      }
                    }}
                  >
                    {downloadingSingle === code ? 'Generating Pass...' : `Download Pass (Seat: ${seat || 'N/A'})`}
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default BookingPassesPage;
