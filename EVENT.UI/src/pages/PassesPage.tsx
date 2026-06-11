import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppModal from '../components/AppModal';
import AppQRCode from '../components/AppQRCode';
import { scannerApi } from '../api/scannerApi';

export const PassesPage: React.FC = () => {
  const [passes, setPasses] = useState<any[]>([]);
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    // Simulated pass list
    setPasses([
      { passId: 1, passCode: 'PASS-892348', eventName: 'TECHCON 2026', slotDate: '2026-10-12', startTime: '09:00:00', holderName: 'Alice Smith', holderEmail: 'alice@example.com', isValid: true },
      { passId: 2, passCode: 'PASS-923847', eventName: 'Music Awards Show', slotDate: '2026-11-20', startTime: '19:00:00', holderName: 'Bob Johnson', holderEmail: 'bob@example.com', isValid: true },
    ]);
  }, []);

  const handleViewPass = (pass: any) => {
    setSelectedPass(pass);
    setOpenModal(true);
  };

  const columns = [
    { header: 'Pass Code', accessor: 'passCode' },
    { header: 'Event', accessor: 'eventName' },
    { header: 'Holder Name', accessor: 'holderName' },
    { header: 'Slot Date', accessor: (row: any) => new Date(row.slotDate).toLocaleDateString() },
    { header: 'Status', accessor: (row: any) => row.isValid ? 'Valid' : 'Used/Invalid' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Button variant="outlined" size="small" onClick={() => handleViewPass(row)} style={{ textTransform: 'none', borderRadius: 8 }}>
          View Pass
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Entry Passes</Typography>
        <Typography variant="body2" color="textSecondary">View and download your digital tickets and security entrance passes.</Typography>
      </Box>

      <AppTable
        columns={columns}
        data={passes}
        searchKey="passCode"
        searchPlaceholder="Search by pass code..."
      />

      <AppModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Digital Entrance Pass"
      >
        {selectedPass && (
          <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={2}>
            <Typography variant="h6" style={{ fontWeight: 700 }}>{selectedPass.eventName}</Typography>
            <Typography variant="body2" color="textSecondary">
              Date: {new Date(selectedPass.slotDate).toLocaleDateString()} | Time: {selectedPass.startTime}
            </Typography>
            <AppQRCode value={selectedPass.passCode} size={180} />
            <Box mt={2}>
              <Typography variant="body1"><strong>Holder:</strong> {selectedPass.holderName}</Typography>
              <Typography variant="body2" color="textSecondary">Email: {selectedPass.holderEmail}</Typography>
            </Box>
          </Box>
        )}
      </AppModal>
    </DashboardLayout>
  );
};

export default PassesPage;
