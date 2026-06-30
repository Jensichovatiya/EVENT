import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { paymentApi } from '../api/paymentApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';
import StatusChip from '../components/StatusChip';
import { toast } from 'sonner';

export const PaymentListPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getPayments();
      if (res.success) {
        const sorted = (res.data || []).sort((a: any, b: any) => Number(b.paymentId) - Number(a.paymentId));
        setPayments(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (paymentId: number, amount: number) => {
    if (!window.confirm('Are you sure you want to process this refund?')) return;
    try {
      const res = await paymentApi.refundPayment({ paymentId, refundAmount: amount, refundReason: 'User requested refund' });
      toast.success(res.message || 'Refund successfully processed');
      fetchPayments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to refund payment');
    }
  };

  const columns = [
    { header: 'Transaction No', accessor: 'transactionNo' },
    { header: 'Payment Mode', accessor: 'paymentMode' },
    { header: 'Amount', accessor: (row: any) => `INR ${row.amount}` },
    { header: 'Refunded Amount', accessor: (row: any) => `INR ${row.refundAmount || 0}` },
    { header: 'Date', accessor: (row: any) => new Date(row.paymentDate).toLocaleDateString() },
    { header: 'Status', accessor: (row: any) => <StatusChip status={row.status} type="payment" /> },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.status === 1 && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => handleRefund(row.paymentId, row.amount)}
              style={{ textTransform: 'none', borderRadius: 6, fontWeight: 600 }}
            >
              Refund
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Transactions & Payments</Typography>
        <Typography variant="body2" color="textSecondary">View payment history and process transaction refunds.</Typography>
      </Box>

      {loading ? (
        <AppLoader message="Loading payments..." />
      ) : (
        <AppTable
          columns={columns}
          data={payments}
          searchKey="transactionNo"
          searchPlaceholder="Search by transaction number..."
        />
      )}
    </DashboardLayout>
  );
};

export default PaymentListPage;
