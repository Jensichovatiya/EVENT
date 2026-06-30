import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CircularProgress, Chip, Divider, Dialog, DialogContent } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import { passApi } from '../api/passApi';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const PassesPage: React.FC = () => {
  const [passes, setPasses] = useState<any[]>([]);
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingPass, setDownloadingPass] = useState<any>(null);

  useEffect(() => {
    const fetchPasses = async () => {
      const userIdStr = localStorage.getItem('userId') || '0';
      const userId = Number(userIdStr);
      if (userId === 0) return;

      setLoading(true);
      try {
        const res = await passApi.getUserPasses(userId);
        if (res.success) {
          setPasses(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPasses();
  }, []);

  const handleViewPass = (pass: any) => {
    setSelectedPass(pass);
    setOpenModal(true);
  };

  const handleDownloadModalPass = async () => {
    if (!selectedPass) return;
    const element = document.getElementById('ticket-container-modal');
    if (!element) {
      toast.error('Pass container not found.');
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Pass_${selectedPass.eventName.replace(/\s+/g, '_')}_Seat_${selectedPass.seatNo || 'NA'}_${selectedPass.passCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Pass downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download pass.');
    }
  };

  const handleDownloadTablePass = async (pass: any) => {
    setDownloadingPass(pass);
    await new Promise((resolve) => setTimeout(resolve, 150));

    const element = document.getElementById('hidden-download-container');
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `Pass_${pass.eventName.replace(/\s+/g, '_')}_Seat_${pass.seatNo || 'NA'}_${pass.passCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Pass downloaded successfully!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to download pass.');
      }
    } else {
      toast.error('Failed to initialize download render container.');
    }
    setDownloadingPass(null);
  };

  const columns = [
    { header: 'Pass Code', accessor: 'passCode' },
    { header: 'Event', accessor: 'eventName' },
    { header: 'Holder Name', accessor: 'holderName' },
    { header: 'Slot Date', accessor: (row: any) => new Date(row.slotDate).toLocaleDateString() },
    { header: 'Seat No', accessor: (row: any) => row.seatNo || 'N/A' },
    { header: 'Status', accessor: (row: any) => row.isValid ? 'Valid' : 'Used/Invalid' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => handleViewPass(row)} style={{ textTransform: 'none', borderRadius: 8 }}>
            View Pass
          </Button>
          <Button variant="outlined" color="secondary" size="small" onClick={() => handleDownloadTablePass(row)} style={{ textTransform: 'none', borderRadius: 8 }}>
            Download
          </Button>
        </Box>
      ),
    },
  ];

  const userRole = localStorage.getItem('userRole');
  let pageTitle = 'My Entry Passes';
  let pageDescription = 'View and download your digital tickets and security entrance passes.';
  let searchPlaceholder = 'Search by pass code...';

  if (userRole === 'SuperAdmin') {
    pageTitle = 'System Entry Passes (Super Admin)';
    pageDescription = 'View and manage all digital tickets and security entrance passes across the system.';
    searchPlaceholder = 'Search by pass code, event, or holder...';
  } else if (userRole === 'Organizer') {
    pageTitle = 'Event Entry Passes (Organizer)';
    pageDescription = 'View entry passes for bookings of your organized events.';
    searchPlaceholder = 'Search by pass code, event, or holder...';
  }

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>{pageTitle}</Typography>
        <Typography variant="body2" color="textSecondary">{pageDescription}</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <AppTable
          columns={columns}
          data={passes}
          searchKey="passCode"
          searchPlaceholder={searchPlaceholder}
        />
      )}

      {/* Pass Detail Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'visible' }}>
          {selectedPass && (
            <Box sx={{ position: 'relative' }}>
              {/* Close Button */}
              <Button
                onClick={() => setOpenModal(false)}
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: 0,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Close [X]
              </Button>

              {/* Inject CSS styles */}
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
                  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                  overflow: hidden;
                  position: relative;
                  font-family: 'Outfit', 'Inter', sans-serif;
                  border: 1px solid rgba(255, 255, 255, 0.1);
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
                  background-color: rgba(0, 0, 0, 0.85);
                  border-radius: 50%;
                  position: absolute;
                  z-index: 10;
                }
                .top-notch {
                  top: -10px;
                  left: 0;
                }
                .bottom-notch {
                  bottom: -10px;
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
                .ticket-right::after {
                  content: '';
                  position: absolute;
                  width: 120px;
                  height: 120px;
                  border-radius: 50%;
                  background: radial-gradient(circle, rgba(255,221,117,0.25) 0%, rgba(255,221,117,0) 70%);
                  bottom: -10%;
                  left: 5%;
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
                .admit-price {
                  font-size: 11px;
                  font-weight: 800;
                  color: #ffdce2;
                  border-left: 1px solid rgba(255, 255, 255, 0.3);
                  padding-left: 8px;
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

              <div className="ticket-wrapper">
                <div id="ticket-container-modal" className="ticket-container">
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
                      <div className="ticket-slanted-badge">{(selectedPass.passType ?? selectedPass.PassType) || 'EVENT TICKET'}</div>
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
                      <div className="ticket-event-name">{selectedPass.eventName}</div>
                      <div className="ticket-date-display">
                        {new Date(selectedPass.slotDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="ticket-time-display">
                        DOORS WILL OPEN AT {selectedPass.startTime ? selectedPass.startTime.substring(0, 5) : '00:00'}
                      </div>

                      {(selectedPass.venueName || selectedPass.addressLine1) && (
                        <div className="ticket-location-display">
                          <strong>VENUE:</strong> {selectedPass.venueName || 'N/A'}
                          {(selectedPass.addressLine1 || selectedPass.addressLine2 || selectedPass.city) && (
                            <div className="ticket-location-address">
                              {[selectedPass.addressLine1, selectedPass.addressLine2, selectedPass.city, selectedPass.state, selectedPass.country].filter(Boolean).join(', ')}
                              {selectedPass.googleMapLink && (
                                <a href={selectedPass.googleMapLink} target="_blank" rel="noopener noreferrer" className="ticket-map-link">
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
                          <span className="detail-value">{selectedPass.seatNo || 'N/A'}</span>
                        </div>
                        <div className="details-divider"></div>
                        <div className="details-column">
                          <span className="detail-label">ZONE</span>
                          <span className="detail-value">{selectedPass.zoneName || 'General'}</span>
                        </div>
                        <div className="details-divider"></div>
                        <div className="details-column">
                          <span className="detail-label">SLOT TIME</span>
                          <span className="detail-value">
                            {selectedPass.startTime ? selectedPass.startTime.substring(0, 5) : '00:00'} - {selectedPass.endTime ? selectedPass.endTime.substring(0, 5) : 'END'}
                          </span>
                        </div>
                      </div>

                      <div className="ticket-admit-box">
                        <span className="admit-label">HOLDER: {selectedPass.holderName.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* QR Code section */}
                    <div className="ticket-qr-section">
                      <div className="qr-code-wrapper">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedPass.passCode)}`}
                          alt="Pass QR Code"
                          className="ticket-qr-code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons under modal ticket */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3, pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownloadModalPass}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                >
                  Download Pass
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden off-screen ticket renderer for direct table downloads */}
      {downloadingPass && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -100 }}>
          <div id="hidden-download-container" className="ticket-container" style={{ border: 'none', boxShadow: 'none' }}>
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
                <div className="ticket-slanted-badge">{(downloadingPass.passType ?? downloadingPass.PassType) || 'EVENT TICKET'}</div>
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
                <div className="ticket-event-name">{downloadingPass.eventName}</div>
                <div className="ticket-date-display">
                  {new Date(downloadingPass.slotDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="ticket-time-display">
                  DOORS WILL OPEN AT {downloadingPass.startTime ? downloadingPass.startTime.substring(0, 5) : '00:00'}
                </div>

                {(downloadingPass.venueName || downloadingPass.addressLine1) && (
                  <div className="ticket-location-display">
                    <strong>VENUE:</strong> {downloadingPass.venueName || 'N/A'}
                    {(downloadingPass.addressLine1 || downloadingPass.addressLine2 || downloadingPass.city) && (
                      <div className="ticket-location-address">
                        {[downloadingPass.addressLine1, downloadingPass.addressLine2, downloadingPass.city, downloadingPass.state, downloadingPass.country].filter(Boolean).join(', ')}
                        {downloadingPass.googleMapLink && (
                          <a href={downloadingPass.googleMapLink} target="_blank" rel="noopener noreferrer" className="ticket-map-link">
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
                    <span className="detail-value">{downloadingPass.seatNo || 'N/A'}</span>
                  </div>
                  <div className="details-divider"></div>
                  <div className="details-column">
                    <span className="detail-label">ZONE</span>
                    <span className="details-value">{downloadingPass.zoneName || 'General'}</span>
                  </div>
                  <div className="details-divider"></div>
                  <div className="details-column">
                    <span className="detail-label">SLOT TIME</span>
                    <span className="details-value">
                      {downloadingPass.startTime ? downloadingPass.startTime.substring(0, 5) : '00:00'} - {downloadingPass.endTime ? downloadingPass.endTime.substring(0, 5) : 'END'}
                    </span>
                  </div>
                </div>

                <div className="ticket-admit-box">
                  <span className="admit-label">HOLDER: {downloadingPass.holderName.toUpperCase()}</span>
                </div>
              </div>

              {/* QR Code section */}
              <div className="ticket-qr-section">
                <div className="qr-code-wrapper">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(downloadingPass.passCode)}`}
                    alt="Pass QR Code"
                    className="ticket-qr-code"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PassesPage;
