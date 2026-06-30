import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, IconButton, List, ListItem, ListItemText, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AppInput from './AppInput';
import AppDropdown from './AppDropdown';
import { useForm } from 'react-hook-form';
import { commonApi, DropdownOption } from '../api/commonApi';

interface EntryGateItem {
  entryGateId: number;
  gateName: string;
  gateCode: string;
  gateType: string;
  latitude: string;
  longitude: string;
  scannerUserId: number | null;
  remarks: string;
}

interface EntryGateFormProps {
  gates: EntryGateItem[];
  gateTypes: { label: string; value: any }[];
  onAddGate: (gate: any) => void;
  onRemoveGate: (index: number) => void;
}

export const EntryGateForm: React.FC<EntryGateFormProps> = ({
  gates,
  gateTypes,
  onAddGate,
  onRemoveGate
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [users, setUsers] = useState<DropdownOption[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await commonApi.getUserDDL();
        if (res.success && res.data) {
          setUsers(res.data.roles || []); // Fallback to roles or standard list mapping
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadUsers();
  }, []);

  const onSubmit = (data: any) => {
    onAddGate({
      entryGateId: 0,
      gateName: data.gateName,
      gateCode: data.gateCode,
      gateType: data.gateType,
      latitude: data.latitude,
      longitude: data.longitude,
      scannerUserId: data.scannerUserId ? Number(data.scannerUserId) : null,
      remarks: data.remarks || ''
    });
    reset({
      gateName: '',
      gateCode: '',
      gateType: gateTypes[0]?.value || 'Main Entry',
      latitude: '',
      longitude: '',
      scannerUserId: '',
      remarks: ''
    });
  };

  return (
    <Card variant="outlined" style={{ borderRadius: 12 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Entry Gates Setup</Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <AppInput
                label="Gate Name *"
                register={register('gateName', { required: 'Name is required' })}
                errorText={errors.gateName?.message as string}
              />
              <AppInput
                label="Gate Code *"
                register={register('gateCode', { required: 'Code is required' })}
                errorText={errors.gateCode?.message as string}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <AppDropdown
                label="Gate Type"
                options={gateTypes}
                value={watch('gateType') || gateTypes[0]?.value || ''}
                onChange={(e) => setValue('gateType', e.target.value)}
              />
              <AppDropdown
                label="Scanner User"
                options={users.map(u => ({ label: u.label, value: u.value }))}
                value={watch('scannerUserId') || ''}
                onChange={(e) => setValue('scannerUserId', e.target.value)}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <AppInput label="Latitude" register={register('latitude')} />
              <AppInput label="Longitude" register={register('longitude')} />
            </Box>

            <AppInput label="Remarks" register={register('remarks')} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" style={{ textTransform: 'none', borderRadius: 8 }}>
                Add Gate
              </Button>
            </Box>
          </Box>
        </form>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Added Gates ({gates.length})</Typography>
        {gates.length === 0 ? (
          <Typography variant="caption" color="textSecondary">No gates added yet.</Typography>
        ) : (
          <List>
            {gates.map((g, idx) => (
              <ListItem
                key={idx}
                secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => onRemoveGate(idx)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${g.gateName} (${g.gateCode}) — ${g.gateType}`}
                  secondary={g.latitude ? `Coords: ${g.latitude}, ${g.longitude}` : 'No coordinates'}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default EntryGateForm;
