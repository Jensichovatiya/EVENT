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
          const sorted = (res.data || []).sort((a: any, b: any) => Number(b.invoiceId) - Number(a.invoiceId));
          setInvoices(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const userRole = localStorage.getItem('userRole');

  let pageTitle = 'My Invoices';
  let pageDescription = 'View your generated invoices and payment receipts.';

  if (userRole === 'SuperAdmin') {
    pageTitle = 'System Invoices (Super Admin)';
    pageDescription = 'View and manage all generated invoices and financial summaries across the system.';
  } else if (userRole === 'Organizer') {
    pageTitle = 'Event Invoices (Organizer)';
    pageDescription = 'View invoices and financial summaries for your organized events.';
  }

  const columns = [
    { header: 'Invoice Number', accessor: 'invoiceNumber' },
    { header: 'Booking Number', accessor: 'bookingNumber' },
    ...(userRole === 'SuperAdmin' || userRole === 'Organizer'
      ? [
          { header: 'Event Name', accessor: (row: any) => row.eventName || 'N/A' },
          { header: 'Customer', accessor: (row: any) => row.customerName || 'N/A' }
        ]
      : [
          { header: 'Event Name', accessor: (row: any) => row.eventName || 'N/A' }
        ]
    ),
    { header: 'SubTotal', accessor: (row: any) => `INR ${row.subTotal}` },
    { header: 'Tax Amount', accessor: (row: any) => `INR ${row.taxAmount}` },
    { header: 'Total Amount', accessor: (row: any) => `INR ${row.totalAmount}` },
    { header: 'Date', accessor: (row: any) => new Date(row.invoiceDate).toLocaleDateString() },
  ];

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>{pageTitle}</Typography>
        <Typography variant="body2" color="textSecondary">{pageDescription}</Typography>
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
