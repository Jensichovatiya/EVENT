import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { invoiceApi } from '../api/invoiceApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppTable from '../components/AppTable';
import AppLoader from '../components/AppLoader';

export const InvoiceListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await invoiceApi.getInvoices();
        if (res.success) {
          setInvoices(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const columns = [
    { header: 'Invoice Number', accessor: 'invoiceNumber' },
    { header: 'Booking Number', accessor: 'bookingNumber' },
    { header: 'SubTotal', accessor: (row: any) => `INR ${row.subTotal}` },
    { header: 'Tax Amount', accessor: (row: any) => `INR ${row.taxAmount}` },
    { header: 'Total Amount', accessor: (row: any) => `INR ${row.totalAmount}` },
    { header: 'Date', accessor: (row: any) => new Date(row.invoiceDate).toLocaleDateString() },
  ];

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>Invoice Logs</Typography>
        <Typography variant="body2" color="textSecondary">View generated invoices and financial summaries.</Typography>
      </Box>

      {loading ? (
        <AppLoader message="Loading invoices..." />
      ) : (
        <AppTable
          columns={columns}
          data={invoices}
          searchKey="invoiceNumber"
          searchPlaceholder="Search by invoice number..."
        />
      )}
    </DashboardLayout>
  );
};

export default InvoiceListPage;
