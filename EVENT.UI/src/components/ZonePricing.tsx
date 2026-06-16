import React from 'react';
import { Box, Typography, Button, Card, CardContent, IconButton, List, ListItem, ListItemText, Divider, Switch, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AppInput from './AppInput';
import AppDropdown from './AppDropdown';
import AppDatePicker from './AppDatePicker';
import { useForm } from 'react-hook-form';

interface PricingItem {
  zonePricingId: number;
  zoneId: number;
  zoneName: string;
  slotId: number | null;
  slotName: string;
  price: number;
  taxPercentage: number;
  finalPrice: number;
  isEarlyBird: boolean;
  validFrom: string | null;
  validTo: string | null;
}

interface ZonePricingProps {
  pricings: PricingItem[];
  zones: { label: string; value: number }[];
  slots: { label: string; value: number }[];
  onAddPricing: (pricing: any) => void;
  onRemovePricing: (index: number) => void;
}

export const ZonePricing: React.FC<ZonePricingProps> = ({
  pricings,
  zones,
  slots,
  onAddPricing,
  onRemovePricing
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      zoneId: '',
      slotId: '',
      price: 0,
      taxPercentage: 0,
      isEarlyBird: false,
      validFrom: '',
      validTo: '',
      remarks: ''
    }
  });

  const priceVal = Number(watch('price')) || 0;
  const taxVal = Number(watch('taxPercentage')) || 0;
  const finalPriceVal = priceVal + (priceVal * taxVal / 100);

  const onSubmit = (data: any) => {
    const selectedZone = zones.find(z => z.value === Number(data.zoneId));
    const selectedSlot = slots.find(s => s.value === Number(data.slotId));

    onAddPricing({
      zonePricingId: 0,
      zoneId: Number(data.zoneId),
      zoneName: selectedZone?.label || 'Unknown Zone',
      slotId: data.slotId ? Number(data.slotId) : null,
      slotName: selectedSlot?.label || 'All Slots',
      price: priceVal,
      taxPercentage: taxVal,
      finalPrice: finalPriceVal,
      isEarlyBird: !!data.isEarlyBird,
      validFrom: data.validFrom || null,
      validTo: data.validTo || null
    });

    reset({
      zoneId: '',
      slotId: '',
      price: 0,
      taxPercentage: 0,
      isEarlyBird: false,
      validFrom: '',
      validTo: '',
      remarks: ''
    });
  };

  return (
    <Card variant="outlined" style={{ borderRadius: 12 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Zone Seating Pricing Rules</Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <AppDropdown
                label="Target Zone *"
                options={zones}
                value={watch('zoneId')}
                onChange={(e) => setValue('zoneId', e.target.value as any)}
                errorText={errors.zoneId?.message as string}
              />
              <AppDropdown
                label="Target Slot (Optional)"
                options={[{ label: 'All Slots', value: 0 }, ...slots]}
                value={watch('slotId')}
                onChange={(e) => setValue('slotId', e.target.value as any)}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <AppInput
                label="Base Price *"
                type="number"
                register={register('price', { required: 'Price is required' })}
                errorText={errors.price?.message as string}
              />
              <AppInput
                label="Tax Percentage (%)"
                type="number"
                register={register('taxPercentage')}
              />
              <AppInput
                label="Final Ticket Price"
                type="number"
                value={finalPriceVal.toFixed(2)}
                disabled
              />
            </Box>

            <Box sx={{ bgcolor: '#f9fafb', p: 2, borderRadius: 2, border: '1px solid #e5e7eb' }}>
              <FormControlLabel
                control={<Switch checked={!!watch('isEarlyBird')} onChange={(e) => setValue('isEarlyBird', e.target.checked)} />}
                label="Enable Early Bird Pricing"
                sx={{ mb: 2 }}
              />

              {watch('isEarlyBird') && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <AppDatePicker
                    label="Valid From"
                    value={watch('validFrom') || ''}
                    onChange={(e: any) => setValue('validFrom', e.target.value)}
                  />
                  <AppDatePicker
                    label="Valid To"
                    value={watch('validTo') || ''}
                    onChange={(e: any) => setValue('validTo', e.target.value)}
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" style={{ textTransform: 'none', borderRadius: 8 }}>
                Add Pricing Rule
              </Button>
            </Box>
          </Box>
        </form>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Defined Seating Prices ({pricings.length})</Typography>
        {pricings.length === 0 ? (
          <Typography variant="caption" color="textSecondary">No pricing rules added yet.</Typography>
        ) : (
          <List>
            {pricings.map((p, idx) => (
              <ListItem
                key={idx}
                secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => onRemovePricing(idx)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${p.zoneName} — Slot: ${p.slotName}`}
                  secondary={`Base: ₹${p.price.toFixed(2)} | Tax: ${p.taxPercentage}% | Final: ₹${p.finalPrice.toFixed(2)} ${p.isEarlyBird ? `(Early Bird: ${p.validFrom} to ${p.validTo})` : ''}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ZonePricing;
