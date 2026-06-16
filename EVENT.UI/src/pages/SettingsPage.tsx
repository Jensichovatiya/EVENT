import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, IconButton, Switch, FormControlLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DashboardLayout from '../layouts/DashboardLayout';
import AppInput from '../components/AppInput';
import AppDropdown from '../components/AppDropdown';
import AppTable from '../components/AppTable';
import AppModal from '../components/AppModal';
import AppLoader from '../components/AppLoader';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { commonApi, CurrencyItem } from '../api/commonApi';

export const SettingsPage: React.FC = () => {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyItem | null>(null);

  // General settings form
  const generalForm = useForm({
    defaultValues: {
      appName: 'TRACKET EMS',
      supportEmail: 'support@tracket.com',
      taxRate: 18,
      currency: 'INR'
    }
  });

  // Currency form
  const currencyForm = useForm({
    defaultValues: {
      code: '',
      name: '',
      symbol: '',
      exchangeRate: 1.0,
      status: 'Active',
      isDefault: false,
      autoUpdateRate: false
    }
  });

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const res = await commonApi.getCurrencies();
      if (res.success) {
        setCurrencies(res.data || []);
      } else {
        toast.error(res.message || 'Failed to fetch currencies.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error fetching currencies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleOpenAdd = () => {
    setEditingCurrency(null);
    currencyForm.reset({
      code: '',
      name: '',
      symbol: '',
      exchangeRate: 1.0,
      status: 'Active',
      isDefault: false,
      autoUpdateRate: false
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (curr: CurrencyItem) => {
    setEditingCurrency(curr);
    currencyForm.reset({
      code: curr.code,
      name: curr.name,
      symbol: curr.symbol,
      exchangeRate: curr.exchangeRate,
      status: curr.status || 'Active',
      isDefault: !!curr.isDefault,
      autoUpdateRate: !!curr.autoUpdateRate
    });
    setOpenModal(true);
  };

  const onGeneralSubmit = () => {
    toast.success('System configuration saved successfully!');
  };

  const onCurrencySubmit = async (data: any) => {
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = localStorage.getItem('email') || userObj?.emailId || userObj?.email || userObj?.userName || 'system';

      const payload = {
        currencyId: editingCurrency ? editingCurrency.currencyId : 0,
        code: data.code.toUpperCase(),
        name: data.name,
        symbol: data.symbol,
        exchangeRate: Number(data.exchangeRate) || 1.0,
        status: data.status,
        isDefault: !!data.isDefault,
        autoUpdateRate: !!data.autoUpdateRate,
        createdBy: editingCurrency ? editingCurrency.createdBy : userEmail,
        createdFrom: editingCurrency ? editingCurrency.createdFrom : 'WebUI',
        updatedBy: userEmail,
        updatedFrom: 'WebUI'
      };

      const res = await commonApi.addEditCurrency(payload);
      if (res.success) {
        toast.success(res.message || 'Currency saved successfully.');
        setOpenModal(false);
        fetchCurrencies();
      } else {
        toast.error(res.message || 'Failed to save currency.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save currency.');
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code' as keyof CurrencyItem },
    { header: 'Name', accessor: 'name' as keyof CurrencyItem },
    { header: 'Symbol', accessor: 'symbol' as keyof CurrencyItem },
    {
      header: 'Exchange Rate',
      accessor: (row: CurrencyItem) => (row.exchangeRate ? row.exchangeRate.toFixed(4) : '1.0000')
    },
    {
      header: 'Status',
      accessor: (row: CurrencyItem) => (
        <Chip
          label={row.status || 'Active'}
          color={row.status === 'Active' ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      header: 'Default',
      accessor: (row: CurrencyItem) => (
        row.isDefault ? (
          <Chip label="Yes" color="primary" size="small" sx={{ fontWeight: 600 }} />
        ) : (
          <Chip label="No" variant="outlined" size="small" />
        )
      )
    },
    {
      header: 'Actions',
      accessor: (row: CurrencyItem) => (
        <Box>
          <IconButton color="primary" onClick={() => handleOpenEdit(row)} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" style={{ fontWeight: 800 }}>System Configuration & Settings</Typography>
          <Typography variant="body2" color="textSecondary">Manage system values, pricing tax rates, currencies, and basic setups.</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* System Configuration */}
        <Card style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>General Configurations</Typography>
            <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <AppInput label="Application Name" register={generalForm.register('appName')} />
                <AppInput label="Support Email" register={generalForm.register('supportEmail')} />
                <AppInput label="Default Tax Rate (%)" type="number" register={generalForm.register('taxRate')} />
                <AppInput label="System Currency" register={generalForm.register('currency')} />
              </Box>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}>
                  Save Settings
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Currency Management */}
        <Card style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Currencies Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={handleOpenAdd}
                style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}
              >
                Add Currency
              </Button>
            </Box>

            {loading ? (
              <AppLoader />
            ) : (
              <AppTable
                columns={columns as any}
                data={currencies}
                searchPlaceholder="Search Currencies..."
                searchKey="name"
              />
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Add/Edit Modal */}
      <AppModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingCurrency ? 'Edit Currency' : 'Add New Currency'}
      >
        <form onSubmit={currencyForm.handleSubmit(onCurrencySubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <AppInput
                label="Currency Code (e.g. USD)"
                register={currencyForm.register('code', { required: 'Code is required' })}
              />
              <AppInput
                label="Currency Name"
                register={currencyForm.register('name', { required: 'Name is required' })}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <AppInput
                label="Symbol (e.g. $)"
                register={currencyForm.register('symbol', { required: 'Symbol is required' })}
              />
              <AppInput
                label="Exchange Rate (relative to base)"
                type="number"
                inputProps={{ step: '0.000001' }}
                register={currencyForm.register('exchangeRate', { required: 'Exchange Rate is required' })}
              />
            </Box>

            <AppDropdown
              label="Status"
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' }
              ]}
              register={currencyForm.register('status')}
            />

            <Box sx={{ display: 'flex', gap: 4 }}>
              <FormControlLabel
                control={<Switch checked={currencyForm.watch('isDefault')} onChange={(e) => currencyForm.setValue('isDefault', e.target.checked)} />}
                label="Is Default Currency"
              />
              <FormControlLabel
                control={<Switch checked={currencyForm.watch('autoUpdateRate')} onChange={(e) => currencyForm.setValue('autoUpdateRate', e.target.checked)} />}
                label="Auto Update Exchange Rate"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button onClick={() => setOpenModal(false)} variant="outlined" style={{ textTransform: 'none', borderRadius: 8 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" style={{ textTransform: 'none', borderRadius: 8, fontWeight: 600 }}>
                {editingCurrency ? 'Update Currency' : 'Add Currency'}
              </Button>
            </Box>
          </Box>
        </form>
      </AppModal>
    </DashboardLayout>
  );
};

export default SettingsPage;
