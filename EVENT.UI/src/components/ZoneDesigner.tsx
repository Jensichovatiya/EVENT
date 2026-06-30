import React from 'react';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel } from '@mui/material';
import AppInput from './AppInput';
import AppDropdown from './AppDropdown';
import { UseFormRegisterReturn } from 'react-hook-form';

interface ZoneDesignerProps {
  register: any;
  watch: any;
  setValue: any;
  gates: { label: string; value: any }[];
  zoneTypes: { label: string; value: any }[];
  errors: any;
}

export const ZoneDesigner: React.FC<ZoneDesignerProps> = ({
  register,
  watch,
  setValue,
  gates,
  zoneTypes,
  errors
}) => {

  return (
    <Card variant="outlined" style={{ borderRadius: 12 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Zone Properties</Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppInput
            label="Zone Name *"
            register={register('zoneName', { required: 'Name is required' })}
            errorText={errors.zoneName?.message as string}
          />
          <AppInput
            label="Zone Code *"
            register={register('zoneCode', { required: 'Code is required' })}
            errorText={errors.zoneCode?.message as string}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppDropdown
            label="Zone Type *"
            options={zoneTypes}
            value={watch('zoneType') || 'General'}
            onChange={(e) => setValue('zoneType', e.target.value)}
            errorText={errors.zoneType?.message as string}
          />
          <AppInput
            label="Color Hex (e.g. #3b82f6) *"
            register={register('colorCode', { required: 'Color is required' })}
            errorText={errors.colorCode?.message as string}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
          <AppInput
            label="Seat Price *"
            type="number"
            register={register('seatPrice', { required: 'Price is required' })}
            errorText={errors.seatPrice?.message as string}
          />
          <AppInput
            label="Grid Rows (A-Z)"
            type="number"
            register={register('rowCount')}
          />
          <AppInput
            label="Grid Columns"
            type="number"
            register={register('columnCount')}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppInput
            label="Capacity *"
            type="number"
            register={register('capacity', { required: 'Capacity is required' })}
            errorText={errors.capacity?.message as string}
          />
          <AppDropdown
            label="Entry Gate"
            options={gates}
            value={watch('entryGateId') || ''}
            onChange={(e) => setValue('entryGateId', e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
          <FormControlLabel
            control={<Switch checked={!!watch('isVIP')} onChange={(e) => setValue('isVIP', e.target.checked)} />}
            label="Is VIP"
          />
          <FormControlLabel
            control={<Switch checked={!!watch('isReserved')} onChange={(e) => setValue('isReserved', e.target.checked)} />}
            label="Is Reserved"
          />
          <FormControlLabel
            control={<Switch checked={!!watch('isSeatSelectionAllowed')} onChange={(e) => setValue('isSeatSelectionAllowed', e.target.checked)} />}
            label="Allow Seat Selection"
          />
        </Box>
        
        <AppInput label="Remarks" register={register('remarks')} />
      </CardContent>
    </Card>
  );
};

export default ZoneDesigner;
