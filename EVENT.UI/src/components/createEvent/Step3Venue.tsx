import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Box, Typography, Divider, Button } from '@mui/material';
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
import AppLoader from '../AppLoader';
import AppCheckbox from '../AppCheckbox';
import { RadioGroup, RadioGroupItem } from '@/Ui/radio-group';
import { EP } from './theme';
import { Field, StepHeading, StepLayout, SidebarCard, TipsCard, SummaryLine, Grid } from './parts';
import { VENUE_CATEGORY_OPTIONS, COUNTRY_OPTIONS, PHONE_CODES } from './options';
import { StepProps } from './stepProps';
import { VenueInfo } from './types';
import { eventApi } from '../../api/eventApi';


export const Step3Venue: React.FC<StepProps> = ({ draft, onChange, ddl, errors = {} }) => {
  const v = draft.venue;
  const set = (p: Partial<VenueInfo>) => onChange('venue', { ...v, ...p });
  const setFacility = (id: number, val: boolean) => set({ facilities: { ...v.facilities, [id]: val } });
  const fullAddress = [v.addressLine1, v.addressLine2, v.city, v.state, v.zip].filter(Boolean).join(', ');
  const [loadingFac, setLoadingFac] = useState(false);
  const [dbFacilities, setDbFacilities] = useState<{ facilityId: number; facilityName: string }[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const lookupZip = async (zipCode: string) => {
    if (!zipCode || zipCode.trim().length < 5) return;
    try {
      toast.loading('Fetching location for zip code...');
      let res = await fetch(`/zip-api/api/location/byzipcode?zipCode=${zipCode.trim()}`);
      const contentType = res.headers.get('content-type') || '';
      
      if (!res.ok || !contentType.includes('application/json')) {
        console.warn('Backend ZIP API failed or returned HTML, trying public fallback...');
        if (zipCode.trim().length === 6 && /^\d+$/.test(zipCode.trim())) {
          res = await fetch(`https://api.postalpincode.in/pincode/${zipCode.trim()}`);
        } else if (zipCode.trim().length === 5 && /^\d+$/.test(zipCode.trim())) {
          res = await fetch(`https://api.zippopotam.us/us/${zipCode.trim()}`);
        }
      }

      toast.dismiss();

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }

      const json = await res.json();

      if (json && json.places && json.places.length > 0) {
        const place = json.places[0];
        set({
          city: place["place name"] || v.city,
          state: place["state"] || v.state,
          country: "United States"
        });
        toast.success(`Location auto-filled: ${place["place name"]}, ${place["state"]}`);
        return;
      }

      if (Array.isArray(json) && json.length > 0 && json[0].Status === 'Success' && json[0].PostOffice && json[0].PostOffice.length > 0) {
        const firstOffice = json[0].PostOffice[0];
        set({
          city: firstOffice.District || v.city,
          state: firstOffice.State || v.state,
          country: "India"
        });
        toast.success(`Location auto-filled: ${firstOffice.District}, ${firstOffice.State}`);
        return;
      }

      if (json.success && json.data && json.data.length > 0) {
        const loc = json.data[0];
        set({
          city: loc.city_name || v.city,
          state: loc.state_name || v.state,
          country: loc.country_name || v.country
        });
        toast.success(`Location auto-filled: ${loc.city_name}, ${loc.state_name}`);
      } else {
        toast.error(json.message || 'No data found for this zip code');
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error('Error fetching location for zip code.');
      console.error('Error fetching zip location:', error);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const updates: Partial<VenueInfo> = {
          latitude,
          longitude,
        };

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const addr = data.address;
              const road = addr.road || addr.pedestrian || addr.suburb || '';
              const neighbourhood = addr.neighbourhood || addr.suburb || addr.city_district || '';
              
              updates.addressLine1 = [addr.house_number, road].filter(Boolean).join(' ');
              updates.addressLine2 = neighbourhood;
              updates.city = addr.city || addr.town || addr.village || addr.municipality || '';
              updates.state = addr.state || addr.region || '';
              updates.zip = addr.postcode || '';
              updates.mapQuery = data.display_name || '';

              let resolvedCountry = addr.country || '';
              if (resolvedCountry.toLowerCase().includes('india')) {
                resolvedCountry = 'India';
              } else if (resolvedCountry.toLowerCase().includes('united states')) {
                resolvedCountry = 'United States';
              } else if (resolvedCountry.toLowerCase().includes('united arab emirates')) {
                resolvedCountry = 'United Arab Emirates';
              } else if (resolvedCountry.toLowerCase().includes('united kingdom')) {
                resolvedCountry = 'United Kingdom';
              } else if (resolvedCountry.toLowerCase().includes('singapore')) {
                resolvedCountry = 'Singapore';
              }

              const validCountry = COUNTRY_OPTIONS.find(c => c.value === resolvedCountry);
              if (validCountry) {
                updates.country = validCountry.value;
              }
            }
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
        } finally {
          set({ ...updates });
          setLoadingLoc(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enable location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Request to get user location timed out.';
        }
        alert(errorMsg);
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    setLoadingFac(true);
    eventApi.getFacilities().then(res => {
      if (res.success && res.data) {
        setDbFacilities(res.data);
      }
    }).catch(err => {
      console.error('Failed to load facilities:', err);
    }).finally(() => {
      setLoadingFac(false);
    });
  }, []);

  return (
    <StepLayout
      main={
        <>
          <StepHeading title="Venue & Location" subtitle="Provide the venue details and exact location of your event." />

          <Field label="Venue Type" sx={{ mb: 2 }}>
            <RadioGroup
              value={v.venueType}
              onValueChange={(val) => set({ venueType: val as VenueInfo['venueType'] })}
              className="flex flex-row gap-6 mt-1"
            >
              {(ddl?.venueTypes && ddl.venueTypes.length > 0
                ? ddl.venueTypes.map(t => [t.value.toLowerCase(), `${t.label} Event`])
                : [['physical', 'Physical Event'], ['virtual', 'Virtual Event'], ['hybrid', 'Hybrid Event']]
              ).map(([val, lbl]) => {
                const itemId = `venueType-${val}`;
                return (
                  <div key={val} className="flex items-center gap-2">
                    <RadioGroupItem value={val} id={itemId} />
                    <label htmlFor={itemId} className="text-sm font-medium leading-none cursor-pointer select-none text-foreground">
                      {lbl}
                    </label>
                  </div>
                );
              })}
            </RadioGroup>
          </Field>

          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem', mb: 2 }}>Venue Details</Typography>
          <Grid cols={3}>
            <Field label="Venue Name" required>
              <AppInput placeholder="e.g. Convention Centre" value={v.venueName} errorText={errors.venueName} onChange={(e) => set({ venueName: e.target.value })} />
            </Field>
            <Field label="Venue Category" required>
              <AppDropdown
                label="Category"
                options={ddl?.venueCategories && ddl.venueCategories.length > 0
                  ? ddl.venueCategories.map(c => ({ label: c.label, value: c.value }))
                  : VENUE_CATEGORY_OPTIONS
                }
                value={v.venueCategory}
                onChange={(e) => set({ venueCategory: e.target.value as string })}
              />
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
              <AppInput 
                placeholder="000000" 
                value={v.zip} 
                errorText={errors.zip} 
                onChange={(e) => set({ zip: e.target.value })} 
                onKeyDown={(e) => { if (e.key === 'Tab') { lookupZip(v.zip); } }}
                onBlur={() => lookupZip(v.zip)}
              />
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
            <Button
              variant="outlined"
              startIcon={<MyLocationIcon />}
              onClick={handleUseMyLocation}
              disabled={loadingLoc}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap', borderColor: EP.line, color: EP.primary }}
            >
              {loadingLoc ? 'Locating...' : 'Use My Location'}
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
            {loadingFac ? (
            <AppLoader message="Retrieving facilities..." />
          ) : dbFacilities.length === 0 ? (
            <Typography sx={{ color: EP.muted, fontSize: '0.82rem', mt: 1, mb: 1 }}>
              No facilities found in master. Go to <strong>Venue Facilities</strong> in the sidebar to add some, then come back.
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 0.5 }}>
              {dbFacilities.map((f: any) => {
                return (
                  <AppCheckbox
                    key={f.facilityId}
                    label={f.facilityName}
                    checked={!!v.facilities[f.facilityId]}
                    onCheckedChange={(val) => setFacility(f.facilityId, val)}
                  />
                );
              })}
            </Box>
          )}

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
