import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Card, CardContent, List, ListItem, ListItemText, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Checkbox
} from '@mui/material';
import { eventApi } from '../api/eventApi';
import { bookingApi } from '../api/bookingApi';
import { paymentApi } from '../api/paymentApi';
import { blueprintApi, Zone, ZoneSeat } from '../api/blueprintApi';
import { passApi } from '../api/passApi';
import { commonApi } from '../api/commonApi';
import { toast } from 'sonner';
import DashboardLayout from '../layouts/DashboardLayout';
import AppLoader from '../components/AppLoader';
import StatusChip from '../components/StatusChip';
import { ROUTES } from '../constants/appConstants';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Booking Dialog State
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<number | ''>('');
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [createdBookings, setCreatedBookings] = useState<any[]>([]);
  const [bookingSlots, setBookingSlots] = useState<any[]>([]);
  const [ticketQty, setTicketQty] = useState<number>(1);
  const [attendees, setAttendees] = useState<Array<{ attendeeName: string; email: string; phoneNumber: string; seatNo: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [generatedPasses, setGeneratedPasses] = useState<any[]>([]);
  const [loadingPasses, setLoadingPasses] = useState(false);
  const [selectedPassForModal, setSelectedPassForModal] = useState<any | null>(null);

  // Payment Hold State
  const [holdTimer, setHoldTimer] = useState<number>(600);
  const [isHoldExpired, setIsHoldExpired] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<string>('CARD');
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  // Dynamic Blueprint, Zone and Seat States
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [seats, setSeats] = useState<ZoneSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState<string[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [availableSeatsCount, setAvailableSeatsCount] = useState<number>(0);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await eventApi.getEvents(id);
        if (res.success) {
          setEvent(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handleOpenBooking = async () => {
    // Pre-populate first attendee with logged-in user details if available
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    setBookingSlots(event.slots || []);
    const initialSlotId = event.slots && event.slots.length > 0 ? event.slots[0].slotId : '';
    setSelectedSlotId(initialSlotId);
    setSelectedSlotIds(initialSlotId ? [Number(initialSlotId)] : []);
    setTicketQty(event.minBookingQty || 1);
    setAttendees([
      {
        attendeeName: currentUser?.userName || '',
        email: currentUser?.email || '',
        phoneNumber: currentUser?.mobileNo || '',
        seatNo: ''
      }
    ]);

    // Reset selection states
    setBlueprints([]);
    setZones([]);
    setSelectedZoneId('');
    setSelectedZone(null);
    setSeats([]);
    setSelectedSeats([]);
    setBookedSeatNumbers([]);
    setActiveStep(0);
    setBookingSuccess(null);
    setCreatedBookings([]);
    setBookingOpen(true);

    try {
      const ddlRes = await commonApi.getBookingDDL();
      if (ddlRes.success && ddlRes.data) {
        const slotsFromDDL = ddlRes.data.eventSlots.filter((s: any) => s.eventId === Number(event.eventId));
        setBookingSlots(slotsFromDDL);
        if (slotsFromDDL.length > 0) {
          if (!slotsFromDDL.some((s: any) => s.slotId === selectedSlotId)) {
            const defaultSlot = slotsFromDDL[0].slotId;
            setSelectedSlotId(defaultSlot);
            setSelectedSlotIds([Number(defaultSlot)]);
          }
        }
        const eventZones: Zone[] = ddlRes.data.zones
          .filter((z: any) => z.eventId === Number(event.eventId))
          .map((z: any) => ({
            zoneId: z.value,
            zoneName: z.label,
            zoneRId: '',
            blueprintId: z.blueprintId,
            eventId: z.eventId,
            zoneCode: '',
            zoneType: '',
            colorCode: '',
            capacity: z.capacity,
            rowCount: 0,
            columnCount: 0,
            seatPrice: z.seatPrice,
            isVIP: false,
            isReserved: false,
            isSeatSelectionAllowed: true,
            entryGateId: null,
            sortOrder: 0,
            remarks: '',
            isActive: true
          }));
        setZones(eventZones);
        if (eventZones.length > 0) {
          setSelectedZoneId(eventZones[0].zoneId);
          setSelectedZone(eventZones[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load event zones via booking/ddl:', err);
    }
  };

  // Load seats layout and availability dynamically when Slot and Zone are selected
  useEffect(() => {
    const fetchAvailability = async () => {
      const slotsToFetch = (event?.allowMultipleDateBooking || event?.allowMultiSlotBooking)
        ? selectedSlotIds.filter(Boolean)
        : [Number(selectedSlotId)].filter(Boolean);

      if (!bookingOpen || slotsToFetch.length === 0 || selectedZoneId === '') {
        setAvailableSeatsCount(0);
        return;
      }
      setLoadingSeats(true);
      try {
        const [seatsRes, ...availResponses] = await Promise.all([
          blueprintApi.getSeatsByZone(Number(selectedZoneId)),
          ...slotsToFetch.map(slotId => bookingApi.checkSeatAvailability(Number(event.eventId), slotId))
        ]);

        let unionBookedList: string[] = [];
        availResponses.forEach(res => {
          if (res.success && res.data && res.data.bookedSeatNumbers) {
            unionBookedList = Array.from(new Set([...unionBookedList, ...res.data.bookedSeatNumbers]));
          }
        });
        setBookedSeatNumbers(unionBookedList);

        const minQty = event.minBookingQty && event.minBookingQty > 0 ? Number(event.minBookingQty) : 1;

        if (seatsRes.success && seatsRes.data && seatsRes.data.length > 0) {
          setSeats(seatsRes.data);
          const totalZoneSeats = seatsRes.data.length;
          const bookedZoneSeats = seatsRes.data.filter(s => unionBookedList.includes(s.seatNumber) || s.isBooked).length;
          const availCount = totalZoneSeats - bookedZoneSeats;
          setAvailableSeatsCount(availCount > 0 ? availCount : 0);
          if (availCount === 0) {
            setTicketQty(0);
            toast.error('This zone is sold out for one or more of the selected slots.');
          } else {
            setTicketQty(prev => prev >= minQty && prev <= availCount ? prev : minQty <= availCount ? minQty : availCount);
          }
        } else {
          setSeats([]);
          // Fallback to zone capacity and slot capacity if no specific seats are configured
          let minAvailSeats = selectedZone ? selectedZone.capacity : 0;
          availResponses.forEach(res => {
            if (res.success && res.data) {
              minAvailSeats = Math.min(minAvailSeats, res.data.availableSeats || 0);
            }
          });
          const availCount = minAvailSeats;
          setAvailableSeatsCount(availCount > 0 ? availCount : 0);
          if (availCount === 0) {
            setTicketQty(0);
            toast.error('This zone is sold out for one or more of the selected slots.');
          } else {
            setTicketQty(prev => prev >= minQty && prev <= availCount ? prev : minQty <= availCount ? minQty : availCount);
          }
        }
      } catch (err) {
        console.error('Failed to load seat availability:', err);
        setAvailableSeatsCount(selectedZone ? selectedZone.capacity : 0);
      } finally {
        setLoadingSeats(false);
      }
    };

    fetchAvailability();
  }, [bookingOpen, selectedSlotId, selectedSlotIds, selectedZoneId, event?.eventId, selectedZone]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCloseBooking = async () => {
    if (!submitting && !processingPayment) {
      const bookingsToRelease = createdBookings.length > 0 ? createdBookings : (bookingSuccess ? [bookingSuccess] : []);
      if (bookingsToRelease.length > 0 && activeStep === 4) {
        setProcessingPayment(true);
        try {
          for (const booking of bookingsToRelease) {
            if (booking?.bookingRId) {
              await bookingApi.cancelBooking(booking.bookingRId, 'Checkout closed by user');
            }
          }
          toast.info('Booking holds cancelled and seats released.');
        } catch (e) {
          console.error('Failed to release seats on close:', e);
        } finally {
          setProcessingPayment(false);
        }
      }
      setBookingOpen(false);
    }
  };

  const handleZoneChange = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    const zone = zones.find(z => z.zoneId === zoneId);
    setSelectedZone(zone || null);
  };

  const handleAttendeeChange = (index: number, field: string, value: string) => {
    setAttendees(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSeatClick = (seatNo: string) => {
    if (bookedSeatNumbers.includes(seatNo)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatNo)) {
        return prev.filter(s => s !== seatNo);
      } else {
        if (prev.length >= ticketQty) {
          toast.warning(`You can select at most ${ticketQty} seat(s).`);
          return prev;
        }
        return [...prev, seatNo];
      }
    });
  };

  const getQuantityLimits = () => {
    const minQty = event?.minBookingQty && event.minBookingQty > 0 ? Number(event.minBookingQty) : 1;
    let maxQty = event?.maxBookingQty && event.maxBookingQty > 0 ? Number(event.maxBookingQty) : 10;
    
    if (event?.allowGroupBooking && event.maxGroupMember && event.maxGroupMember > 0) {
      maxQty = Number(event.maxGroupMember);
    }
    
    const capMax = Math.min(maxQty, availableSeatsCount);
    return { minQty, maxQty: capMax > 0 ? capMax : minQty };
  };

  const getBookingCount = () => {
    return (event?.allowMultipleDateBooking || event?.allowMultiSlotBooking) ? selectedSlotIds.filter(Boolean).length : 1;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const slotsToFetch = (event?.allowMultipleDateBooking || event?.allowMultiSlotBooking)
        ? selectedSlotIds.filter(Boolean)
        : [Number(selectedSlotId)].filter(Boolean);

      if (slotsToFetch.length === 0) {
        toast.error('Please select at least one slot.');
        return;
      }
      if (selectedZoneId === '') {
        toast.error('Please select a zone.');
        return;
      }
      const { minQty, maxQty } = getQuantityLimits();
      if (!ticketQty || ticketQty < minQty) {
        toast.error(`Please select ticket quantity. Minimum is ${minQty}.`);
        return;
      }
      if (ticketQty > maxQty) {
        toast.error(`Maximum ticket quantity allowed is ${maxQty}.`);
        return;
      }
      if (ticketQty > availableSeatsCount) {
        toast.error(`Only ${availableSeatsCount} ticket(s) are available in this zone.`);
        return;
      }

      if (event.allowSeatSelection === false) {
        // Seat selection is disabled, generate automatic/placeholder seat numbers
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const placeholderSeats = Array.from({ length: ticketQty }, (_, i) => `GEN-${randomSuffix}-${i + 1}`);
        setSelectedSeats(placeholderSeats);

        // Prepopulate attendees
        setAttendees(prev => {
          const next = [];
          const userStr = localStorage.getItem('user');
          const currentUser = userStr ? JSON.parse(userStr) : null;

          for (let i = 0; i < ticketQty; i++) {
            const seat = placeholderSeats[i];
            const existing = prev[i] || { attendeeName: '', email: '', phoneNumber: '' };
            next.push({
              attendeeName: i === 0 && !existing.attendeeName ? (currentUser?.userName || '') : existing.attendeeName,
              email: i === 0 && !existing.email ? (currentUser?.email || '') : existing.email,
              phoneNumber: i === 0 && !existing.phoneNumber ? (currentUser?.mobileNo || '') : existing.phoneNumber,
              seatNo: seat
            });
          }
          return next;
        });

        setActiveStep(2); // Skip Step 1
      } else {
        if (seats.length === 0) {
          toast.error('No seating layout configured for this zone.');
          return;
        }
        setSelectedSeats([]);
        setActiveStep(1);
      }
    } else if (activeStep === 1) {
      if (selectedSeats.length !== ticketQty) {
        toast.error(`Please select exactly ${ticketQty} seat(s). Currently selected: ${selectedSeats.length}`);
        return;
      }

      setAttendees(prev => {
        const next = [];
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;

        for (let i = 0; i < ticketQty; i++) {
          const seat = selectedSeats[i];
          const existing = prev[i] || { attendeeName: '', email: '', phoneNumber: '' };
          next.push({
            attendeeName: i === 0 && !existing.attendeeName ? (currentUser?.userName || '') : existing.attendeeName,
            email: i === 0 && !existing.email ? (currentUser?.email || '') : existing.email,
            phoneNumber: i === 0 && !existing.phoneNumber ? (currentUser?.mobileNo || '') : existing.phoneNumber,
            seatNo: seat
          });
        }
        return next;
      });

      setActiveStep(2);
    } else if (activeStep === 2) {
      for (let i = 0; i < attendees.length; i++) {
        const att = attendees[i];
        if (!att.attendeeName.trim()) {
          toast.error(`Please enter the name of Attendee ${i + 1} (Seat ${att.seatNo}).`);
          return;
        }
        if (!att.email.trim() || !/\S+@\S+\.\S+/.test(att.email)) {
          toast.error(`Please enter a valid email for Attendee ${i + 1} (Seat ${att.seatNo}).`);
          return;
        }
        if (!att.phoneNumber.trim()) {
          toast.error(`Please enter the phone number of Attendee ${i + 1} (Seat ${att.seatNo}).`);
          return;
        }
      }
      setActiveStep(3);
    }
  };

  const handleBack = () => {
    if (activeStep === 2 && event.allowSeatSelection === false) {
      setActiveStep(0);
    } else {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      // Release any previously created holds in this dialog session to avoid self-conflict
      const bookingsToRelease = createdBookings.length > 0 ? createdBookings : (bookingSuccess ? [bookingSuccess] : []);
      for (const oldBooking of bookingsToRelease) {
        if (oldBooking?.bookingRId) {
          try {
            await bookingApi.cancelBooking(oldBooking.bookingRId, 'Re-creating booking hold');
          } catch (e) {
            console.error('Failed to cancel old hold:', e);
          }
        }
      }
      setCreatedBookings([]);
      setBookingSuccess(null);

      const currentUserIdStr = localStorage.getItem('userId') || '0';
      const userId = Number(currentUserIdStr);
      const ticketPriceVal = selectedZone ? selectedZone.seatPrice : (event.ticketPrice || 0);

      const slotsToBook = (event?.allowMultipleDateBooking || event?.allowMultiSlotBooking)
        ? selectedSlotIds.filter(Boolean)
        : [Number(selectedSlotId)].filter(Boolean);

      if (slotsToBook.length === 0) {
        toast.error('No slot selected for booking.');
        setSubmitting(false);
        return;
      }

      // Calculate total amount across all slots/dates
      const baseAmount = ticketQty * ticketPriceVal * slotsToBook.length;

      const payload = {
        bookingId: 0,
        bookingRId: "",
        eventId: Number(event.eventId),
        slotId: slotsToBook[0], // fallback SlotId
        selectedSlotIds: slotsToBook, // array of all selected slot IDs
        zoneId: Number(selectedZoneId),
        userId: userId,
        totalTickets: ticketQty,
        bookingStatus: 0, // 0 = Temporary Hold / Pending Payment
        totalAmount: baseAmount,
        createdBy: localStorage.getItem('userName') || "Visitor",
        createdFrom: "Frontend Web",
        updatedBy: "",
        updatedFrom: "",
        attendees: attendees.map(a => ({
          attendeeName: a.attendeeName.trim(),
          email: a.email.trim(),
          phoneNumber: a.phoneNumber.trim(),
          seatNo: a.seatNo
        }))
      };

      const res = await bookingApi.createBooking(payload);
      if (res.success && res.data) {
        setCreatedBookings([res.data]);
        setBookingSuccess(res.data);
        setHoldTimer(600); // 10 minutes hold
        setIsHoldExpired(false);
        setActiveStep(4); // Advance to payment gateway step
        toast.success('Seats are temporarily held for 10 minutes. Please complete payment.');
      } else {
        toast.error(res.message || 'Failed to hold seats.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred during hold creation.');
    } finally {
      setSubmitting(false);
    }
  };

  // Payment Hold Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (bookingOpen && activeStep === 4 && holdTimer > 0 && !isHoldExpired) {
      interval = setInterval(() => {
        setHoldTimer(prev => {
          if (prev <= 1) {
            setIsHoldExpired(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bookingOpen, activeStep, holdTimer, isHoldExpired]);

  // Fetch generated passes from database when payment is confirmed and step 5 is reached
  useEffect(() => {
    const fetchGeneratedPasses = async () => {
      if (activeStep === 5 && (createdBookings.length > 0 || bookingSuccess)) {
        setLoadingPasses(true);
        try {
          const currentUserIdStr = localStorage.getItem('userId') || '0';
          const userId = Number(currentUserIdStr);
          const res = await passApi.getUserPasses(userId);
          if (res.success && res.data) {
            // Filter passes for all bookings in the list
            const bookingIds = createdBookings.length > 0
              ? createdBookings.map(b => b.bookingId)
              : [bookingSuccess.bookingId];
            const filtered = res.data.filter((p: any) => bookingIds.includes(p.bookingId));
            setGeneratedPasses(filtered);
          }
        } catch (err) {
          console.error("Error fetching generated passes:", err);
          toast.error("Failed to load your passes. You can find them in 'My Passes'.");
        } finally {
          setLoadingPasses(false);
        }
      }
    };
    fetchGeneratedPasses();
  }, [activeStep, createdBookings, bookingSuccess]);

  const handlePaymentSubmit = async () => {
    const bookingsToPay = createdBookings.length > 0 ? createdBookings : [bookingSuccess];
    if (bookingsToPay.length === 0 || !bookingsToPay[0]) return;
    setProcessingPayment(true);
    try {
      const successfulPayments = [];
      let paymentFailed = false;
      let failureMessage = "";

      for (const booking of bookingsToPay) {
        const txRef = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const res = await paymentApi.addPayment({
          bookingId: booking.bookingId,
          transactionReference: txRef,
          amount: booking.totalAmount * 1.18 + 50,
          paymentMode: paymentMode
        });
        
        if (res.success) {
          successfulPayments.push(res);
        } else {
          paymentFailed = true;
          failureMessage = res.message || 'Payment confirmation failed.';
          break;
        }
      }

      if (paymentFailed) {
        toast.error(failureMessage);
        return;
      }

      toast.success('Payment successful! Passes generated for all slots.');
      setActiveStep(5); // Success confirmation
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Payment gateway connection error.');
    } finally {
      setProcessingPayment(false);
    }
  };


  if (loading || !event) {
    return (
      <DashboardLayout>
        <AppLoader message="Loading event details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" style={{ fontWeight: 800 }}>{event.eventName}</Typography>
          <Typography variant="caption" color="textSecondary" style={{ letterSpacing: 1 }}>CODE: {event.eventCode}</Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate(ROUTES.EVENTS)} style={{ textTransform: 'none', borderRadius: 8 }}>
          Back to list
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 12 }}>About Event</Typography>
              <Typography variant="body1" color="textPrimary" sx={{ mb: 2 }}>{event.about || event.description}</Typography>

              <Divider style={{ margin: '16px 0' }} />

              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 12 }}>Terms & Conditions</Typography>
              <Typography variant="body2" color="textSecondary">{event.termsAndConditions || 'No custom terms specified.'}</Typography>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: 12 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>Available Slots</Typography>
              <List>
                {event.slots && event.slots.map((slot: any) => (
                  <ListItem key={slot.slotId} divider>
                    <ListItemText
                      primary={`Date: ${new Date(slot.slotDate).toLocaleDateString()}`}
                      secondary={`Timing: ${slot.startTime} - ${slot.endTime} | Capacity: ${slot.capacity}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>Details</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Price:</Typography>
                <Typography variant="body2" style={{ fontWeight: 600 }}>INR {event.ticketPrice}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Category:</Typography>
                <Typography variant="body2" style={{ fontWeight: 600 }}>{event.categoryName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Publish Status:</Typography>
                <StatusChip status={event.isPublishActive} type="publish" />
              </Box>

              {event.slots && event.slots.length > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleOpenBooking}
                  style={{ marginTop: 16, textTransform: 'none', borderRadius: 8, fontWeight: 600 }}
                >
                  Book Tickets
                </Button>
              )}
            </CardContent>
          </Card>

          <Card style={{ borderRadius: 12 }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>Location</Typography>
              <Typography variant="body2" style={{ fontWeight: 600 }}>{event.locationName}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>{event.address}</Typography>
              <Typography variant="caption" color="textSecondary">
                Lat/Long: {event.latitude}, {event.longitude}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Booking Flow Dialog */}
      <Dialog open={bookingOpen} onClose={handleCloseBooking} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>
          Book Tickets - {event.eventName}
        </DialogTitle>
        <DialogContent dividers>
          {activeStep < 5 && (
            <Stepper activeStep={event.allowSeatSelection === false ? (activeStep >= 2 ? activeStep - 1 : activeStep) : activeStep} alternativeLabel sx={{ mb: 4 }}>
              <Step><StepLabel>Slot & Zone</StepLabel></Step>
              {event.allowSeatSelection !== false && <Step><StepLabel>Select Seats</StepLabel></Step>}
              <Step><StepLabel>Attendees</StepLabel></Step>
              <Step><StepLabel>Review Order</StepLabel></Step>
              <Step><StepLabel>Payment</StepLabel></Step>
            </Stepper>
          )}

          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="slot-select-label">Select Event Slot(s)</InputLabel>
                <Select
                  labelId="slot-select-label"
                  multiple={event.allowMultipleDateBooking || event.allowMultiSlotBooking}
                  value={event.allowMultipleDateBooking || event.allowMultiSlotBooking ? selectedSlotIds : selectedSlotId}
                  label="Select Event Slot(s)"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (event.allowMultipleDateBooking || event.allowMultiSlotBooking) {
                      const valArray = typeof val === 'string' ? val.split(',').map(Number) : (val as number[]);
                      setSelectedSlotIds(valArray);
                      setSelectedSlotId(valArray.length > 0 ? valArray[0] : '');
                    } else {
                      setSelectedSlotId(Number(val));
                      setSelectedSlotIds([Number(val)]);
                    }
                  }}
                  renderValue={(selected) => {
                    if (event.allowMultipleDateBooking || event.allowMultiSlotBooking) {
                      const selectedArray = selected as number[];
                      return selectedArray.map(id => {
                        const slot = bookingSlots.find((s: any) => s.slotId === id);
                        return slot ? new Date(slot.slotDate).toLocaleDateString() : '';
                      }).filter(Boolean).join(', ');
                    } else {
                      const slot = bookingSlots.find((s: any) => s.slotId === selectedSlotId);
                      return slot ? `${new Date(slot.slotDate).toLocaleDateString()} (${slot.startTime} - ${slot.endTime})` : '';
                    }
                  }}
                >
                  {bookingSlots.map((slot: any) => {
                    const isSelected = selectedSlotIds.indexOf(slot.slotId) > -1;
                    return (
                      <MenuItem key={slot.slotId} value={slot.slotId}>
                        {(event.allowMultipleDateBooking || event.allowMultiSlotBooking) && (
                          <Checkbox checked={isSelected} />
                        )}
                        <ListItemText 
                          primary={`${new Date(slot.slotDate).toLocaleDateString()} (${slot.startTime} - ${slot.endTime})`} 
                          secondary={`Capacity: ${slot.capacity}`}
                        />
                      </MenuItem>
                    );
                  })}
                  {bookingSlots.length === 0 && (
                    <MenuItem value="" disabled>No slots available</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="zone-select-label">Select Zone</InputLabel>
                <Select
                  labelId="zone-select-label"
                  value={selectedZoneId}
                  label="Select Zone"
                  onChange={(e) => handleZoneChange(Number(e.target.value))}
                >
                  {zones.map((zone) => (
                    <MenuItem key={zone.zoneId} value={zone.zoneId}>
                      {zone.zoneName} (INR {zone.seatPrice}) - Capacity: {zone.capacity}
                    </MenuItem>
                  ))}
                  {zones.length === 0 && (
                    <MenuItem value="" disabled>No zones configured for this event</MenuItem>
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Number of Tickets"
                type="number"
                fullWidth
                value={ticketQty || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const { minQty, maxQty } = getQuantityLimits();
                  if (val < minQty) {
                    setTicketQty(minQty);
                  } else if (val > maxQty) {
                    setTicketQty(maxQty);
                    toast.warning(`Maximum tickets you can book is ${maxQty}`);
                  } else {
                    setTicketQty(val);
                  }
                }}
                inputProps={{ 
                  min: getQuantityLimits().minQty, 
                  max: getQuantityLimits().maxQty 
                }}
                disabled={loadingSeats || availableSeatsCount === 0}
                helperText={
                  loadingSeats
                    ? "Calculating availability..."
                    : availableSeatsCount > 0
                      ? `Available seats in this zone: ${availableSeatsCount}. Limit per booking: Min ${getQuantityLimits().minQty}, Max ${getQuantityLimits().maxQty}`
                      : "This zone is sold out"
                }
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, p: 2, bgcolor: 'rgba(59, 130, 246, 0.05)', borderRadius: 2 }}>
                <Typography style={{ fontWeight: 600 }}>Total Price:</Typography>
                <Typography style={{ fontWeight: 800, color: '#3b82f6' }}>
                  INR {ticketQty * (selectedZone ? selectedZone.seatPrice : (event.ticketPrice || 0)) * getBookingCount()}
                </Typography>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                Select exactly <strong>{ticketQty}</strong> seat(s). Chosen: {selectedSeats.length}/{ticketQty}
              </Typography>

              {/* Stage indicator */}
              <Box sx={{
                width: '80%',
                bgcolor: '#cbd5e1',
                textAlign: 'center',
                py: 0.8,
                borderRadius: '0 0 16px 16px',
                mb: 4,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', letterSpacing: 2 }}>
                  STAGE
                </Typography>
              </Box>

              {loadingSeats ? (
                <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={30} />
                  <Typography variant="caption">Loading seating map layout...</Typography>
                </Box>
              ) : seats.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                  No seat layout configured for this zone.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', alignItems: 'center', overflowX: 'auto', py: 1 }}>
                  {(() => {
                    const rowsMap: { [key: string]: ZoneSeat[] } = {};
                    seats.forEach(seat => {
                      const row = seat.rowName || 'A';
                      if (!rowsMap[row]) rowsMap[row] = [];
                      rowsMap[row].push(seat);
                    });

                    Object.keys(rowsMap).forEach(row => {
                      rowsMap[row].sort((a, b) => a.columnNo - b.columnNo);
                    });

                    return Object.keys(rowsMap).sort().map(rowName => (
                      <Box key={rowName} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ width: 20, fontWeight: 'bold', color: '#64748b' }}>
                          {rowName}
                        </Typography>
                        {rowsMap[rowName].map(seat => {
                          const isBooked = bookedSeatNumbers.includes(seat.seatNumber) || seat.isBooked;
                          const isSelected = selectedSeats.includes(seat.seatNumber);
                          return (
                            <Box
                              key={seat.seatId}
                              onClick={() => handleSeatClick(seat.seatNumber)}
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                bgcolor: isBooked ? '#f1f5f9' : isSelected ? '#3b82f6' : '#fff',
                                color: isBooked ? '#94a3b8' : isSelected ? '#fff' : '#475569',
                                border: isBooked ? '1px solid #e2e8f0' : isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: isBooked ? 'none' : 'scale(1.15)',
                                  bgcolor: isBooked ? '#f1f5f9' : isSelected ? '#2563eb' : '#f1f5f9',
                                }
                              }}
                              title={`Seat ${seat.seatNumber} - INR ${seat.price || selectedZone?.seatPrice}`}
                            >
                              {seat.columnNo}
                            </Box>
                          );
                        })}
                      </Box>
                    ));
                  })()}
                </Box>
              )}

              {/* Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3, pt: 2, borderTop: '1px solid #f1f5f9', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  <Typography variant="caption" color="textSecondary">Available</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#3b82f6', borderRadius: '4px' }} />
                  <Typography variant="caption" color="textSecondary">Selected</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
                  <Typography variant="caption" color="textSecondary">Booked</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                Please enter the holder details for each selected seat.
              </Typography>
              {attendees.map((attendee, index) => (
                <Card key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ticket #{index + 1}</span>
                    <Typography variant="caption" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', px: 1.5, py: 0.2, borderRadius: 10, fontWeight: 'bold' }}>
                      Seat: {attendee.seatNo}
                    </Typography>
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Name"
                        fullWidth
                        size="small"
                        required
                        value={attendee.attendeeName}
                        onChange={(e) => handleAttendeeChange(index, 'attendeeName', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email Address"
                        fullWidth
                        size="small"
                        required
                        type="email"
                        value={attendee.email}
                        onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone Number"
                        fullWidth
                        size="small"
                        required
                        value={attendee.phoneNumber}
                        onChange={(e) => handleAttendeeChange(index, 'phoneNumber', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Box>
          )}

          {activeStep === 3 && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Order Summary</Typography>
              <Card variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Event Name:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{event.eventName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Selected Slot(s):</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {(() => {
                        const slotsToBook = (event?.allowMultipleDateBooking || event?.allowMultiSlotBooking)
                          ? selectedSlotIds.filter(Boolean)
                          : [Number(selectedSlotId)].filter(Boolean);
                        return slotsToBook.map(slotId => {
                          const slot = bookingSlots.find((s: any) => s.slotId === slotId) || event.slots?.find((s: any) => s.slotId === slotId);
                          return slot ? new Date(slot.slotDate).toLocaleDateString() : '';
                        }).filter(Boolean).join(', ') || 'N/A';
                      })()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Zone:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedZone?.zoneName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Selected Seats:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#2563eb' }}>
                      {selectedSeats.join(', ')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Ticket Quantity:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {ticketQty} {ticketQty === 1 ? 'ticket' : 'tickets'} {getBookingCount() > 1 && `per slot (${ticketQty * getBookingCount()} total)`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Total Price:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#3b82f6' }}>
                      INR {ticketQty * (selectedZone ? selectedZone.seatPrice : (event.ticketPrice || 0)) * getBookingCount()}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Attendee List:</Typography>
              <Box sx={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 2, p: 1 }}>
                {attendees.map((att, idx) => (
                  <Box key={idx} sx={{ py: 0.5, borderBottom: idx < attendees.length - 1 ? '1px solid #f1f5f9' : 'none', px: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{idx + 1}. {att.attendeeName} (Seat: {att.seatNo})</Typography>
                    <Typography variant="caption" color="textSecondary">{att.email} | {att.phoneNumber}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {activeStep === 4 && bookingSuccess && (
            <Box sx={{ pt: 1 }}>
              {isHoldExpired ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 4, px: 2 }}>
                  <Box sx={{
                    width: 70,
                    height: 70,
                    bgcolor: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)'
                  }}>
                    <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                    Seat Hold Expired
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    Your 10-minute temporary seat reservation has expired. The seats have been released back to general availability. Please start a new booking.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setActiveStep(0);
                      setBookingSuccess(null);
                      setSelectedSeats([]);
                    }}
                    sx={{ textTransform: 'none', borderRadius: 2, px: 4, py: 1.2, fontWeight: 600 }}
                  >
                    Start Over
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Box sx={{
                    bgcolor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: 3,
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: holdTimer < 120 ? '#ef4444' : '#f59e0b',
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(0.95)', opacity: 0.5 },
                          '50%': { transform: 'scale(1.1)', opacity: 1 },
                          '100%': { transform: 'scale(0.95)', opacity: 0.5 },
                        }
                      }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#78350f' }}>
                        Temporary Seat Hold Active
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: holdTimer < 120 ? '#ef4444' : '#b45309' }}>
                      {formatTime(holdTimer)}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Select Payment Method</Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                      { id: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
                      { id: 'UPI', label: 'UPI (GPay / PhonePe)', icon: '📱' },
                      { id: 'NETBANKING', label: 'Net Banking', icon: '🏦' }
                    ].map((mode) => (
                      <Grid item xs={12} sm={4} key={mode.id}>
                        <Card
                           variant="outlined"
                           onClick={() => setPaymentMode(mode.id)}
                           sx={{
                             p: 2,
                             textAlign: 'center',
                             cursor: 'pointer',
                             borderRadius: 3,
                             borderColor: paymentMode === mode.id ? '#3b82f6' : '#e2e8f0',
                             bgcolor: paymentMode === mode.id ? 'rgba(59, 130, 246, 0.04)' : '#fff',
                             borderWidth: paymentMode === mode.id ? 2 : 1,
                             transition: 'all 0.2s',
                             '&:hover': {
                               borderColor: '#3b82f6',
                               bgcolor: 'rgba(59, 130, 246, 0.02)'
                             }
                           }}
                        >
                          <Typography variant="h4" sx={{ mb: 1 }}>{mode.icon}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{mode.label}</Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Payment Breakup {getBookingCount() > 1 && `(${getBookingCount()} Slots)`}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Base Ticket Charge ({ticketQty} x INR {selectedZone?.seatPrice} x {getBookingCount()} slot(s)):</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>INR {(ticketQty * (selectedZone?.seatPrice || 0) * getBookingCount()).toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">SGST (9%):</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>INR {(ticketQty * (selectedZone?.seatPrice || 0) * getBookingCount() * 0.09).toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">CGST (9%):</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>INR {(ticketQty * (selectedZone?.seatPrice || 0) * getBookingCount() * 0.09).toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Internet Handling Fee:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>INR {(50.00 * getBookingCount()).toFixed(2)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Grand Total:</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#10b981' }}>
                          INR {((ticketQty * (selectedZone?.seatPrice || 0) * getBookingCount()) * 1.18 + 50 * getBookingCount()).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={async () => {
                        const bookingsToCancel = createdBookings.length > 0 ? createdBookings : [bookingSuccess];
                        setProcessingPayment(true);
                        try {
                          for (const booking of bookingsToCancel) {
                            if (booking?.bookingRId) {
                              await bookingApi.cancelBooking(booking.bookingRId, 'Payment Cancelled by Visitor');
                            }
                          }
                          toast.info('Booking holds cancelled and seats released.');
                        } catch (e) {
                          console.error('Failed to release seats:', e);
                        } finally {
                          setProcessingPayment(false);
                        }
                        handleCloseBooking();
                      }}
                      disabled={processingPayment}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                    >
                      Cancel Payment
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={async () => {
                        const bookingsToFail = createdBookings.length > 0 ? createdBookings : [bookingSuccess];
                        if (bookingsToFail.length > 0 && bookingsToFail[0]) {
                          try {
                            setProcessingPayment(true);
                            for (const booking of bookingsToFail) {
                              const txRef = 'TXN-FAIL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
                              await paymentApi.recordFailedPayment({
                                bookingId: booking.bookingId,
                                transactionReference: txRef,
                                amount: booking.totalAmount * 1.18 + 50,
                                paymentMode: paymentMode
                              });
                            }
                            toast.error('Payment simulation failed: Insufficient funds. Please try again.');
                          } catch (e) {
                            console.error('Failed to log payment failure:', e);
                          } finally {
                            setProcessingPayment(false);
                          }
                        }
                      }}
                      disabled={processingPayment}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                    >
                      Simulate Failure
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handlePaymentSubmit}
                      disabled={processingPayment}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 150 }}
                    >
                      {processingPayment ? <CircularProgress size={20} color="inherit" /> : 'Pay & Confirm Success'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {activeStep === 5 && bookingSuccess && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 4, px: 2 }}>
              <Box sx={{
                width: 70,
                height: 70,
                bgcolor: '#10b981',
                color: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)'
              }}>
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
                Booking Confirmed!
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Your order has been successfully processed. Here is your reference:
              </Typography>

              <Card sx={{ p: 2, width: '100%', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1', mb: 4 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  {createdBookings.length > 1 ? "BOOKING REFERENCES" : "BOOKING REFERENCE"}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#3b82f6', letterSpacing: 1, wordBreak: 'break-all' }}>
                  {createdBookings.length > 1 
                    ? createdBookings.map(b => b.bookingReference || `BK-${b.bookingId}`).join(', ')
                    : (bookingSuccess.bookingReference || `BK-${bookingSuccess.bookingId}`)}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Tickets</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {createdBookings.length > 0
                        ? createdBookings.reduce((sum, b) => sum + b.totalTickets, 0)
                        : bookingSuccess.totalTickets} Passes
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Seats Assigned</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedSeats.join(', ')}</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">Amount Paid</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>
                      INR {((createdBookings.length > 0 
                        ? createdBookings.reduce((sum, b) => sum + b.totalAmount, 0)
                        : bookingSuccess.totalAmount) * 1.18 + 50 * getBookingCount()).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Passes preview */}
              <Box sx={{ width: '100%', mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textAlign: 'left' }}>Your Entry Passes:</Typography>
                {loadingPasses ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3, gap: 1.5 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="textSecondary">Loading passes from database...</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {generatedPasses.map((pass, idx) => (
                      <Box key={idx} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        bgcolor: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{pass.holderName}</Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Seat: {pass.seatNo || 'N/A'} | Zone: {pass.zoneName || selectedZone?.zoneName || 'General'}
                          </Typography>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                            Pass Code: {pass.passCode}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => window.open(`/booking/${bookingSuccess.bookingId}/passes`, '_blank')}
                          sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
                        >
                          View Pass
                        </Button>
                      </Box>
                    ))}
                    {generatedPasses.length === 0 && (
                      <Typography variant="caption" color="textSecondary">
                        Generating entry passes... Please check My Passes page if they don't load.
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', width: '100%' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.open(`/booking/${bookingSuccess.bookingId}/passes`, '_blank')}
                  sx={{ textTransform: 'none', borderRadius: 2, px: 4, py: 1.2, fontWeight: 600 }}
                >
                  View Pass
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setBookingOpen(false);
                    navigate(ROUTES.BOOKINGS);
                  }}
                  sx={{ textTransform: 'none', borderRadius: 2, px: 4, py: 1.2, fontWeight: 600 }}
                >
                  Go to My Bookings
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        {activeStep < 5 && (
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={handleCloseBooking}
              disabled={submitting || processingPayment}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, color: '#64748b' }}
            >
              Cancel
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            {activeStep > 0 && activeStep < 4 && (
              <Button
                onClick={handleBack}
                disabled={submitting}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, mr: 1 }}
              >
                Back
              </Button>
            )}
            {activeStep < 3 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loadingSeats || (activeStep === 0 && (availableSeatsCount === 0 || !ticketQty))}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Next
              </Button>
            ) : activeStep === 3 ? (
              <Button
                variant="contained"
                color="success"
                onClick={handleConfirmBooking}
                disabled={submitting}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, minWidth: 120 }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Place Order & Hold Seats'}
              </Button>
            ) : null}
          </DialogActions>
        )}
      </Dialog>

      {/* Pass Detail Modal */}
      <Dialog
        open={selectedPassForModal !== null}
        onClose={() => setSelectedPassForModal(null)}
        maxWidth="md"
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'visible' }}>
          {selectedPassForModal && (
            <Box sx={{ position: 'relative' }}>
              {/* Close Button */}
              <Button
                onClick={() => setSelectedPassForModal(null)}
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: 0,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Close [X]
              </Button>

              {/* Inject CSS styles */}
              <style dangerouslySetInnerHTML={{
                __html: `
                .ticket-wrapper {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  padding: 10px 0;
                  width: 100%;
                }
                .ticket-container {
                  display: flex;
                  width: 760px;
                  height: 270px;
                  background-color: #fff;
                  border-radius: 16px;
                  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                  overflow: hidden;
                  position: relative;
                  font-family: 'Outfit', 'Inter', sans-serif;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .ticket-left {
                  flex: 1.1;
                  background: linear-gradient(135deg, #2a0845 0%, #6441a5 100%);
                  position: relative;
                  color: #fff;
                  display: flex;
                  flex-direction: column;
                  padding: 24px;
                  box-sizing: border-box;
                  overflow: hidden;
                }
                .ticket-left-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
                  z-index: 1;
                }
                .ticket-left-content {
                  position: relative;
                  z-index: 2;
                  display: flex;
                  flex-direction: column;
                  height: 100%;
                }
                .ticket-logo-section {
                  display: flex;
                  align-items: center;
                  margin-bottom: 8px;
                }
                .ticket-logo {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                .logo-diamond {
                  width: 14px;
                  height: 14px;
                  border: 2px solid #ff7597;
                  transform: rotate(45deg);
                  display: inline-block;
                  background: linear-gradient(135deg, #ff7597, #6441a5);
                }
                .logo-text {
                  font-size: 11px;
                  font-weight: 800;
                  letter-spacing: 2px;
                  color: #ff7597;
                }
                .ticket-presentation {
                  font-size: 11px;
                  color: rgba(255, 255, 255, 0.65);
                  font-style: italic;
                  margin-bottom: 12px;
                  letter-spacing: 0.5px;
                }
                .ticket-slanted-badge {
                  background: linear-gradient(90deg, #ff7597, #e23e57);
                  padding: 8px 18px;
                  font-size: 22px;
                  font-weight: 900;
                  letter-spacing: 1px;
                  color: #fff;
                  text-transform: uppercase;
                  transform: skewX(-10deg);
                  width: fit-content;
                  box-shadow: 0 4px 15px rgba(226, 62, 87, 0.4);
                  margin-bottom: 8px;
                }
                .ticket-sub-badge {
                  font-size: 13px;
                  font-weight: 700;
                  color: #fff;
                  letter-spacing: 3px;
                  text-transform: uppercase;
                  margin-bottom: auto;
                  padding-left: 2px;
                }
                .ticket-description {
                  font-size: 9px;
                  color: rgba(255, 255, 255, 0.45);
                  line-height: 1.4;
                  margin-bottom: 10px;
                  max-width: 90%;
                }
                .ticket-socials {
                  display: flex;
                  gap: 12px;
                  margin-top: 4px;
                }
                .social-dot {
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background-color: rgba(255,255,255,0.3);
                }
                .ticket-divider {
                  width: 20px;
                  background-color: #fff;
                  position: relative;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                }
                .notch {
                  width: 20px;
                  height: 20px;
                  background-color: rgba(0, 0, 0, 0.85);
                  border-radius: 50%;
                  position: absolute;
                  z-index: 10;
                }
                .top-notch {
                  top: -10px;
                  left: 0;
                }
                .bottom-notch {
                  bottom: -10px;
                  left: 0;
                }
                .divider-line {
                  height: calc(100% - 30px);
                  border-left: 2px dashed #e2e8f0;
                }
                .ticket-right {
                  flex: 1.4;
                  background: linear-gradient(135deg, #fff5f7 0%, #ffeef1 40%, #ffdce2 100%);
                  display: flex;
                  padding: 16px 20px;
                  box-sizing: border-box;
                  position: relative;
                  justify-content: space-between;
                }
                .ticket-right::before {
                  content: '';
                  position: absolute;
                  width: 140px;
                  height: 140px;
                  border-radius: 50%;
                  background: radial-gradient(circle, rgba(255,117,151,0.25) 0%, rgba(255,117,151,0) 70%);
                  top: 10%;
                  right: 5%;
                  pointer-events: none;
                }
                .ticket-right::after {
                  content: '';
                  position: absolute;
                  width: 120px;
                  height: 120px;
                  border-radius: 50%;
                  background: radial-gradient(circle, rgba(255,221,117,0.25) 0%, rgba(255,221,117,0) 70%);
                  bottom: -10%;
                  left: 5%;
                  pointer-events: none;
                }
                .ticket-right-content {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  flex: 1.5;
                  z-index: 2;
                }
                .ticket-event-name {
                  font-size: 20px;
                  font-weight: 800;
                  color: #3b0066;
                  margin-bottom: 2px;
                  line-height: 1.2;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                }
                .ticket-date-display {
                  font-size: 16px;
                  font-weight: 800;
                  color: #e23e57;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .ticket-time-display {
                  font-size: 8.5px;
                  font-weight: 700;
                  color: #64748b;
                  letter-spacing: 0.5px;
                  text-transform: uppercase;
                  margin-bottom: 4px;
                }
                .ticket-location-display {
                  font-size: 8.5px;
                  font-weight: 500;
                  color: #1e293b;
                  margin-bottom: 6px;
                  line-height: 1.2;
                }
                .ticket-location-display strong {
                  color: #e23e57;
                  font-weight: 800;
                }
                .ticket-location-address {
                  font-size: 8px;
                  color: #64748b;
                  margin-top: 1px;
                  line-height: 1.2;
                }
                .ticket-map-link {
                  color: #2563eb;
                  text-decoration: none;
                  font-weight: 700;
                  margin-left: 5px;
                }
                .ticket-map-link:hover {
                  text-decoration: underline;
                }
                .ticket-details-table {
                  display: flex;
                  background-color: rgba(255, 255, 255, 0.85);
                  border: 1px solid rgba(226, 62, 87, 0.25);
                  border-radius: 12px;
                  padding: 6px 10px;
                  margin-bottom: 8px;
                  backdrop-filter: blur(5px);
                  width: fit-content;
                  gap: 12px;
                }
                .details-column {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  min-width: 55px;
                }
                .detail-label {
                  font-size: 8px;
                  font-weight: 800;
                  color: #e23e57;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                  margin-bottom: 2px;
                }
                .detail-value {
                  font-size: 14px;
                  font-weight: 800;
                  color: #2a0845;
                }
                .details-divider {
                  width: 1px;
                  background-color: rgba(226, 62, 87, 0.15);
                  align-self: stretch;
                }
                .ticket-admit-box {
                  background: linear-gradient(135deg, #e23e57, #6441a5);
                  border-radius: 8px;
                  padding: 6px 14px;
                  width: fit-content;
                  display: flex;
                  gap: 8px;
                  align-items: center;
                  box-shadow: 0 4px 10px rgba(100, 65, 165, 0.25);
                }
                .admit-label {
                  font-size: 9px;
                  font-weight: 800;
                  color: #fff;
                  letter-spacing: 1.5px;
                }
                .admit-price {
                  font-size: 11px;
                  font-weight: 800;
                  color: #ffdce2;
                  border-left: 1px solid rgba(255, 255, 255, 0.3);
                  padding-left: 8px;
                }
                .ticket-qr-section {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  flex: 0.7;
                  border-left: 2px dashed rgba(226, 62, 87, 0.15);
                  padding-left: 16px;
                  z-index: 2;
                }
                .qr-code-wrapper {
                  background-color: #fff;
                  padding: 6px;
                  border-radius: 8px;
                  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
                  border: 1px solid rgba(0, 0, 0, 0.05);
                }
                .ticket-qr-code {
                  width: 95px;
                  height: 95px;
                  display: block;
                }
                .ticket-serial {
                  font-size: 8px;
                  font-weight: 800;
                  color: #6441a5;
                  margin-top: 6px;
                  letter-spacing: 0.5px;
                }
                @media (max-width: 768px) {
                  .ticket-container {
                    flex-direction: column;
                    width: 320px;
                    height: auto;
                  }
                  .ticket-divider {
                    display: none;
                  }
                  .ticket-left {
                    height: 140px;
                    padding: 16px;
                  }
                  .ticket-right {
                    flex-direction: column;
                    padding: 16px;
                    gap: 16px;
                  }
                  .ticket-qr-section {
                    border-left: none;
                    border-top: 2px dashed rgba(226, 62, 87, 0.15);
                    padding-left: 0;
                    padding-top: 16px;
                  }
                  .ticket-slanted-badge {
                    font-size: 18px;
                    padding: 6px 14px;
                  }
                }
              `}} />

              <div className="ticket-wrapper">
                <div className="ticket-container">
                  {/* Left side (Violet/Purple Gradient Stub) */}
                  <div className="ticket-left">
                    <div className="ticket-left-overlay"></div>
                    <div className="ticket-left-content">
                      <div className="ticket-logo-section">
                        <div className="ticket-logo">
                          <span className="logo-diamond"></span>
                          <span className="logo-text">EVENT PASS</span>
                        </div>
                      </div>
                      <div className="ticket-presentation">Festum Evanto Presenting...</div>
                      <div className="ticket-slanted-badge">EVENT TICKET</div>
                      <div className="ticket-sub-badge">YOUR ENTRY PASS</div>
                      <div className="ticket-description">Show this pass with QR Code at the entrance. Valid for single entry only.</div>
                      <div className="ticket-socials">
                        <span className="social-dot"></span>
                        <span className="social-dot"></span>
                        <span className="social-dot"></span>
                      </div>
                    </div>
                  </div>

                  {/* Divider with notches */}
                  <div className="ticket-divider">
                    <div className="notch top-notch"></div>
                    <div className="divider-line"></div>
                    <div className="notch bottom-notch"></div>
                  </div>

                  {/* Right side (Pink/Orange Stub) */}
                  <div className="ticket-right">
                    <div className="ticket-right-content">
                      <div className="ticket-event-name">{selectedPassForModal.eventName || event.eventName}</div>
                      <div className="ticket-date-display">
                        {new Date(selectedPassForModal.slotDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="ticket-time-display">
                        DOORS WILL OPEN AT {selectedPassForModal.startTime ? selectedPassForModal.startTime.substring(0, 5) : '00:00'}
                      </div>

                      {(selectedPassForModal.venueName || selectedPassForModal.addressLine1) && (
                        <div className="ticket-location-display">
                          <strong>VENUE:</strong> {selectedPassForModal.venueName || 'N/A'}
                          {(selectedPassForModal.addressLine1 || selectedPassForModal.addressLine2 || selectedPassForModal.city) && (
                            <div className="ticket-location-address">
                              {[selectedPassForModal.addressLine1, selectedPassForModal.addressLine2, selectedPassForModal.city, selectedPassForModal.state, selectedPassForModal.country].filter(Boolean).join(', ')}
                              {selectedPassForModal.googleMapLink && (
                                <a href={selectedPassForModal.googleMapLink} target="_blank" rel="noopener noreferrer" className="ticket-map-link">
                                  (View Map)
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="ticket-details-table">
                        <div className="details-column">
                          <span className="detail-label">SEAT</span>
                          <span className="detail-value">{selectedPassForModal.seatNo || 'N/A'}</span>
                        </div>
                        <div className="details-divider"></div>
                        <div className="details-column">
                          <span className="detail-label">ZONE</span>
                          <span className="detail-value">{selectedPassForModal.zoneName || 'General'}</span>
                        </div>
                        <div className="details-divider"></div>
                        <div className="details-column">
                          <span className="detail-label">SLOT TIME</span>
                          <span className="detail-value">
                            {selectedPassForModal.startTime ? selectedPassForModal.startTime.substring(0, 5) : '00:00'} - {selectedPassForModal.endTime ? selectedPassForModal.endTime.substring(0, 5) : 'END'}
                          </span>
                        </div>
                      </div>

                      <div className="ticket-admit-box">
                        <span className="admit-label">HOLDER: {selectedPassForModal.holderName.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* QR Code section */}
                    <div className="ticket-qr-section">
                      <div className="qr-code-wrapper">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedPassForModal.passCode)}`}
                          alt="Pass QR Code"
                          className="ticket-qr-code"
                        />
                      </div>
                      {/* <div className="ticket-serial">{selectedPassForModal.passCode}</div> */}
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EventDetailsPage;
