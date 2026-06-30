import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Card, CardContent } from '@mui/material';
import { scannerApi } from '../api/scannerApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppButton from '../components/AppButton';
import AppTable from '../components/AppTable';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const ScannerPage: React.FC = () => {
  const [passCode, setPassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await scannerApi.getScanHistory();
      if (res.success) {
        setHistory(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleValidate = async () => {
    if (!passCode) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await scannerApi.validatePass(passCode);
      if (res.success && res.data) {
        setResult({
          success: true,
          message: 'Pass is valid and active.',
          data: res.data,
        });

        // Auto scan entry log
        const userId = Number(localStorage.getItem('userId') || 0);
        await scannerApi.scanPass({ passCode, scannerUserId: userId });
        fetchHistory();
      } else {
        setResult({
          success: false,
          message: res.message || 'Pass is invalid.',
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Error occurred during validation.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setPassCode(decodedText);
    setLoading(true);
    setResult(null);
    try {
      const res = await scannerApi.validatePass(decodedText);
      if (res.success && res.data) {
        setResult({
          success: true,
          message: 'Pass is valid and active.',
          data: res.data,
        });

        // Auto scan entry log
        const userId = Number(localStorage.getItem('userId') || 0);
        await scannerApi.scanPass({ passCode: decodedText, scannerUserId: userId });
        fetchHistory();
      } else {
        setResult({
          success: false,
          message: res.message || 'Pass is invalid.',
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Error occurred during validation.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (error) => {
        // Silent error logging during continuous camera frame parsing
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  const columns = [
    { header: 'Pass Code', accessor: 'passCode' },
    { header: 'Event Name', accessor: 'eventName' },
    { header: 'Scanned By', accessor: 'scannerUserName' },
    { header: 'Scan Date', accessor: (row: any) => new Date(row.scanDate).toLocaleString() },
    { header: 'Status', accessor: (row: any) => (
      <Typography variant="body2" style={{ color: row.status === 1 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
        {row.status === 1 ? 'Approved' : 'Failed'}
      </Typography>
    )},
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Pass QR/Barcode Scanner</Typography>
        <Typography variant="body2" color="textSecondary">Scan and validate visitor entry passes in real-time.</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>Live Camera Scanner</Typography>
              <Box display="flex" flexDirection="column" gap={3}>
                <Box
                  sx={{
                    width: '100%',
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    p: 1
                  }}
                >
                  <div id="reader" style={{ width: '100%' }}></div>
                </Box>

                <Box display="flex" gap={2}>
                  <TextField
                    label="Enter Pass Code / Barcode Value"
                    fullWidth
                    size="small"
                    value={passCode}
                    onChange={(e) => setPassCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleValidate();
                      }
                    }}
                  />
                  <AppButton onClick={handleValidate} loading={loading}>
                    Validate
                  </AppButton>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {result && (
            <Card style={{ borderRadius: 12, borderLeft: `6px solid ${result.success ? '#10b981' : '#ef4444'}` }}>
              <CardContent>
                <Typography variant="h6" style={{ fontWeight: 600, color: result.success ? '#10b981' : '#ef4444' }}>
                  {result.success ? 'Access Granted' : 'Access Denied'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>{result.message}</Typography>
                {result.success && result.data && (
                  <Box>
                    <Typography variant="body2"><strong>Holder Name:</strong> {result.data.holderName}</Typography>
                    <Typography variant="body2"><strong>Holder Email:</strong> {result.data.holderEmail}</Typography>
                    <Typography variant="body2"><strong>Pass Code:</strong> {result.data.passCode}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Box>

        <Box>
          <Card style={{ borderRadius: 12 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>Scan History Log</Typography>
              <AppTable
                columns={columns}
                data={history}
                searchKey="passCode"
                searchPlaceholder="Filter history by pass code..."
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ScannerPage;
