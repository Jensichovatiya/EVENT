import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Card, CardContent, CircularProgress,
  Container, Checkbox, FormControlLabel, Select, MenuItem, InputLabel,
  FormControl, Stepper, Step, StepLabel, TextField, Alert, Paper, Divider
} from '@mui/material';
import { ArrowLeft, CheckCircle, Lock, Calendar, CreditCard, Users, ShieldAlert, Download } from 'lucide-react';
import { toast } from 'sonner';
import { eventApi } from '../api/eventApi';
import { bookingApi } from '../api/bookingApi';
import DashboardLayout from '../layouts/DashboardLayout';
import html2canvas from 'html2canvas';

interface BookingDateConfig {
  date: string;
  slotId: number;
  slotName: string;
  startTime: string;
  endTime: string;
  zoneId: number;
  zoneName: string;
  ticketQty: number;
  selectedSeats: any[]; // { seatId, seatNumber }
}

export const AdvancedBookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // Advanced selection states
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateConfigs, setDateConfigs] = useState<{ [date: string]: BookingDateConfig }>({});

  // Slot, Zone and Seat options per date
  const [slotsByDate, setSlotsByDate] = useState<{ [date: string]: any[] }>({});
  const [zones, setZones] = useState<any[]>([]);

  // Seat map rendering states
  const [seatMapByDate, setSeatMapByDate] = useState<{ [date: string]: any[] }>({});
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [currentSeatDate, setCurrentSeatDate] = useState<string>('');

  // Group booking state
  const [isGroupBooking, setIsGroupBooking] = useState(false);
  const [groupName, setGroupName] = useState('');

  // Attendees list
  const [attendees, setAttendees] = useState<any[]>([]); // { date, seatId, seatNo, attendeeName, email, phoneNumber, attendeeType }

  // Booking Results
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [holdTimer, setHoldTimer] = useState<number>(600); // 10 minutes
  const [isHoldExpired, setIsHoldExpired] = useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMode, setPaymentMode] = useState('CARD');
  const [txnRef, setTxnRef] = useState('');
  const [generatedPasses, setGeneratedPasses] = useState<any[]>([]);
  const [loadingPasses, setLoadingPasses] = useState(false);
  const [downloadingSingle, setDownloadingSingle] = useState<string | null>(null);

  // Timer Ref
  const timerRef = useRef<any>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      try {
        setLoadingEvent(true);
        const res = await eventApi.getEvents(eventId);
        if (res.success && res.data) {
          setEvent(res.data);

          // Get available dates
          const datesRes = await bookingApi.getAvailableEventDates(Number(eventId));
          if (datesRes.success && datesRes.data) {
            setAvailableDates(datesRes.data.map((d: any) => d.split('T')[0]));
          }

          // Get available zones
          const zonesRes = await bookingApi.getAvailableZones(Number(eventId));
          if (zonesRes.success && zonesRes.data) {
            setZones(zonesRes.data);
          }
        } else {
          toast.error("Failed to load event details.");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred loading the page.");
      } finally {
        setLoadingEvent(false);
      }
    };
    fetchEventData();
  }, [eventId]);

  // Lock Hold Expiry Timer Effect
  useEffect(() => {
    if (activeStep === 3 && holdTimer > 0 && !isHoldExpired) {
      timerRef.current = setInterval(() => {
        setHoldTimer(prev => {
          if (prev <= 1) {
            setIsHoldExpired(true);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStep, holdTimer, isHoldExpired]);

  const handleDateCheckboxChange = async (date: string, checked: boolean) => {
    if (checked) {
      if (!event.allowMultipleDateBooking && selectedDates.length >= 1) {
        toast.warning("This event only allows booking for a single date.");
        return;
      }

      setSelectedDates(prev => [...prev, date].sort());

      // Fetch slots for this date
      try {
        const slotsRes = await bookingApi.getAvailableSlotsByDate(Number(eventId), date);
        if (slotsRes.success && slotsRes.data) {
          setSlotsByDate(prev => ({ ...prev, [date]: slotsRes.data }));

          // Pre-populate date configuration
          const defaultSlot = slotsRes.data[0];
          setDateConfigs(prev => ({
            ...prev,
            [date]: {
              date,
              slotId: defaultSlot?.slotId || 0,
              slotName: defaultSlot?.slotName || '',
              startTime: defaultSlot?.startTime || '',
              endTime: defaultSlot?.endTime || '',
              zoneId: zones[0]?.zoneId || 0,
              zoneName: zones[0]?.zoneName || '',
              ticketQty: 1,
              selectedSeats: []
            }
          }));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setSelectedDates(prev => prev.filter(d => d !== date));
      setDateConfigs(prev => {
        const copy = { ...prev };
        delete copy[date];
        return copy;
      });
    }
  };

  const handleConfigChange = (date: string, field: keyof BookingDateConfig, value: any) => {
    setDateConfigs(prev => {
      const config = { ...prev[date], [field]: value };

      // If slot changed, update timing details
      if (field === 'slotId') {
        const slot = slotsByDate[date]?.find(s => s.slotId === value);
        if (slot) {
          config.slotName = slot.slotName;
          config.startTime = slot.startTime;
          config.endTime = slot.endTime;
        }
      }

      // If zone changed, update zone name and clear selected seats
      if (field === 'zoneId') {
        const zone = zones.find(z => z.zoneId === value);
        config.zoneName = zone ? zone.zoneName : '';
        config.selectedSeats = [];
      }

      return { ...prev, [date]: config };
    });
  };

  const handleLoadSeatMap = async (date: string) => {
    const config = dateConfigs[date];
    if (!config || !config.slotId || !config.zoneId) return;

    setLoadingSeats(true);
    setCurrentSeatDate(date);
    try {
      const res = await bookingApi.getAvailableSeats(Number(eventId), config.zoneId, date, config.slotId);
      if (res.success && res.data) {
        setSeatMapByDate(prev => ({ ...prev, [date]: res.data }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load seating layout.");
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSeatClick = (date: string, seat: any) => {
    if (seat.seatStatus === 'Booked' || seat.seatStatus === 'Locked') return;

    const config = dateConfigs[date];
    if (!config) return;

    const isSelected = config.selectedSeats.some(s => s.seatId === seat.seatId);

    setDateConfigs(prev => {
      const dConfig = { ...prev[date] };
      if (isSelected) {
        dConfig.selectedSeats = dConfig.selectedSeats.filter(s => s.seatId !== seat.seatId);
      } else {
        if (dConfig.selectedSeats.length >= dConfig.ticketQty) {
          toast.warning(`You can select at most ${dConfig.ticketQty} seat(s) for ${date}.`);
          return prev;
        }
        dConfig.selectedSeats = [...dConfig.selectedSeats, { seatId: seat.seatId, seatNumber: seat.seatNumber }];
      }
      return { ...prev, [date]: dConfig };
    });
  };

  const validateAndProceedToSeats = async () => {
    if (selectedDates.length === 0) {
      toast.error("Please select at least one booking date.");
      return;
    }

    // Validate limit first (aggregate quantity)
    let totalQty = 0;
    for (const date of selectedDates) {
      const config = dateConfigs[date];
      if (!config) return;
      if (!config.slotId) {
        toast.error(`Please select a slot for ${date}.`);
        return;
      }
      if (!config.zoneId) {
        toast.error(`Please select a zone for ${date}.`);
        return;
      }
      if (config.ticketQty < (event.minBookingQty || 1)) {
        toast.error(`Min booking qty for this event is ${event.minBookingQty || 1}.`);
        return;
      }
      if (config.ticketQty > (event.maxBookingQty || 10)) {
        toast.error(`Max booking qty for this event is ${event.maxBookingQty || 10}.`);
        return;
      }
      totalQty += config.ticketQty;
    }

    // Limit validations
    try {
      const validateRes = await bookingApi.validateBookingLimit(Number(eventId), totalQty);
      if (!validateRes.success) {
        toast.error(validateRes.message || "Limits validation failed.");
        return;
      }
    } catch (err: any) {
      toast.error(err.message || "Booking limits validation failed.");
      return;
    }

    // Seat locking setup: Load first date's seat map
    setActiveStep(1);
    handleLoadSeatMap(selectedDates[0]);
  };

  const handleSeatLockSubmit = async () => {
    // Validate that seats are selected for all dates
    for (const date of selectedDates) {
      const config = dateConfigs[date];
      if (config.selectedSeats.length !== config.ticketQty) {
        toast.error(`Please select exactly ${config.ticketQty} seat(s) for ${date}. (Selected: ${config.selectedSeats.length})`);
        return;
      }
    }

    // Call API to lock seats for each date
    try {
      let tempBookingId = 0;
      for (const date of selectedDates) {
        const config = dateConfigs[date];
        const lockPayload = {
          eventId: Number(eventId),
          eventDate: date,
          slotId: config.slotId,
          zoneId: config.zoneId,
          lockMinutes: event.seatLockMinutes || 10,
          bookingId: tempBookingId,
          seats: config.selectedSeats.map(s => ({ seatId: s.seatId }))
        };

        const lockRes = await bookingApi.lockSeats(lockPayload);
        if (lockRes.success && lockRes.data) {
          tempBookingId = lockRes.data.bookingId;
        } else {
          toast.error(lockRes.message || `Failed to lock seats for date ${date}.`);
          return;
        }
      }

      // Populate attendees grid
      const list: any[] = [];
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      selectedDates.forEach(date => {
        const config = dateConfigs[date];
        config.selectedSeats.forEach((seat, idx) => {
          list.push({
            date,
            slotId: config.slotId,
            zoneId: config.zoneId,
            seatId: seat.seatId,
            seatNo: seat.seatNumber,
            attendeeName: idx === 0 ? (currentUser?.userName || '') : '',
            email: idx === 0 ? (currentUser?.email || '') : '',
            phoneNumber: idx === 0 ? (currentUser?.mobileNo || '') : '',
            attendeeType: idx === 0 ? 'Primary' : 'Guest'
          });
        });
      });

      setAttendees(list);
      setBookingSuccess({ bookingId: tempBookingId });
      setActiveStep(2);
      toast.success("Seats locked successfully. Please fill in attendee details.");
    } catch (err: any) {
      toast.error(err.message || "An error occurred locking your seats.");
    }
  };

  const handleAttendeeValueChange = (index: number, field: string, value: string) => {
    setAttendees(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAttendeesSubmit = () => {
    // Validate inputs
    for (let i = 0; i < attendees.length; i++) {
      const att = attendees[i];
      if (!att.attendeeName.trim()) {
        toast.error(`Please fill name for attendee on seat ${att.seatNo} (${att.date})`);
        return;
      }
      if (!att.email.trim() || !/\S+@\S+\.\S+/.test(att.email)) {
        toast.error(`Please provide a valid email for seat ${att.seatNo} (${att.date})`);
        return;
      }
      if (!att.phoneNumber.trim()) {
        toast.error(`Please provide a phone number for seat ${att.seatNo} (${att.date})`);
        return;
      }
    }

    if (isGroupBooking && !groupName.trim()) {
      toast.error("Please enter a Group Name for this booking.");
      return;
    }

    setActiveStep(3);
  };

  const calculateTotal = () => {
    let subtotal = 0;
    selectedDates.forEach(date => {
      const config = dateConfigs[date];
      const zone = zones.find(z => z.zoneId === config.zoneId);
      subtotal += config.ticketQty * (zone ? zone.seatPrice : 0);
    });
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleFinalBookingAndPayment = async () => {
    if (!bookingSuccess) return;
    setProcessingPayment(true);

    try {
      const { subtotal } = calculateTotal();
      const currentUserIdStr = localStorage.getItem('userId') || '0';
      const userId = Number(currentUserIdStr);

      const requestPayload = {
        bookingId: bookingSuccess.bookingId,
        eventId: Number(eventId),
        userId: userId,
        totalTickets: attendees.length,
        totalAmount: subtotal,
        bookingStatus: 0,
        isGroupBooking: isGroupBooking,
        groupName: isGroupBooking ? groupName.trim() : "",
        createdBy: localStorage.getItem('userName') || "Visitor",
        createdFrom: "Frontend Web",
        bookingDates: selectedDates.map(date => {
          const config = dateConfigs[date];
          return {
            slotId: config.slotId,
            eventDate: date,
            attendees: attendees.filter(a => a.date === date).map(a => ({
              attendeeName: a.attendeeName.trim(),
              email: a.email.trim(),
              phoneNumber: a.phoneNumber.trim(),
              seatId: a.seatId,
              seatNo: a.seatNo,
              zoneId: a.zoneId,
              attendeeType: a.attendeeType
            }))
          };
        })
      };

      // Confirm lock metadata inside advanced booking SP
      const res = await bookingApi.createUpdateAdvancedBooking(requestPayload);
      if (res.success && res.data) {
        // Complete the mock payment process
        const simulatedTxn = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        setTxnRef(simulatedTxn);

        const paymentRes = await bookingApi.processPayment({
          bookingId: res.data.bookingId,
          transactionReference: simulatedTxn,
          amount: calculateTotal().total,
          paymentMode: paymentMode
        });

        if (paymentRes.success) {
          toast.success("Payment verified and passes generated!");

          // Clear holding timer
          if (timerRef.current) clearInterval(timerRef.current);

          // Fetch generated passes
          setLoadingPasses(true);
          const passesRes = await bookingApi.generatePasses(res.data.bookingId);
          if (passesRes.success && passesRes.data) {
            setGeneratedPasses(passesRes.data);
          }
          setLoadingPasses(false);
          setActiveStep(4);
        } else {
          toast.error(paymentRes.message || "Payment verification failed.");
        }
      } else {
        toast.error(res.message || "Failed to finalize booking hold details.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during payment processing.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadSingle = async (pass: any) => {
    const elementId = `pass-card-${pass.passId}`;
    const element = document.getElementById(elementId);
    if (!element) {
      toast.error('Pass view element not found.');
      return;
    }

    setDownloadingSingle(pass.passNo);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#6441a5',
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Pass_${pass.eventName.replace(/\s+/g, '_')}_Seat_${pass.seatNumber || 'NA'}_${pass.passNo}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Pass ${pass.passNo} downloaded!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export pass image.');
    } finally {
      setDownloadingSingle(null);
    }
  };

  const handleCancelHolding = async () => {
    if (bookingSuccess) {
      await bookingApi.releaseSeats({ bookingId: bookingSuccess.bookingId });
    }
    navigate(`/events/${eventId}`);
  };

  if (loadingEvent) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={50} />
        </Box>
      </DashboardLayout>
    );
  }

  const { subtotal, tax, total } = calculateTotal();

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button onClick={handleCancelHolding} startIcon={<ArrowLeft size={16} />} variant="outlined">
          Cancel & Back
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Advanced Booking Portal</Typography>
      </Box>

      <Stepper activeStep={activeStep === 4 ? 4 : activeStep} alternativeLabel sx={{ mb: 4 }}>
        <Step><StepLabel>Date & Slot Config</StepLabel></Step>
        <Step><StepLabel>Zone Wise Seat Selection</StepLabel></Step>
        <Step><StepLabel>Attendees Info</StepLabel></Step>
        <Step><StepLabel>Order Review & Payment</StepLabel></Step>
        <Step><StepLabel>Generated Passes</StepLabel></Step>
      </Stepper>

      {/* STEP 0: Config Dates, slots and qty */}
      {activeStep === 0 && (
        <Container maxWidth="md">
          <Card sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>1. Select Dates</Typography>
            <Grid container spacing={2}>
              {availableDates.map(date => {
                const isChecked = selectedDates.includes(date);
                return (
                  <Grid item xs={12} sm={4} key={date}>
                    <Paper
                      elevation={isChecked ? 4 : 1}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: isChecked ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        bgcolor: isChecked ? 'rgba(59, 130, 246, 0.04)' : '#fff',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                      }}
                      onClick={() => handleDateCheckboxChange(date, !isChecked)}
                    >
                      <Checkbox checked={isChecked} onChange={(e) => e.stopPropagation()} color="primary" />
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
              {availableDates.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning">No dates available for booking.</Alert>
                </Grid>
              )}
            </Grid>
          </Card>

          {selectedDates.map(date => {
            const config = dateConfigs[date];
            if (!config) return null;
            return (
              <Card key={date} sx={{ p: 3, mb: 3, borderLeft: '5px solid #8b5cf6' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#6441a5', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={18} /> Configuration for: {new Date(date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`slot-label-${date}`}>Select Timing Slot</InputLabel>
                      <Select
                        labelId={`slot-label-${date}`}
                        value={config.slotId}
                        label="Select Timing Slot"
                        onChange={(e) => handleConfigChange(date, 'slotId', Number(e.target.value))}
                      >
                        {slotsByDate[date]?.map(slot => (
                          <MenuItem key={slot.slotId} value={slot.slotId}>
                            {slot.slotName} ({slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`zone-label-${date}`}>Select Zone</InputLabel>
                      <Select
                        labelId={`zone-label-${date}`}
                        value={config.zoneId}
                        label="Select Zone"
                        onChange={(e) => handleConfigChange(date, 'zoneId', Number(e.target.value))}
                      >
                        {zones.map(z => (
                          <MenuItem key={z.zoneId} value={z.zoneId}>
                            {z.zoneName} (INR {z.seatPrice})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Quantity"
                      type="number"
                      size="small"
                      fullWidth
                      value={config.ticketQty}
                      onChange={(e) => handleConfigChange(date, 'ticketQty', Math.max(1, Number(e.target.value)))}
                      inputProps={{ min: 1, max: 10 }}
                    />
                  </Grid>
                </Grid>
              </Card>
            );
          })}

          <Card sx={{ p: 3, mb: 4 }}>
            <FormControlLabel
              control={<Checkbox checked={isGroupBooking} onChange={(e) => setIsGroupBooking(e.target.checked)} disabled={!event.allowGroupBooking} />}
              label="This is a Group Booking (Allows multiple guest attendees)"
            />
            {isGroupBooking && (
              <TextField
                label="Group Name"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            )}
            {!event.allowGroupBooking && (
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                * Group booking is not enabled for this event.
              </Typography>
            )}
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 6 }}>
            <Button variant="contained" size="large" onClick={validateAndProceedToSeats} sx={{ px: 4, py: 1.2, fontWeight: 700 }}>
              Proceed to Seat Selection
            </Button>
          </Box>
        </Container>
      )}

      {/* STEP 1: Seat map selector per date */}
      {activeStep === 1 && (
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Left selector bar */}
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>Booking Dates Queue</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {selectedDates.map(date => {
                    const isActive = currentSeatDate === date;
                    const config = dateConfigs[date];
                    const count = config ? config.selectedSeats.length : 0;
                    const required = config ? config.ticketQty : 0;

                    return (
                      <Button
                        key={date}
                        variant={isActive ? "contained" : "outlined"}
                        onClick={() => handleLoadSeatMap(date)}
                        sx={{
                          justifyContent: 'space-between',
                          textTransform: 'none',
                          fontWeight: 700,
                          py: 1.5,
                          borderRadius: 2
                        }}
                      >
                        <span>{new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                        <span>{count} / {required} Seats</span>
                      </Button>
                    );
                  })}
                </Box>
              </Card>

              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Selection Details</Typography>
                <Typography variant="body2" color="textSecondary">
                  Date: <strong>{currentSeatDate}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Slot: <strong>{dateConfigs[currentSeatDate]?.slotName}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Zone: <strong>{dateConfigs[currentSeatDate]?.zoneName}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.5, color: '#ff7597', fontWeight: 800 }}>
                  Locked Seats: {dateConfigs[currentSeatDate]?.selectedSeats.map(s => s.seatNumber).join(', ') || 'None'}
                </Typography>
              </Card>
            </Grid>

            {/* Right dynamic seat map */}
            <Grid item xs={12} md={9}>
              <Card sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Seating Map Layout for {new Date(currentSeatDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
                </Typography>

                {/* Simulated Stage */}
                <Box
                  sx={{
                    width: '60%',
                    mx: 'auto',
                    bgcolor: '#475569',
                    color: '#fff',
                    py: 1,
                    borderRadius: '0 0 20px 20px',
                    mb: 6,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 3 }}>STAGE DIRECTION</Typography>
                </Box>

                {loadingSeats ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography>Loading Seat Matrix...</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', overflowX: 'auto', py: 2 }}>
                    {(() => {
                      const seats = seatMapByDate[currentSeatDate] || [];
                      const rowsMap: { [key: string]: any[] } = {};
                      seats.forEach(s => {
                        const row = s.rowName || 'A';
                        if (!rowsMap[row]) rowsMap[row] = [];
                        rowsMap[row].push(s);
                      });

                      Object.keys(rowsMap).forEach(row => {
                        rowsMap[row].sort((a, b) => a.columnNo - b.columnNo);
                      });

                      return Object.keys(rowsMap).sort().map(rowName => (
                        <Box key={rowName} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography sx={{ width: 25, fontWeight: 'bold', color: '#94a3b8' }}>{rowName}</Typography>
                          {rowsMap[rowName].map(seat => {
                            const isSelected = dateConfigs[currentSeatDate]?.selectedSeats.some(s => s.seatId === seat.seatId);

                            // Colors
                            let bgColor = '#fff';
                            let textColor = '#475569';
                            let border = '1px solid #cbd5e1';

                            if (seat.seatStatus === 'Booked') {
                              bgColor = '#fee2e2';
                              textColor = '#ef4444';
                              border = '1px solid #fca5a5';
                            } else if (seat.seatStatus === 'Locked') {
                              bgColor = '#fef3c7';
                              textColor = '#d97706';
                              border = '1px solid #fcd34d';
                            } else if (isSelected) {
                              bgColor = '#dbeafe';
                              textColor = '#2563eb';
                              border = '2px solid #2563eb';
                            } else if (seat.isVIP) {
                              bgColor = '#faf5ff';
                              textColor = '#7c3aed';
                              border = '1px solid #d8b4fe';
                            }

                            return (
                              <Box
                                key={seat.seatId}
                                onClick={() => handleSeatClick(currentSeatDate, seat)}
                                sx={{
                                  width: 35,
                                  height: 35,
                                  borderRadius: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 'bold',
                                  cursor: (seat.seatStatus === 'Booked' || seat.seatStatus === 'Locked') ? 'not-allowed' : 'pointer',
                                  bgcolor: bgColor,
                                  color: textColor,
                                  border: border,
                                  transition: 'all 0.15s',
                                  '&:hover': {
                                    transform: (seat.seatStatus === 'Booked' || seat.seatStatus === 'Locked') ? 'none' : 'scale(1.15)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
                                  }
                                }}
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
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 5, pt: 3, borderTop: '1px solid #f1f5f9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 18, height: 18, bgcolor: '#fff', border: '1px solid #cbd5e1', borderRadius: 1.5 }} />
                    <Typography variant="caption">Available (Green)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 18, height: 18, bgcolor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 1.5 }} />
                    <Typography variant="caption">Booked (Red)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 18, height: 18, bgcolor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 1.5 }} />
                    <Typography variant="caption">Locked (Yellow)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 18, height: 18, bgcolor: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: 1.5 }} />
                    <Typography variant="caption">VIP (Purple)</Typography>
                  </Box>
                </Box>
              </Card>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 6 }}>
                <Button variant="outlined" onClick={() => setActiveStep(0)}>Back to configuration</Button>
                <Button variant="contained" onClick={handleSeatLockSubmit} sx={{ px: 4, py: 1.2, fontWeight: 700 }}>
                  Lock Seats & Enter Details
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      )}

      {/* STEP 2: Attendees details grid */}
      {activeStep === 2 && (
        <Container maxWidth="md">
          <Card sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>3. Add Attendees Details</Typography>
            {attendees.map((attendee, idx) => (
              <Box key={idx} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3, bgcolor: 'rgba(248, 250, 252, 0.5)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Attendee Ticket #{idx + 1}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="caption" sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', px: 1.5, py: 0.2, borderRadius: 10, fontWeight: 'bold' }}>
                      {new Date(attendee.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                    </Typography>
                    <Typography variant="caption" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', px: 1.5, py: 0.2, borderRadius: 10, fontWeight: 'bold' }}>
                      Seat: {attendee.seatNo}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      size="small"
                      required
                      value={attendee.attendeeName}
                      onChange={(e) => handleAttendeeValueChange(idx, 'attendeeName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Email"
                      fullWidth
                      size="small"
                      required
                      value={attendee.email}
                      onChange={(e) => handleAttendeeValueChange(idx, 'email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Phone Number"
                      fullWidth
                      size="small"
                      required
                      value={attendee.phoneNumber}
                      onChange={(e) => handleAttendeeValueChange(idx, 'phoneNumber', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
            <Button variant="outlined" onClick={() => setActiveStep(1)}>Back to Seats</Button>
            <Button variant="contained" onClick={handleAttendeesSubmit} sx={{ px: 4, py: 1.2, fontWeight: 700 }}>
              Review Order
            </Button>
          </Box>
        </Container>
      )}

      {/* STEP 3: Order Review and Simulated Payment */}
      {activeStep === 3 && (
        <Container maxWidth="md">
          <Grid container spacing={3}>
            {/* Summary Details */}
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Order Summary</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#3b82f6', mb: 2 }}>{event.eventName}</Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Booking Date-wise Seats</Typography>
                {selectedDates.map(date => {
                  const config = dateConfigs[date];
                  return (
                    <Box key={date} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' })} ({config.slotName})
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {config.selectedSeats.map(s => s.seatNumber).join(', ')} [{config.zoneName}]
                      </Typography>
                    </Box>
                  );
                })}

                {isGroupBooking && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>Group Booking Account:</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{groupName}</Typography>
                  </Box>
                )}
              </Card>

              {/* Lock Warning Timer */}
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fffbeb', borderColor: '#fef3c7', mb: 3 }}>
                <Lock size={20} color="#d97706" />
                <Typography variant="body2" color="#b45309">
                  Your seats are held. Time remaining to complete transaction: <strong>{formatTime(holdTimer)}</strong>.
                </Typography>
              </Paper>
            </Grid>

            {/* Price Calculations & Checkout Mode */}
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 3, mb: 3, bgcolor: '#f8fafc' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Pricing</Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="textSecondary">Subtotal:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>INR {subtotal.toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="textSecondary">GST Tax (18%):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>INR {tax.toFixed(2)}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>Grand Total:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#3b82f6' }}>INR {total.toFixed(2)}</Typography>
                </Box>

                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <InputLabel id="payment-mode-label">Payment Mode</InputLabel>
                  <Select
                    labelId="payment-mode-label"
                    value={paymentMode}
                    label="Payment Mode"
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <MenuItem value="CARD">Credit/Debit Card</MenuItem>
                    <MenuItem value="UPI">Simulated UPI Check</MenuItem>
                    <MenuItem value="NETBANKING">NetBanking Gateway</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleFinalBookingAndPayment}
                  disabled={processingPayment || isHoldExpired}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
                    borderRadius: 2.5
                  }}
                >
                  {processingPayment ? "Processing Transaction..." : "Complete Booking Payment"}
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}

      {/* STEP 4: Success, passes generation list with print/download option */}
      {activeStep === 4 && (
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <CheckCircle size={60} color="#10b981" />
            <Typography variant="h4" sx={{ fontWeight: 900, mt: 2, color: '#0f172a' }}>Booking Confirmed!</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Transaction successfully settled. Your reference: <strong style={{ color: '#2563eb' }}>{txnRef}</strong>
            </Typography>
            <Typography variant="caption" color="textSecondary">
              An email pass notification has been queued for dispatch.
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Your Entrance Passes</Typography>

          {loadingPasses ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
              <CircularProgress size={30} />
              <Typography variant="body2">Rendering entry passes...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
              {generatedPasses.map((pass) => (
                <Grid item xs={12} key={pass.passId} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Card sx={{ p: 0.5, borderRadius: 4, border: '1px solid #e2e8f0', width: 'fit-content' }}>
                    <div id={`pass-card-${pass.passId}`} style={{
                      display: 'flex',
                      width: 760,
                      height: 270,
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      {/* Left Stub */}
                      <div style={{
                        flex: 1.1,
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 24,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#60a5fa', letterSpacing: 2 }}>TRACKET ENTRY</div>
                        <div style={{ fontSize: 22, fontWeight: 900, textTransform: 'uppercase', marginTop: 30 }}>ENTRY PASS</div>
                        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, marginTop: 5 }}>VALID FOR EVENT</div>
                        <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)', marginTop: 'auto' }}>
                          Single Entry only. Present QR at the scanner checkpoint.
                        </div>
                      </div>

                      {/* Notches divider */}
                      <div style={{
                        width: 20,
                        backgroundColor: '#fff',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <div style={{ width: 20, height: 20, backgroundColor: '#f8fafc', borderRadius: '50%', position: 'absolute', top: -11 }} />
                        <div style={{ height: 'calc(100% - 30px)', borderLeft: '2px dashed #cbd5e1' }} />
                        <div style={{ width: 20, height: 20, backgroundColor: '#f8fafc', borderRadius: '50%', position: 'absolute', bottom: -11 }} />
                      </div>

                      {/* Right Detail Stub */}
                      <div style={{
                        flex: 1.4,
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        display: 'flex',
                        padding: '16px 20px',
                        boxSizing: 'border-box',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1.5 }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#1e3a8a' }}>{pass.eventName}</div>

                          <div style={{ fontSize: 15, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginTop: 4 }}>
                            {new Date(pass.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>

                          <div style={{ fontSize: 8.5, fontWeight: 700, color: '#475569', letterSpacing: 0.5 }}>
                            SLOT: {pass.slotName.toUpperCase()}
                          </div>

                          <div style={{
                            display: 'flex',
                            backgroundColor: '#fff',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            marginTop: 10,
                            width: 'fit-content',
                            gap: 12
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                              <span style={{ fontSize: 8, fontWeight: 800, color: '#2563eb' }}>SEAT</span>
                              <span style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a' }}>{pass.seatNumber || 'N/A'}</span>
                            </div>
                            <div style={{ width: 1, backgroundColor: 'rgba(59,130,246,0.15)', alignSelf: 'stretch' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                              <span style={{ fontSize: 8, fontWeight: 800, color: '#2563eb' }}>ZONE</span>
                              <span style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a' }}>{pass.zoneName || 'General'}</span>
                            </div>
                          </div>

                          <div style={{
                            backgroundColor: '#2563eb',
                            borderRadius: 6,
                            padding: '4px 10px',
                            color: '#fff',
                            fontSize: 8.5,
                            fontWeight: 800,
                            marginTop: 10,
                            width: 'fit-content'
                          }}>
                            HOLDER: {pass.attendeeName.toUpperCase()}
                          </div>
                        </div>

                        {/* QR Code Container */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 0.7, borderLeft: '1px dashed rgba(59,130,246,0.15)', paddingLeft: 16 }}>
                          <div style={{ backgroundColor: '#fff', padding: 6, borderRadius: 8, border: '1px solid rgba(0,0,0,0.05)' }}>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pass.qrCode || pass.passNo)}`}
                              alt="Pass QR Code"
                              style={{ width: 90, height: 90, display: 'block' }}
                            />
                          </div>
                          <span style={{ fontSize: 8, fontWeight: 800, color: '#1e3a8a', marginTop: 6 }}>{pass.passNo}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Box sx={{ mt: 1.5, mb: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Download size={14} />}
                      onClick={() => handleDownloadSingle(pass)}
                      disabled={downloadingSingle !== null}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      {downloadingSingle === pass.passNo ? "Exporting PNG..." : `Download Pass PNG`}
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 8 }}>
            <Button variant="contained" size="large" onClick={() => navigate('/bookings')} sx={{ px: 5, py: 1.2, fontWeight: 700 }}>
              Go to My Bookings
            </Button>
          </Box>
        </Container>
      )}
    </DashboardLayout>
  );
};

export default AdvancedBookingPage;
