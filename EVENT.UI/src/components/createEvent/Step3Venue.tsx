import React from 'react';
import { Box, Typography, Divider, RadioGroup, FormControlLabel, Radio, Checkbox, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PlaceIcon from '@mui/icons-material/Place';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import AppTextarea from '../AppTextarea';
import { EP } from './theme';
import { Field, StepHeading, StepLayout, SidebarCard, TipsCard, SummaryLine, Grid } from './parts';
import { VENUE_CATEGORY_OPTIONS, COUNTRY_OPTIONS, PHONE_CODES } from './options';
import { StepProps } from './stepProps';
import { VenueInfo } from './types';

const FACILITIES: { key: string; label: string }[] = [
  { key: 'wifi', label: 'Wi-Fi' }, { key: 'parking', label: 'Parking' }, { key: 'wheelchair', label: 'Wheelchair Access' },
  { key: 'ac', label: 'Air Conditioning' }, { key: 'audio', label: 'Audio / Sound System' }, { key: 'projector', label: 'Projector / Screen' },
  { key: 'stage', label: 'Stage' }, { key: 'greenRoom', label: 'Green Room' }, { key: 'catering', label: 'Catering Area' },
  { key: 'powerBackup', label: 'Power Backup' }, { key: 'restrooms', label: 'Restrooms' }, { key: 'lodging', label: 'Lodging Nearby' },
  { key: 'exhibition', label: 'Exhibition Space' }, { key: 'security', label: 'Security' },
];

export const Step3Venue: React.FC<StepProps> = ({ draft, onChange, errors = {} }) => {
  const v = draft.venue;
  const set = (p: Partial<VenueInfo>) => onChange('venue', { ...v, ...p });
  const setFacility = (key: string, val: boolean) => set({ facilities: { ...v.facilities, [key]: val } });
  const fullAddress = [v.addressLine1, v.addressLine2, v.city, v.state, v.zip].filter(Boolean).join(', ');

  return (
    <StepLayout
      main={
        <>
          <StepHeading title="Venue & Location" subtitle="Provide the venue details and exact location of your event." />

          <Field label="Venue Type" sx={{ mb: 2 }}>
            <RadioGroup row value={v.venueType} onChange={(e) => set({ venueType: e.target.value as VenueInfo['venueType'] })}>
              {[['physical', 'Physical Event'], ['virtual', 'Virtual Event'], ['hybrid', 'Hybrid Event']].map(([val, lbl]) => (
                <FormControlLabel key={val} value={val} control={<Radio sx={{ '&.Mui-checked': { color: EP.primary } }} />} label={<Typography sx={{ fontSize: '0.88rem' }}>{lbl}</Typography>} />
              ))}
            </RadioGroup>
          </Field>

          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem', mb: 2 }}>Venue Details</Typography>
          <Grid cols={3}>
            <Field label="Venue Name" required>
              <AppInput placeholder="e.g. Convention Centre" value={v.venueName} errorText={errors.venueName} onChange={(e) => set({ venueName: e.target.value })} />
            </Field>
            <Field label="Venue Category" required>
              <AppDropdown label="Category" options={VENUE_CATEGORY_OPTIONS} value={v.venueCategory} onChange={(e) => set({ venueCategory: e.target.value as string })} />
            </Field>
            <Field label="Venue Capacity" helper="Maximum expected capacity">
              <AppInput type="number" placeholder="5000" value={v.venueCapacity} onChange={(e) => set({ venueCapacity: e.target.value === '' ? '' : Number(e.target.value) })} />
            </Field>
          </Grid>

          <Grid cols={2} sx={{ mt: 2.5 }}>
            <Field label="Address Line 1" required>
              <AppInput placeholder="Street, building" value={v.addressLine1} errorText={errors.addressLine1} onChange={(e) => set({ addressLine1: e.target.value })} />
            </Field>
            <Field label="Address Line 2 (Optional)">
              <AppInput placeholder="Area, post" value={v.addressLine2} onChange={(e) => set({ addressLine2: e.target.value })} />
            </Field>
          </Grid>

          <Grid cols={4} sx={{ mt: 2.5 }}>
            <Field label="City" required>
              <AppInput placeholder="City" value={v.city} errorText={errors.city} onChange={(e) => set({ city: e.target.value })} />
            </Field>
            <Field label="State / Province" required>
              <AppInput placeholder="State" value={v.state} errorText={errors.state} onChange={(e) => set({ state: e.target.value })} />
            </Field>
            <Field label="Country" required>
              <AppDropdown label="Country" options={COUNTRY_OPTIONS} value={v.country} onChange={(e) => set({ country: e.target.value as string })} />
            </Field>
            <Field label="ZIP / Postal Code" required>
              <AppInput placeholder="000000" value={v.zip} errorText={errors.zip} onChange={(e) => set({ zip: e.target.value })} />
            </Field>
          </Grid>

          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem', mt: 3, mb: 1 }}>Location on Map</Typography>
          <Typography sx={{ color: EP.muted, fontSize: '0.8rem', mb: 1.5 }}>Select the exact location of the venue.</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
            <AppInput
              placeholder="Search location..."
              value={v.mapQuery}
              onChange={(e) => set({ mapQuery: e.target.value })}
              slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: EP.faint, mr: 1 }} /> } } as any}
            />
            <Button variant="outlined" startIcon={<MyLocationIcon />} sx={{ textTransform: 'none', whiteSpace: 'nowrap', borderColor: EP.line, color: EP.primary }}>
              Use My Location
            </Button>
          </Box>
          <MapPlaceholder label={v.venueName || 'Map preview'} />

          <Grid cols={2} sx={{ mt: 2.5 }}>
            <Field label="Latitude">
              <AppInput type="number" placeholder="12.9716" value={v.latitude} onChange={(e) => set({ latitude: e.target.value === '' ? '' : Number(e.target.value) })} />
            </Field>
            <Field label="Longitude">
              <AppInput type="number" placeholder="77.5946" value={v.longitude} onChange={(e) => set({ longitude: e.target.value === '' ? '' : Number(e.target.value) })} />
            </Field>
          </Grid>

          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem', mt: 3, mb: 2 }}>Venue Contact (On-Site)</Typography>
          <Grid cols={4}>
            <Field label="Contact Person" required>
              <AppInput placeholder="Full name" value={v.contactPerson} onChange={(e) => set({ contactPerson: e.target.value })} />
            </Field>
            <Field label="Designation">
              <AppInput placeholder="Venue Manager" value={v.contactDesignation} onChange={(e) => set({ contactDesignation: e.target.value })} />
            </Field>
            <Field label="Phone" required>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ width: 90 }}>
                  <AppDropdown label="Code" options={PHONE_CODES} value={v.contactPhoneCode} onChange={(e) => set({ contactPhoneCode: e.target.value as string })} />
                </Box>
                <AppInput placeholder="98765 43210" value={v.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
              </Box>
            </Field>
            <Field label="Email" required>
              <AppInput placeholder="info@venue.com" value={v.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
            </Field>
          </Grid>

          <Typography sx={{ color: EP.text, fontWeight: 700, fontSize: '0.9rem', mt: 3, mb: 1.5 }}>
            Venue Facilities & Features <Box component="span" sx={{ color: EP.faint, fontWeight: 400, fontSize: '0.8rem' }}>(Select all that apply)</Box>
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 0.5 }}>
            {FACILITIES.map((f) => (
              <FormControlLabel
                key={f.key}
                control={<Checkbox checked={!!v.facilities[f.key]} onChange={(e) => setFacility(f.key, e.target.checked)} sx={{ '&.Mui-checked': { color: EP.primary } }} />}
                label={<Typography sx={{ fontSize: '0.82rem' }}>{f.label}</Typography>}
              />
            ))}
            <FormControlLabel
              control={<Checkbox checked={!!v.otherFacility} sx={{ '&.Mui-checked': { color: EP.primary } }} disabled />}
              label={<AppInput placeholder="Other: specify" value={v.otherFacility} onChange={(e) => set({ otherFacility: e.target.value })} sx={{ '& .MuiInputBase-root': { height: 36 } }} />}
            />
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <Field label="Venue Notes (Optional)">
              <AppTextarea rows={3} placeholder="Any additional information about the venue, access instructions, parking, nearby landmarks, etc." value={v.notes} inputProps={{ maxLength: 500 }} helperText={`${v.notes.length}/500`} onChange={(e) => set({ notes: e.target.value })} />
            </Field>
          </Box>
        </>
      }
      rail={
        <>
          <SidebarCard title="Venue Summary">
            <SummaryLine icon={<StorefrontOutlinedIcon sx={{ fontSize: 18 }} />} label="Venue Name" value={v.venueName} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<PlaceIcon sx={{ fontSize: 18 }} />} label="Address" value={fullAddress} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />} label="Capacity" value={v.venueCapacity ? `${v.venueCapacity} People` : ''} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<CategoryOutlinedIcon sx={{ fontSize: 18 }} />} label="Venue Type" value={v.venueType[0].toUpperCase() + v.venueType.slice(1) + ' Event'} />
          </SidebarCard>

          <SidebarCard title="Map Preview">
            <MapPlaceholder label={v.venueName || 'Map preview'} small />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5, color: EP.primary, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              Open in Google Maps <OpenInNewIcon sx={{ fontSize: 15 }} />
            </Box>
          </SidebarCard>

          <TipsCard
            tips={[
              'Ensure the venue capacity is more than your expected attendance.',
              'Add accurate address to help attendees find the venue easily.',
              'You can update venue details anytime before publishing.',
            ]}
          />
        </>
      }
    />
  );
};

const MapPlaceholder: React.FC<{ label: string; small?: boolean }> = ({ label, small }) => (
  <Box
    sx={{
      position: 'relative', height: small ? 140 : 260, borderRadius: `${EP.radiusSm}px`,
      background: 'linear-gradient(135deg, #EAF1F7 0%, #E7EEF4 100%)',
      border: `1px solid ${EP.line}`, overflow: 'hidden',
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0 1px, transparent 1px 28px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
  >
    <Box sx={{ textAlign: 'center' }}>
      <PlaceIcon sx={{ color: EP.red, fontSize: small ? 28 : 40 }} />
      <Typography sx={{ fontSize: '0.78rem', color: EP.muted, fontWeight: 600 }}>{label}</Typography>
    </Box>
  </Box>
);

export default Step3Venue;
