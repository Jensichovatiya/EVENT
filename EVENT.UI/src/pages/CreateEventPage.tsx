import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Stepper, Step, StepLabel, Typography, Button,
  IconButton, List, ListItem, ListItemText, Divider, Card, CardContent,
  Switch, FormControlLabel, Chip, Avatar
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { eventBasicSchema, eventLocationSchema } from '../validations/schemas';
import { eventApi } from '../api/eventApi';
import { commonApi } from '../api/commonApi';
import DashboardLayout from '../layouts/DashboardLayout';
import AppInput from '../components/AppInput';
import AppTextarea from '../components/AppTextarea';
import AppDropdown from '../components/AppDropdown';
import AppDatePicker from '../components/AppDatePicker';
import AppUpload from '../components/AppUpload';
import AppLoader from '../components/AppLoader';
import { ROUTES } from '../constants/appConstants';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import MapIcon from '@mui/icons-material/Map';
import EventIcon from '@mui/icons-material/Event';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PublishIcon from '@mui/icons-material/Publish';

import { EventBlueprintStep } from '../components/EventBlueprintStep';

const steps = [
  'Basic Details',
  'Location & Venue',
  'Media & Uploads',
  'Social Links',
  'Slot Management',
  'Blueprint & Zones',
  'Review & Publish'
];

const stepIcons: Record<number, React.ReactNode> = {
  0: <EventIcon />,
  1: <MapIcon />,
  2: <ImageIcon />,
  3: <LinkIcon />,
  4: <EventIcon />,
  5: <CheckCircleIcon />,
};

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

    // Form states
  const [eventData, setEventData] = useState<any>({
    eventId: 0,
    eventRId: '',
    eventName: '',
    eventCode: '',
    categoryId: '',
    eventSubCategoryId: '',
    about: '',
    description: '',
    termsAndConditions: '',
    listingType: 1,
    bookingType: 1,
    currency: 'INR',
    eventType: 1,
    ticketPrice: 0,
    capacity: 100,
    isBookingAccept: true,
    isPassBookingActive: true,
    isPublishActive: false,
    locationName: '',
    address: '',
    locationId: 0,
    venueName: '',
    addressLine1: '',
    addressLine2: '',
    areaName: '',
    landmark: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
    googleMapLink: '',
    hallName: '',
    groundName: '',
    parkingAvailable: false,
    parkingDetails: '',
    countryId: '',
    stateId: '',
    cityId: '',
    // Social links
    facebookLink: '',
    websiteLink: '',
    youtubeLink: '',
    instagramLink: '',
    twitterLink: '',
    linkedInLink: '',
    pintrestLink: '',
    userId: null,
    slots: [],
    // Booking Configuration Fields
    minBookingQty: null,
    maxBookingQty: null,
    maxBookingPerUser: null,
    allowGroupBooking: false,
    allowMultipleDateBooking: false,
    maxGroupMember: null,
    bookingStartDate: '',
    bookingEndDate: '',
    allowSeatSelection: false,
    allowMultiSlotBooking: false,
  });

  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<{ label: string; value: number }[]>([]);
  const [subCategories, setSubCategories] = useState<{ label: string; value: number }[]>([]);
  const [dropdowns, setDropdowns] = useState<any>({
    currencies: [],
    listingTypes: [],
    bookingTypes: [],
    eventTypes: []
  });

  // File uploads per category
  const [logoFile, setLogoFile] = useState<File[]>([]);
  const [bannerFile, setBannerFile] = useState<File[]>([]);
  const [blueprintFile, setBlueprintFile] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // Slots
  const [slots, setSlots] = useState<any[]>([]);
  const [newSlot, setNewSlot] = useState({ slotDate: '', startTime: '09:00', endTime: '18:00', capacity: 100 });

  // Hook Form for Step 1
  const { register: regBasic, handleSubmit: handleBasic, watch: watchBasic, setValue: setValueBasic, formState: { errors: errorsBasic } } = useForm({
    resolver: yupResolver(eventBasicSchema),
    values: eventData
  });

  const selectedCategoryId = watchBasic ? watchBasic('categoryId') : undefined;

  useEffect(() => {
    const loadDropdownsAndCategories = async () => {
      try {
        const dropRes = await commonApi.getEventDropdowns();
        if (dropRes.success && dropRes.data) {
          setDropdowns({
            currencies: dropRes.data.currencies.map((c: any) => ({ label: `${c.label} (${c.symbol})`, value: c.code })),
            listingTypes: dropRes.data.listingTypes,
            bookingTypes: dropRes.data.bookingTypes,
            eventTypes: dropRes.data.eventTypes
          });
        }

        const res = await eventApi.getCategories();
        if (res.success && res.data) {
          setAllCategories(res.data);
          const parents = res.data.filter((c: any) => c.parentCategoryId === 0 || !c.parentCategoryId);
          setParentCategories(parents.map((c: any) => ({ label: c.categoryName, value: c.categoryId })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadDropdownsAndCategories();

    if (id) {
      const loadEvent = async () => {
        setInitialLoading(true);
        try {
          const res = await eventApi.getEvents(id);
          if (res.success && res.data) {
            const ev = res.data;
            setEventData({
              eventId: ev.eventId,
              eventRId: ev.eventRId || '',
              eventName: ev.eventName,
              eventCode: ev.eventCode,
              categoryId: ev.categoryId,
              eventSubCategoryId: ev.eventSubCategoryId || '',
              about: ev.about || '',
              description: ev.description || '',
              termsAndConditions: ev.termsAndConditions || '',
              listingType: ev.listingType || 1,
              bookingType: ev.bookingType || 1,
              currency: ev.currency || 'INR',
              eventType: ev.eventType || 1,
              ticketPrice: ev.ticketPrice || 0,
              capacity: ev.capacity || 100,
              isBookingAccept: ev.isBookingAccept ?? true,
              isPassBookingActive: ev.isPassBookingActive ?? true,
              isPublishActive: ev.isPublishActive ?? false,
              locationName: ev.locationName || '',
              address: ev.address || '',
              locationId: ev.locationId || 0,
              venueName: ev.venueName || '',
              addressLine1: ev.addressLine1 || '',
              addressLine2: ev.addressLine2 || '',
              areaName: ev.areaName || '',
              landmark: ev.landmark || '',
              pincode: ev.pincode || '',
              latitude: ev.latitude || 0,
              longitude: ev.longitude || 0,
              googleMapLink: ev.googleMapLink || '',
              hallName: ev.hallName || '',
              groundName: ev.groundName || '',
              parkingAvailable: !!ev.parkingAvailable,
              parkingDetails: ev.parkingDetails || '',
              countryId: ev.countryId || '',
              stateId: ev.stateId || '',
              cityId: ev.cityId || '',
              facebookLink: ev.facebookLink || '',
              websiteLink: ev.websiteLink || '',
              youtubeLink: ev.youtubeLink || '',
              instagramLink: ev.instagramLink || '',
              twitterLink: ev.twitterLink || '',
              linkedInLink: ev.linkedInLink || '',
              pintrestLink: ev.pintrestLink || '',
              userId: ev.userId || null,
              // Booking Configuration Fields
              minBookingQty: ev.minBookingQty ?? null,
              maxBookingQty: ev.maxBookingQty ?? null,
              maxBookingPerUser: ev.maxBookingPerUser ?? null,
              allowGroupBooking: !!ev.allowGroupBooking,
              allowMultipleDateBooking: !!ev.allowMultipleDateBooking,
              maxGroupMember: ev.maxGroupMember ?? null,
              bookingStartDate: ev.bookingStartDate ? ev.bookingStartDate.substring(0, 10) : '',
              bookingEndDate: ev.bookingEndDate ? ev.bookingEndDate.substring(0, 10) : '',
              allowSeatSelection: !!ev.allowSeatSelection,
              allowMultiSlotBooking: !!ev.allowMultiSlotBooking,
            });
            setSlots(ev.slots || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setInitialLoading(false);
        }
      };
      loadEvent();
    }
  }, [id]);

  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = allCategories.filter((c: any) => c.parentCategoryId === Number(selectedCategoryId));
      setSubCategories(filtered.map((c: any) => ({ label: c.categoryName, value: c.categoryId })));
      // Reset subcategory if it is no longer valid
      if (setValueBasic && eventData.eventSubCategoryId) {
        const isValidSub = filtered.some((c: any) => c.categoryId === Number(eventData.eventSubCategoryId));
        if (!isValidSub) {
          setValueBasic('eventSubCategoryId', '');
        }
      }
    } else {
      setSubCategories([]);
    }
  }, [selectedCategoryId, allCategories, setValueBasic, eventData.eventSubCategoryId]);

  // Hook Form for Step 2
  const { register: regLoc, handleSubmit: handleLoc, watch: watchLoc, setValue: setValueLoc, formState: { errors: errorsLoc } } = useForm({
    resolver: yupResolver(eventLocationSchema),
    values: eventData
  });

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onBasicSubmit = (data: any) => {
    const basicKeys = [
      'eventName', 'eventCode', 'categoryId', 'eventSubCategoryId', 'ticketPrice', 
      'capacity', 'currency', 'listingType', 'bookingType', 'eventType', 'about', 
      'termsAndConditions'
    ];
    const filteredBasic: any = {};
    basicKeys.forEach(k => {
      if (data[k] !== undefined) filteredBasic[k] = data[k];
    });
    setEventData((prev: any) => ({ ...prev, ...filteredBasic }));
    handleNext();
  };

  const onBasicErrors = (errs: any) => {
    console.error('Basic Details Validation Errors:', errs);
    toast.error('Validation failed. Please verify required fields: ' + Object.keys(errs).join(', '));
  };

  const onLocSubmit = async (data: any) => {
    const locationKeys = [
      'venueName', 'addressLine1', 'addressLine2', 'areaName', 'landmark', 
      'pincode', 'latitude', 'longitude', 'googleMapLink', 'hallName', 
      'groundName', 'parkingAvailable', 'parkingDetails', 'countryId', 
      'stateId', 'cityId'
    ];
    const filteredLoc: any = {};
    locationKeys.forEach(k => {
      if (data[k] !== undefined) filteredLoc[k] = data[k];
    });

    const enriched = {
      ...eventData,
      ...filteredLoc,
      locationName: filteredLoc.venueName || data.venueName || eventData.locationName,
      address: filteredLoc.addressLine1 || data.addressLine1 || eventData.address
    };
    setEventData(enriched);

    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = localStorage.getItem('email') || userObj?.emailId || userObj?.email || userObj?.userName || 'system';
      const userIdVal = Number(localStorage.getItem('userId') || 0);

      const formData = new FormData();
      const payload = {
        ...enriched,
        slots,
        userId: userIdVal > 0 ? userIdVal : null,
        createdBy: enriched.eventId > 0 ? enriched.createdBy : userEmail,
        createdFrom: enriched.eventId > 0 ? enriched.createdFrom : 'WebUI',
        updatedBy: userEmail,
        updatedFrom: 'WebUI'
      };

      formData.append('model', JSON.stringify(payload));

      const res = await eventApi.addEditEvent(formData);
      if (res.success && res.data) {
        toast.success(res.message || 'Event draft saved successfully.');
        setEventData((prev: any) => ({
          ...prev,
          eventId: res.data.eventId,
          eventRId: res.data.eventRId
        }));
        handleNext();
      } else {
        toast.error(res.message || 'Failed to save event draft.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save event draft.');
    } finally {
      setLoading(false);
    }
  };

  const onLocErrors = (errs: any) => {
    console.error('Location Details Validation Errors:', errs);
    toast.error('Location Validation failed: ' + Object.keys(errs).join(', '));
  };

  const handleAddSlot = () => {
    if (!newSlot.slotDate) {
      toast.error('Please select a date for the slot.');
      return;
    }
    setSlots([...slots, { ...newSlot, slotId: 0 }]);
    setNewSlot({ slotDate: '', startTime: '09:00', endTime: '18:00', capacity: eventData.capacity });
    toast.success('Slot added successfully!');
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
    toast.success('Slot removed.');
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = localStorage.getItem('email') || userObj?.emailId || userObj?.email || userObj?.userName || 'system';
      const userIdVal = Number(localStorage.getItem('userId') || 0);

      const formData = new FormData();
      
      const payload = {
        ...eventData,
        slots,
        userId: userIdVal > 0 ? userIdVal : null,
        createdBy: eventData.eventId > 0 ? eventData.createdBy : userEmail,
        createdFrom: eventData.eventId > 0 ? eventData.createdFrom : 'WebUI',
        updatedBy: userEmail,
        updatedFrom: 'WebUI'
      };

      formData.append('model', JSON.stringify(payload));

      // Append files by category
      logoFile.forEach((file) => formData.append('attachments', file));
      bannerFile.forEach((file) => formData.append('attachments', file));
      blueprintFile.forEach((file) => formData.append('attachments', file));
      documentFiles.forEach((file) => formData.append('attachments', file));
      galleryFiles.forEach((file) => formData.append('attachments', file));

      const res = await eventApi.addEditEvent(formData);
      toast.success(res.message || 'Event published successfully!');
      navigate(ROUTES.EVENTS);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  const totalFiles = logoFile.length + bannerFile.length + blueprintFile.length + documentFiles.length + galleryFiles.length;

  if (initialLoading) {
    return (
      <DashboardLayout>
        <AppLoader message="Loading event details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" style={{ fontWeight: 800 }}>
          {id ? 'Edit Event' : 'Create New Event'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Complete all 6 steps below to configure and publish your event.
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              icon={
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: index <= activeStep ? '#3b82f6' : '#e5e7eb',
                    color: index <= activeStep ? '#fff' : '#9ca3af',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {index < activeStep ? <CheckCircleIcon fontSize="small" /> : index + 1}
                </Avatar>
              }
            >
              <Typography variant="caption" style={{ fontWeight: index === activeStep ? 700 : 400 }}>
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>

          {/* ============ STEP 0: Basic Details ============ */}
          {activeStep === 0 && (
            <form onSubmit={handleBasic(onBasicSubmit, onBasicErrors)}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Event Basic Information
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <AppInput
                  label="Event Name *"
                  register={regBasic('eventName')}
                  errorText={errorsBasic.eventName?.message as string}
                  placeholder="e.g. Tech Summit 2026"
                />
                <AppInput
                  label="Event Code *"
                  register={regBasic('eventCode')}
                  errorText={errorsBasic.eventCode?.message as string}
                  placeholder="e.g. TECH-2026"
                />
                <AppDropdown
                  label="Category *"
                  options={parentCategories}
                  register={regBasic('categoryId')}
                  value={watchBasic('categoryId') ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setValueBasic('categoryId', val);
                    setValueBasic('eventSubCategoryId', '');
                  }}
                  errorText={errorsBasic.categoryId?.message as string}
                />
                <AppDropdown
                  label="Subcategory"
                  options={subCategories}
                  register={regBasic('eventSubCategoryId')}
                  value={watchBasic('eventSubCategoryId') ?? ''}
                  onChange={(e) => setValueBasic('eventSubCategoryId', e.target.value)}
                  errorText={errorsBasic.eventSubCategoryId?.message as string}
                />
                <AppInput
                  label="Ticket Price *"
                  type="number"
                  register={regBasic('ticketPrice')}
                  errorText={errorsBasic.ticketPrice?.message as string}
                  placeholder="0"
                />
                <AppInput
                  label="Total Capacity *"
                  type="number"
                  register={regBasic('capacity')}
                  errorText={errorsBasic.capacity?.message as string}
                  placeholder="100"
                />
                <AppDropdown
                  label="Currency"
                  options={dropdowns.currencies}
                  register={regBasic('currency')}
                  value={watchBasic('currency') ?? 'INR'}
                  onChange={(e) => setValueBasic('currency', e.target.value)}
                />
                <AppDropdown
                  label="Listing Type *"
                  options={dropdowns.listingTypes}
                  register={regBasic('listingType')}
                  value={watchBasic('listingType') ?? ''}
                  onChange={(e) => setValueBasic('listingType', Number(e.target.value))}
                  errorText={errorsBasic.listingType?.message as string}
                />
                <AppDropdown
                  label="Booking Type *"
                  options={dropdowns.bookingTypes}
                  register={regBasic('bookingType')}
                  value={watchBasic('bookingType') ?? ''}
                  onChange={(e) => setValueBasic('bookingType', Number(e.target.value))}
                  errorText={errorsBasic.bookingType?.message as string}
                />
                <AppDropdown
                  label="Event Type *"
                  options={dropdowns.eventTypes}
                  register={regBasic('eventType')}
                  value={watchBasic('eventType') ?? ''}
                  onChange={(e) => setValueBasic('eventType', Number(e.target.value))}
                  errorText={errorsBasic.eventType?.message as string}
                />
              </Box>

              <Box sx={{ mt: 3, display: 'grid', gap: 2.5 }}>
                <AppTextarea
                  label="About Event *"
                  register={regBasic('about')}
                  errorText={errorsBasic.about?.message as string}
                  placeholder="Describe your event in detail..."
                />
                <AppTextarea
                  label="Terms & Conditions *"
                  register={regBasic('termsAndConditions')}
                  errorText={errorsBasic.termsAndConditions?.message as string}
                  placeholder="Enter terms and conditions..."
                />
              </Box>

              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 4 }}
                >
                  Next: Location Details
                </Button>
              </Box>
            </form>
          )}

          {/* ============ STEP 1: Location & Venue ============ */}
          {activeStep === 1 && (
            <form onSubmit={handleLoc((data) => {
              onLocSubmit(data);
            }, onLocErrors)}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Venue & Location Details
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <AppInput
                  label="Venue Name *"
                  register={regLoc('venueName')}
                  errorText={errorsLoc.venueName?.message as string}
                  placeholder="e.g. Convention Center Hall A"
                />
                <AppInput
                  label="Address Line 1 *"
                  register={regLoc('addressLine1')}
                  errorText={errorsLoc.addressLine1?.message as string}
                  placeholder="Street, building name"
                />
                <AppInput
                  label="Address Line 2"
                  register={regLoc('addressLine2')}
                  errorText={errorsLoc.addressLine2?.message as string}
                  placeholder="Suite, unit, etc."
                />
                <AppInput
                  label="Area Name"
                  register={regLoc('areaName')}
                  errorText={errorsLoc.areaName?.message as string}
                  placeholder="Neighborhood or sector"
                />
                <AppInput
                  label="Landmark"
                  register={regLoc('landmark')}
                  errorText={errorsLoc.landmark?.message as string}
                  placeholder="e.g. Near Central Park"
                />
                <AppInput
                  label="Pincode *"
                  register={regLoc('pincode')}
                  errorText={errorsLoc.pincode?.message as string}
                  placeholder="Zip/Postal code"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2.5, mt: 2.5 }}>
                <AppInput
                  label="Country *"
                  register={regLoc('countryId')}
                  errorText={errorsLoc.countryId?.message as string}
                  placeholder="e.g. India"
                />
                <AppInput
                  label="State *"
                  register={regLoc('stateId')}
                  errorText={errorsLoc.stateId?.message as string}
                  placeholder="e.g. Gujarat"
                />
                <AppInput
                  label="City *"
                  register={regLoc('cityId')}
                  errorText={errorsLoc.cityId?.message as string}
                  placeholder="e.g. Ahmedabad"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mt: 2.5 }}>
                <AppInput
                  label="Latitude *"
                  type="number"
                  register={regLoc('latitude')}
                  errorText={errorsLoc.latitude?.message as string}
                  placeholder="e.g. 23.0225"
                />
                <AppInput
                  label="Longitude *"
                  type="number"
                  register={regLoc('longitude')}
                  errorText={errorsLoc.longitude?.message as string}
                  placeholder="e.g. 72.5714"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mt: 2.5 }}>
                <AppInput
                  label="Hall Name"
                  register={regLoc('hallName')}
                  errorText={errorsLoc.hallName?.message as string}
                  placeholder="e.g. Grand Ballroom"
                />
                <AppInput
                  label="Ground Name"
                  register={regLoc('groundName')}
                  errorText={errorsLoc.groundName?.message as string}
                  placeholder="e.g. Main Cricket Ground"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 2.5, mt: 2.5 }}>
                <AppInput
                  label="Google Map Link"
                  register={regLoc('googleMapLink')}
                  errorText={errorsLoc.googleMapLink?.message as string}
                  placeholder="https://maps.google.com/..."
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' }, gap: 2.5, mt: 2.5, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!watchLoc('parkingAvailable')}
                      onChange={(e) => setValueLoc('parkingAvailable', e.target.checked)}
                    />
                  }
                  label={<Typography sx={{ color: '#1f2937', fontWeight: 500, fontSize: '0.875rem' }}>Parking Available</Typography>}
                />
                <AppInput
                  label="Parking Details"
                  register={regLoc('parkingDetails')}
                  errorText={errorsLoc.parkingDetails?.message as string}
                  placeholder="e.g. Valet parking, capacity 500 cars"
                />
              </Box>

              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 4 }}
                >
                  Next: Media Upload
                </Button>
              </Box>
            </form>
          )}

          {/* ============ STEP 2: Media & Uploads ============ */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Upload Event Media
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Upload your event logo, banner image, venue blueprint, gallery images and supporting documents.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Event Logo */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ImageIcon sx={{ color: '#3b82f6' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Event Logo
                      </Typography>
                      <Chip label="1 file" size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5 }}>
                      Square image recommended (PNG/JPG, max 2MB)
                    </Typography>
                    <AppUpload onChange={(files) => setLogoFile(files)} />
                  </CardContent>
                </Card>

                {/* Event Banner */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ImageIcon sx={{ color: '#8b5cf6' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Banner Image
                      </Typography>
                      <Chip label="1 file" size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5 }}>
                      Wide banner (1200×400 recommended, PNG/JPG)
                    </Typography>
                    <AppUpload onChange={(files) => setBannerFile(files)} />
                  </CardContent>
                </Card>

                {/* Blueprint / Floor Plan */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <MapIcon sx={{ color: '#10b981' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Venue Blueprint / Floor Plan
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5 }}>
                      Upload seating layout or floor plan (PDF/PNG/JPG)
                    </Typography>
                    <AppUpload onChange={(files) => setBlueprintFile(files)} />
                  </CardContent>
                </Card>

                {/* Gallery Images */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ImageIcon sx={{ color: '#f59e0b' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Gallery Images
                      </Typography>
                      <Chip label="Multiple" size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5 }}>
                      Upload event gallery photos (PNG/JPG, max 5MB each)
                    </Typography>
                    <AppUpload onChange={(files) => setGalleryFiles(files)} multiple />
                  </CardContent>
                </Card>
              </Box>

              {/* Documents */}
              <Card variant="outlined" sx={{ borderRadius: 2, mt: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <DescriptionIcon sx={{ color: '#ef4444' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Supporting Documents
                    </Typography>
                    <Chip label="Multiple" size="small" variant="outlined" />
                  </Box>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5 }}>
                    Upload brochures, agreements, permits, or any other supporting documents (PDF/DOC/XLSX)
                  </Typography>
                  <AppUpload onChange={(files) => setDocumentFiles(files)} multiple />
                </CardContent>
              </Card>

              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
                  Back
                </Button>
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 4 }}>
                  Next: Social Links
                </Button>
              </Box>
            </Box>
          )}

          {/* ============ STEP 3: Social Links ============ */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Social Media & Website Links
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Add social media and promotional links for your event. These will be displayed on the public event page.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <AppInput
                  label="Website URL"
                  value={eventData.websiteLink}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, websiteLink: e.target.value }))}
                  placeholder="https://www.example.com"
                />
                <AppInput
                  label="Facebook Page"
                  value={eventData.facebookLink}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, facebookLink: e.target.value }))}
                  placeholder="https://facebook.com/event-page"
                />
                <AppInput
                  label="Instagram Handle"
                  value={eventData.instagramLink}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, instagramLink: e.target.value }))}
                  placeholder="https://instagram.com/event"
                />
                <AppInput
                  label="YouTube Channel"
                  value={eventData.youtubeLink}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, youtubeLink: e.target.value }))}
                  placeholder="https://youtube.com/@event"
                />
                <AppInput
                  label="Twitter / X Profile"
                  value={eventData.twitterLink}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, twitterLink: e.target.value }))}
                  placeholder="https://x.com/event"
                />
                <AppInput
                  label="LinkedIn Page"
                  value={eventData.linkedInLink}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, linkedInLink: e.target.value }))}
                  placeholder="https://linkedin.com/company/event"
                />
                <AppInput
                  label="Pinterest"
                  value={eventData.pintrestLink}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, pintrestLink: e.target.value }))}
                  placeholder="https://pinterest.com/event"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Booking Settings
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventData.isBookingAccept}
                      onChange={(e) => setEventData((prev: any) => ({ ...prev, isBookingAccept: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ color: '#1f2937', fontWeight: 500, fontSize: '0.875rem' }}>Accept Bookings</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventData.isPassBookingActive}
                      onChange={(e) => setEventData((prev: any) => ({ ...prev, isPassBookingActive: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ color: '#1f2937', fontWeight: 500, fontSize: '0.875rem' }}>Pass Booking Active</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventData.isPublishActive}
                      onChange={(e) => setEventData((prev: any) => ({ ...prev, isPublishActive: e.target.checked }))}
                      color="success"
                    />
                  }
                  label={<Typography sx={{ color: '#1f2937', fontWeight: 500, fontSize: '0.875rem' }}>Publish Immediately</Typography>}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* ---- Booking Rules ---- */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#3b82f6' }}>
                Booking Rules &amp; Configuration
              </Typography>

              {/* Quantity Limits */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Quantity Limits
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2.5, mt: 1, mb: 2.5 }}>
                <AppInput
                  label="Min Booking Qty"
                  type="number"
                  value={eventData.minBookingQty ?? ''}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, minBookingQty: e.target.value === '' ? null : Number(e.target.value) }))}
                  placeholder="e.g. 1"
                />
                <AppInput
                  label="Max Booking Qty"
                  type="number"
                  value={eventData.maxBookingQty ?? ''}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, maxBookingQty: e.target.value === '' ? null : Number(e.target.value) }))}
                  placeholder="e.g. 10"
                />
                <AppInput
                  label="Max Booking Per User"
                  type="number"
                  value={eventData.maxBookingPerUser ?? ''}
                  onChange={(e) => setEventData((prev: any) => ({ ...prev, maxBookingPerUser: e.target.value === '' ? null : Number(e.target.value) }))}
                  placeholder="e.g. 5"
                />
              </Box>

              {/* Booking Window */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Booking Window
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mt: 1, mb: 2.5 }}>
                <AppDatePicker
                  label="Booking Start Date"
                  value={eventData.bookingStartDate}
                  onChange={(e: any) => setEventData((prev: any) => ({ ...prev, bookingStartDate: e.target.value }))}
                />
                <AppDatePicker
                  label="Booking End Date"
                  value={eventData.bookingEndDate}
                  onChange={(e: any) => setEventData((prev: any) => ({ ...prev, bookingEndDate: e.target.value }))}
                />
              </Box>

              {/* Group Booking */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Group Booking
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventData.allowGroupBooking}
                      onChange={(e) => setEventData((prev: any) => ({ ...prev, allowGroupBooking: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ color: '#1f2937', fontWeight: 500, fontSize: '0.875rem' }}>Allow Group Booking</Typography>}
                />
              </Box>
              {eventData.allowGroupBooking && (
                <Box sx={{ mb: 2.5 }}>
                  <AppInput
                    label="Max Group Members"
                    type="number"
                    value={eventData.maxGroupMember ?? ''}
                    onChange={(e) => setEventData((prev: any) => ({ ...prev, maxGroupMember: e.target.value === '' ? null : Number(e.target.value) }))}
                    placeholder="e.g. 20"
                  />
                </Box>
              )}

              {/* Feature Toggles */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Feature Options
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventData.allowMultipleDateBooking}
                      onChange={(e) => setEventData((prev: any) => ({ ...prev, allowMultipleDateBooking: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ color: '#1f2937', fontWeight: 500, fontSize: '0.875rem' }}>Allow Multiple Date Booking</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventData.allowSeatSelection}
                      onChange={(e) => setEventData((prev: any) => ({ ...prev, allowSeatSelection: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ color: '#1f2937', fontWeight: 500, fontSize: '0.875rem' }}>Allow Seat Selection</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventData.allowMultiSlotBooking}
                      onChange={(e) => setEventData((prev: any) => ({ ...prev, allowMultiSlotBooking: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label={<Typography sx={{ color: '#1f2937', fontWeight: 500, fontSize: '0.875rem' }}>Allow Multi-Slot Booking</Typography>}
                />
              </Box>

              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
                  Back
                </Button>
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 4 }}>
                  Next: Slot Management
                </Button>
              </Box>
            </Box>
          )}

          {/* ============ STEP 4: Slot Management ============ */}
          {activeStep === 4 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Manage Event Slots
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Create time slots with date, start/end times and capacity. You can add multiple slots for multi-day events.
              </Typography>

              {/* Add New Slot */}
              <Card variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 3, bgcolor: '#f9fafb' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Add New Slot
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
                  <AppDatePicker
                    label="Slot Date"
                    value={newSlot.slotDate}
                    onChange={(e: any) => setNewSlot({ ...newSlot, slotDate: e.target.value })}
                  />
                  <AppInput
                    label="Start Time"
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <AppInput
                    label="End Time"
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <AppInput
                    label="Capacity"
                    type="number"
                    value={newSlot.capacity}
                    onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value, 10) || 0 })}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddSlot}
                    startIcon={<AddIcon />}
                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, height: 56 }}
                  >
                    Add
                  </Button>
                </Box>
              </Card>

              {/* Existing Slots */}
              {slots.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, border: '2px dashed #e5e7eb', borderRadius: 2 }}>
                  <EventIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    No slots added yet. Use the form above to create event time slots.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Added Slots ({slots.length})
                  </Typography>
                  <List sx={{ bgcolor: '#fff', borderRadius: 2 }}>
                    {slots.map((s, idx) => (
                      <React.Fragment key={idx}>
                        <ListItem
                          secondaryAction={
                            <IconButton onClick={() => handleRemoveSlot(idx)} color="error" size="small">
                              <DeleteIcon />
                            </IconButton>
                          }
                          sx={{ py: 1.5 }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label={`Day ${idx + 1}`} size="small" color="primary" variant="outlined" />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {s.slotDate} &nbsp;|&nbsp; {s.startTime} – {s.endTime}
                                </Typography>
                              </Box>
                            }
                            secondary={`Capacity: ${s.capacity} attendees`}
                          />
                        </ListItem>
                        {idx < slots.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
                  Back
                </Button>
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 4 }}>
                  Next: Blueprint & Zones
                </Button>
              </Box>
            </Box>
          )}

          {/* ============ STEP 5: Blueprint & Zones ============ */}
          {activeStep === 5 && (
            <EventBlueprintStep
              eventId={eventData.eventId}
              slots={slots.map((s, idx) => ({ label: `Slot ${idx + 1}: ${s.slotDate} (${s.startTime} - ${s.endTime})`, value: s.slotId || idx + 1 }))}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {/* ============ STEP 6: Review & Publish ============ */}
          {activeStep === 6 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Review & Publish Your Event
              </Typography>

              {/* Summary Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

                {/* Basic Info Card */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#3b82f6', mb: 2 }}>
                      Basic Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <ReviewRow label="Event Name" value={eventData.eventName} />
                      <ReviewRow label="Event Code" value={eventData.eventCode} />
                      <ReviewRow label="Ticket Price" value={`${eventData.currency} ${eventData.ticketPrice}`} />
                      <ReviewRow label="Capacity" value={eventData.capacity} />
                      <ReviewRow label="Event Type" value={eventData.eventType === 1 ? 'Physical' : eventData.eventType === 2 ? 'Online' : 'Hybrid'} />
                      <ReviewRow label="Listing" value={eventData.listingType === 1 ? 'Public' : eventData.listingType === 2 ? 'Private' : 'Invite Only'} />
                      <ReviewRow label="Booking" value={eventData.bookingType === 1 ? 'Free' : eventData.bookingType === 2 ? 'Paid' : 'Donation'} />
                    </Box>
                  </CardContent>
                </Card>

                {/* Venue Card */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10b981', mb: 2 }}>
                      Venue Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <ReviewRow label="Venue" value={eventData.locationName} />
                      <ReviewRow label="Address" value={eventData.address} />
                      <ReviewRow label="Coordinates" value={`${eventData.latitude}, ${eventData.longitude}`} />
                    </Box>
                  </CardContent>
                </Card>

                {/* Files Card */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8b5cf6', mb: 2 }}>
                      Uploaded Media
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <ReviewRow label="Logo" value={logoFile.length > 0 ? logoFile.map(f => f.name).join(', ') : 'Not uploaded'} />
                      <ReviewRow label="Banner" value={bannerFile.length > 0 ? bannerFile.map(f => f.name).join(', ') : 'Not uploaded'} />
                      <ReviewRow label="Blueprint" value={blueprintFile.length > 0 ? blueprintFile.map(f => f.name).join(', ') : 'Not uploaded'} />
                      <ReviewRow label="Gallery" value={galleryFiles.length > 0 ? `${galleryFiles.length} file(s)` : 'Not uploaded'} />
                      <ReviewRow label="Documents" value={documentFiles.length > 0 ? `${documentFiles.length} file(s)` : 'Not uploaded'} />
                      <ReviewRow label="Total Files" value={`${totalFiles} file(s)`} />
                    </Box>
                  </CardContent>
                </Card>

                {/* Slots Card */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f59e0b', mb: 2 }}>
                      Event Slots
                    </Typography>
                    {slots.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">No slots configured.</Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {slots.map((s, idx) => (
                          <Typography key={idx} variant="body2">
                            <strong>Slot {idx + 1}:</strong> {s.slotDate} &nbsp;|&nbsp; {s.startTime} – {s.endTime} ({s.capacity} seats)
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Social Links Summary */}
              {(eventData.websiteLink || eventData.facebookLink || eventData.instagramLink) && (
                <Card variant="outlined" sx={{ borderRadius: 2, mt: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6366f1', mb: 2 }}>
                      Social Links
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {eventData.websiteLink && <Chip label={`Website`} size="small" color="primary" variant="outlined" />}
                      {eventData.facebookLink && <Chip label={`Facebook`} size="small" color="primary" variant="outlined" />}
                      {eventData.instagramLink && <Chip label={`Instagram`} size="small" color="secondary" variant="outlined" />}
                      {eventData.youtubeLink && <Chip label={`YouTube`} size="small" color="error" variant="outlined" />}
                      {eventData.twitterLink && <Chip label={`Twitter/X`} size="small" variant="outlined" />}
                      {eventData.linkedInLink && <Chip label={`LinkedIn`} size="small" color="info" variant="outlined" />}
                      {eventData.pintrestLink && <Chip label={`Pinterest`} size="small" color="error" variant="outlined" />}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* About Preview */}
              {eventData.about && (
                <Card variant="outlined" sx={{ borderRadius: 2, mt: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      About
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {eventData.about}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
                  Back to Edit
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handlePublish}
                  disabled={loading}
                  startIcon={<PublishIcon />}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 5, py: 1.5, fontSize: '1rem' }}
                >
                  {loading ? 'Publishing...' : (id ? 'Update Event' : 'Publish Event')}
                </Button>
              </Box>
            </Box>
          )}

        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

/* Helper component for review rows */
const ReviewRow: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>
      {value || '—'}
    </Typography>
  </Box>
);

export default CreateEventPage;
