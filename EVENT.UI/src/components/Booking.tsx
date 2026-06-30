import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, Radio, RadioGroup, FormControlLabel,
  Checkbox, TextField, Chip, Divider, Paper, Tab, Tabs, CircularProgress,
  IconButton
} from '@mui/material';
import TicketIcon from '@mui/icons-material/LocalActivity';
import PassIcon from '@mui/icons-material/ConfirmationNumber';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// --- API Integrations ---
import { commonApi } from '../api/commonApi';
import { bookingApi } from '../api/bookingApi';
import { paymentApi } from '../api/paymentApi';
import { blueprintApi, ZoneSeat } from '../api/blueprintApi';
import { passApi } from '../api/passApi';
import { ticketApi } from '../api/ticketApi';
import { toast } from 'sonner';


// --- Premium Styling Tokens ---
const colors = {
  primary: '#6C63FF',      // Vibrant Indigo/Purple accent
  primarySoft: '#F3F2FF',  // Very soft purple background
  green: '#22C55E',        // Success green
  greenSoft: '#DCFCE7',    // Green background for alerts
  greyDark: '#0F172A',     // Dark slate for text
  greyMuted: '#64748B',    // Muted grey for descriptions
  greyBorder: '#E2E8F0',   // Light border grey
  surface: '#FFFFFF',      // White card surface
  background: '#F8FAFC',   // Light gray background
};

// --- Interfaces ---
interface TicketItem {
  id: string;
  name: string;
  price: number;
  available: number;
  ticketCategoryId?: number;
}

interface PassItem {
  id: string;
  name: string;
  price: number;
  available: number;
}

interface ZoneItem {
  id: string;
  name: string;
  price: number;
  seats: number;
}

interface BookingProps {
  event?: any;
  onClose?: () => void;
}

export const Booking: React.FC<BookingProps> = ({ event, onClose }) => {
  // --- View Mode Toggle ---
  const [viewMode, setViewMode] = useState<'flow-map' | 'wizard'>('wizard');

  // --- Refs for Smooth Scrolling in Flow Map ---
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  // --- Loading States ---
  const [loadingData, setLoadingData] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loadingPasses, setLoadingPasses] = useState(false);

  // --- Dynamic Live Data States ---
  const [eventTickets, setEventTickets] = useState<TicketItem[]>([]);
  const [eventPasses, setEventPasses] = useState<PassItem[]>([]);
  const [eventZones, setEventZones] = useState<ZoneItem[]>([]);
  const [eventAddons, setEventAddons] = useState<any[]>([]);
  const [eventPromoCodes, setEventPromoCodes] = useState<any[]>([]);
  const [eventSlots, setEventSlots] = useState<any[]>([]);
  const [seats, setSeats] = useState<ZoneSeat[]>([]);
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState<string[]>([]);
  const [createdBookings, setCreatedBookings] = useState<any[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [generatedPasses, setGeneratedPasses] = useState<any[]>([]);

  // --- User Selection States ---

  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<'ticket' | 'pass'>('ticket');
  const [selectedItem, setSelectedItem] = useState('early-bird');
  const [selectedSlot, setSelectedSlot] = useState('19 Jun 2026, 09:00 AM - 06:00 PM');
  const [selectedSlotId, setSelectedSlotId] = useState<number | ''>('');
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [selectedZone, setSelectedZone] = useState('zone-2');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>(['A3', 'A7']);
  const [attendees, setAttendees] = useState([
    { name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '9999999999', seatNo: 'A3' },
    { name: 'Priya Patel', email: 'priye@gmail.com', phone: '8888888888', seatNo: 'A7' },
  ]);
  const [addons, setAddons] = useState<Record<string, boolean>>({
    parking: true,
    food: false,
    vip: true
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedPromoObj, setAppliedPromoObj] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // --- Payment hold states ---
  const [holdTimer, setHoldTimer] = useState<number>(600);
  const [isHoldExpired, setIsHoldExpired] = useState<boolean>(false);

  // --- Mock Fallback Data ---
  const mockTickets: TicketItem[] = [
    { id: 'early-bird', name: 'Early Bird', price: 499, available: 200 },
    { id: 'vip-ticket', name: 'VIP Ticket', price: 999, available: 50 },
    { id: 'regular-ticket', name: 'Regular Ticket', price: 299, available: 300 }
  ];

  const mockPasses: PassItem[] = [
    { id: 'vip-pass', name: 'VIP Pass (All Access)', price: 1999, available: 20 },
    { id: 'weekend-pass', name: 'Weekend Pass', price: 1299, available: 60 }
  ];

  const mockZones: ZoneItem[] = [
    { id: 'zone-1', name: 'Zone 1', price: 300, seats: 120 },
    { id: 'zone-2', name: 'Zone 2', price: 500, seats: 80 },
    { id: 'zone-3', name: 'Zone 3', price: 700, seats: 50 }
  ];

  const mockAddons = [
    { id: 'parking', name: 'Parking Pass', price: 200 },
    { id: 'food', name: 'Food Coupon', price: 150 },
    { id: 'vip', name: 'VIP Lounge Access', price: 300 }
  ];

  // --- Load Live Data (when Event is provided) ---
  useEffect(() => {
    if (!event) return;

    const loadLiveBookingData = async () => {
      setLoadingData(true);
      try {
        const [ticketsRes, passesRes, addonsRes, promoRes, ddlRes] = await Promise.all([
          ticketApi.getTickets(Number(event.eventId)),
          ticketApi.getPasses(Number(event.eventId)),
          ticketApi.getAddOns(Number(event.eventId)),
          ticketApi.getPromoCodes(Number(event.eventId)),
          commonApi.getBookingDDL()
        ]);

        if (ticketsRes.success && ticketsRes.data) {
          const mappedTix = ticketsRes.data.map(t => ({
            id: String(t.ticketId),
            name: t.ticketName,
            price: t.price,
            available: t.availableLimit,
            ticketCategoryId: t.ticketCategoryId
          }));
          setEventTickets(mappedTix);
          if (mappedTix.length > 0) {
            setSelectedItem(mappedTix[0].id);
          }
        }

        if (passesRes.success && passesRes.data) {
          setEventPasses(passesRes.data.map(p => ({
            id: String(p.eventPassId),
            name: p.passName,
            price: p.price,
            available: p.totalLimit
          })));
        }

        if (addonsRes.success && addonsRes.data) {
          setEventAddons(addonsRes.data);
          const defaultAddons: Record<string, boolean> = {};
          addonsRes.data.forEach(a => {
            defaultAddons[String(a.addOnId)] = false;
          });
          setAddons(defaultAddons);
        }

        if (promoRes.success && promoRes.data) {
          setEventPromoCodes(promoRes.data);
        }

        if (ddlRes.success && ddlRes.data) {
          const slots = ddlRes.data.eventSlots.filter((s: any) => s.eventId === Number(event.eventId));
          setEventSlots(slots);
          if (slots.length > 0) {
            setSelectedSlotId(slots[0].slotId);
            setSelectedSlotIds([slots[0].slotId]);
            const s = slots[0] as any;
            setSelectedSlot(`${new Date(s.slotDate || s.startDate || s.StartDate).toLocaleDateString()} (${s.startTime} - ${s.endTime})`);
          }

          const zonesMapped = ddlRes.data.zones
            .filter((z: any) => z.eventId === Number(event.eventId))
            .map((z: any) => ({
              id: String(z.value),
              name: z.label,
              price: z.seatPrice || 0,
              seats: z.capacity
            }));
          setEventZones(zonesMapped);
          if (zonesMapped.length > 0) {
            setSelectedZoneId(zonesMapped[0].id);
            setSelectedZone(zonesMapped[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading event DDL/ticket info:", err);
        toast.error("Failed to load event booking items.");
      } finally {
        setLoadingData(false);
      }
    };

    loadLiveBookingData();
  }, [event]);

  // --- Dynamic Live Seats Layout ---
  useEffect(() => {
    if (!event || !selectedZoneId || !selectedSlotId) return;

    const fetchLiveSeats = async () => {
      setLoadingSeats(true);
      try {
        const [seatsRes, availRes] = await Promise.all([
          blueprintApi.getSeatsByZone(Number(selectedZoneId), Number(event.eventId)),
          bookingApi.checkSeatAvailability(Number(event.eventId), Number(selectedSlotId))
        ]);

        if (seatsRes.success && seatsRes.data) {
          setSeats(seatsRes.data);
        }
        if (availRes.success && availRes.data) {
          const bookedList = availRes.data.bookedSeatNumbers || availRes.data.BookedSeatNumbers || [];
          setBookedSeatNumbers(bookedList);
        }
      } catch (err) {
        console.error("Failed to load live seats layout:", err);
      } finally {
        setLoadingSeats(false);
      }
    };

    fetchLiveSeats();
  }, [event, selectedZoneId, selectedSlotId]);

  // --- Reset selected seats when booking type or selected ticket/pass type changes ---
  useEffect(() => {
    setSelectedSeats([]);
    setAttendees([]);
  }, [bookingType, selectedItem]);

  // --- Live Mode Attendees Synchronization ---
  useEffect(() => {
    if (!event) return;
    const updated = selectedSeats.map(idOrNo => {
      const seatObj = seats.find(s => s.seatId.toString() === idOrNo);
      const seatName = seatObj 
        ? `${seatObj.seatNumber}${seatObj.assetName ? ` (${seatObj.assetName})` : ''}` 
        : idOrNo;
      const existing = attendees.find(a => a.seatNo === seatName);
      return existing || { name: '', email: '', phone: '', seatNo: seatName };
    });
    setAttendees(updated);
  }, [selectedSeats, event, seats]);

  // --- Payment Hold Timer ---
  useEffect(() => {
    let interval: any = null;
    if (step === 8 && holdTimer > 0 && !isHoldExpired && event) {
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
  }, [step, holdTimer, isHoldExpired, event]);

  // --- Fetch generated passes in live mode when booking confirms ---
  useEffect(() => {
    const fetchLivePasses = async () => {
      if (step === 9 && bookingSuccess && event) {
        setLoadingPasses(true);
        try {
          const userId = Number(localStorage.getItem('userId') || '0');
          const res = await passApi.getUserPasses(userId);
          if (res.success && res.data) {
             const bookingIds = createdBookings.map(b => {
               const id = b?.bookingId ?? b?.BookingId;
               return id ? Number(id) : null;
             }).filter(Boolean);
             const filtered = res.data.filter((p: any) => {
               const id = p?.bookingId ?? p?.BookingId;
               return id && bookingIds.includes(Number(id));
             });
             setGeneratedPasses(filtered);
          }
        } catch (err) {
          console.error("Error loading generated passes:", err);
        } finally {
          setLoadingPasses(false);
        }
      }
    };
    fetchLivePasses();
  }, [step, bookingSuccess, createdBookings, event]);

  // --- Smooth Scroll Cards on Step Change in Flow Map View ---
  useEffect(() => {
    if (viewMode === 'flow-map') {
      const activeCard = cardRefs.current[step - 1];
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [step, viewMode]);

  // --- Derived Configuration Variables ---
  const ticketsToUse = event ? eventTickets : mockTickets;
  const passesToUse = event ? eventPasses : mockPasses;
  const zonesToUse = event ? eventZones : mockZones;
  const addOnDetails = event ? eventAddons.map(a => ({ id: String(a.addOnId), name: a.addOnName, price: a.price })) : mockAddons;

  const activeItemObj = bookingType === 'ticket'
    ? ticketsToUse.find(t => t.id === selectedItem) || ticketsToUse[0]
    : passesToUse.find(p => p.id === selectedItem) || passesToUse[0];

  const zoneObj = zonesToUse.find(z => z.id === (event ? selectedZoneId : selectedZone)) || zonesToUse[0] || { name: 'General', price: 0, seats: 100 };
  const ticketCount = selectedSeats.length;
  
  // Total base ticket price calculation
  const ticketBasePrice = activeItemObj ? activeItemObj.price : 0;
  const slotCount = event ? Math.max(1, selectedSlotIds.length) : 1;
  const basePriceSum = event
    ? (Number(zoneObj.price) || ticketBasePrice) * ticketCount * slotCount
    : ticketBasePrice * ticketCount;

  // Add-on calculation
  let addOnSum = 0;
  addOnDetails.forEach(a => {
    if (addons[a.id]) {
      addOnSum += a.price;
    }
  });

  // Promo code validation & calculation
  const promoDiscountValue = event && appliedPromoObj
    ? (appliedPromoObj.discountTypeId === 2 ? (basePriceSum * appliedPromoObj.discountValue) / 100 : appliedPromoObj.discountValue)
    : (promoApplied ? 100 : 0);

  const discount = Math.min(basePriceSum + addOnSum, promoDiscountValue);
  const subtotal = Math.max(0, basePriceSum + addOnSum - discount);
  const gst = subtotal * 0.18;
  const platformFee = event ? (50 * slotCount) : 50;
  const totalPayable = subtotal + gst + platformFee;

  // --- Action Handlers ---
  const handleApplyPromoCode = () => {
    if (!event) {
      setPromoApplied(true);
      toast.success("Mock Promo SAVE10 applied!");
      return;
    }
    const match = eventPromoCodes.find(p => p.promoCode.toLowerCase() === promoCode.trim().toLowerCase());
    if (match) {
      setAppliedPromoObj(match);
      setPromoApplied(true);
      toast.success(`Promo code ${match.promoCode} applied successfully!`);
    } else {
      setAppliedPromoObj(null);
      setPromoApplied(false);
      toast.error('Invalid promo code.');
    }
  };

  const handleNext = async () => {
    if (step === 2) {
      if (!selectedItem) {
        toast.error('Please select a Ticket or Pass Type to continue.');
        return;
      }
    }
    if (step === 3) {
      if (!selectedSlotId) {
        toast.error('Please select an event slot to continue.');
        return;
      }
      if (!selectedZoneId && !selectedZone) {
        toast.error('Please select a zone to continue.');
        return;
      }
    }
    if (step === 4) {
      if (selectedSeats.length === 0) {
        toast.error('Please select at least one seat to continue.');
        return;
      }
    }
    if (step === 5) {
      for (let i = 0; i < attendees.length; i++) {
        const att = attendees[i];
        if (!att.name?.trim()) {
          toast.error(`Please enter Name for attendee ${i + 1} (${att.seatNo}).`);
          return;
        }
        if (!att.email?.trim()) {
          toast.error(`Please enter Email for attendee ${i + 1} (${att.seatNo}).`);
          return;
        }
        if (!att.phone?.trim()) {
          toast.error(`Please enter Phone for attendee ${i + 1} (${att.seatNo}).`);
          return;
        }
      }
    }

    if (event && step === 7) {
      // Create Database Temporary hold
      setSubmitting(true);
      try {
        // First cancel any old held seats to prevent conflicts
        const bookingsToCancel = createdBookings.length > 0 ? createdBookings : (bookingSuccess ? [bookingSuccess] : []);
        for (const old of bookingsToCancel) {
          if (old?.bookingRId) {
            await bookingApi.cancelBooking(old.bookingRId, 'Re-creating booking hold');
          }
        }

        const userId = Number(localStorage.getItem('userId') || '0');
        const slotsToBook = selectedSlotIds.length > 0 ? selectedSlotIds : [Number(selectedSlotId)];

        const payload = {
          bookingId: 0,
          bookingRId: "",
          eventId: Number(event.eventId),
          slotId: slotsToBook[0],
          selectedSlotIds: slotsToBook,
          zoneId: Number(selectedZoneId),
          userId: userId,
          totalTickets: ticketCount,
          bookingStatus: 0, // Held
          totalAmount: basePriceSum,
          bookingTypeId: bookingType === 'ticket' ? 1 : 2,
          ticketTypeId: bookingType === 'ticket' && selectedItem ? Number(selectedItem) : null,
          passTypeId: bookingType === 'pass' && selectedItem ? Number(selectedItem) : null,
          promoCodeId: appliedPromoObj ? Number(appliedPromoObj.promoCodeId) : null,
          addOnIds: Object.keys(addons).filter(id => addons[id]).map(Number),
          createdBy: localStorage.getItem('email') || localStorage.getItem('userName') || "Visitor",
          createdFrom: "Frontend Web",
          updatedBy: localStorage.getItem('email') || localStorage.getItem('userName') || "Visitor",
          updatedFrom: "Frontend Web",
          attendees: attendees.map(a => ({
            attendeeName: a.name.trim(),
            email: a.email.trim(),
            phoneNumber: a.phone.trim(),
            seatNo: a.seatNo
          }))
        };

        const res = await bookingApi.createBooking(payload);
        if (res.success && res.data) {
          setCreatedBookings([res.data]);
          setBookingSuccess(res.data);
          setHoldTimer(600);
          setIsHoldExpired(false);
          setStep(8);
          toast.success('Seats are temporarily held. Proceeding to payment.');
        } else {
          toast.error(res.message || 'Failed to reserve seats.');
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Error holding seats.');
      } finally {
        setSubmitting(false);
      }
    } else if (event && step === 8) {
      // Perform database payment simulation
      setProcessingPayment(true);
      try {
        const bookingsToPay = createdBookings.length > 0 ? createdBookings : [bookingSuccess];
        if (bookingsToPay.length === 0 || !bookingsToPay[0]) return;

        let payFailed = false;
        for (const booking of bookingsToPay) {
          const txRef = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
          const userStr = localStorage.getItem('user');
          const userObj = userStr ? JSON.parse(userStr) : null;
          const userEmail = localStorage.getItem('email') || userObj?.emailId || userObj?.email || userObj?.userName || 'system';
          const res = await paymentApi.addPayment({
            bookingId: booking?.bookingId || booking?.BookingId,
            transactionReference: txRef,
            amount: totalPayable,
            paymentMode: paymentMethod.toUpperCase(),
            createdBy: userEmail
          });

          if (!res.success) {
            payFailed = true;
            toast.error(res.message || 'Payment confirmation failed.');
            break;
          }
        }

        if (!payFailed) {
          toast.success('Payment successful! Entry passes generated.');
          setStep(9); // Move to final success page
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Payment processing error.');
      } finally {
        setProcessingPayment(false);
      }
    } else {
      if (step < 8) setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCancelBooking = async () => {
    const bookingsToCancel = createdBookings.length > 0 ? createdBookings : (bookingSuccess ? [bookingSuccess] : []);
    if (bookingsToCancel.length > 0) {
      try {
        for (const booking of bookingsToCancel) {
          const rId = booking?.bookingRId || booking?.BookingRId;
          if (rId) {
            await bookingApi.cancelBooking(rId, 'Payment Cancelled by Visitor');
          }
        }
        toast.info('Holds released.');
      } catch (e) {
        console.error('Failed to release booking holds:', e);
      }
    }
    if (onClose) onClose();
  };

  const toggleSeat = (seatNo: string) => {
    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNo));
    } else {
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  const updateAttendee = (index: number, field: string, value: string) => {
    const list = [...attendees];
    list[index] = { ...list[index], [field]: value };
    setAttendees(list);
  };



  const stepTitles = [
    { num: 1, title: 'Select Booking Type', desc: 'Choose what you want to book.' },
    { num: 2, title: 'Select Ticket / Pass Type', desc: 'Select any one Ticket Type or Pass Type.' },
    { num: 3, title: 'Select Slot & Zone', desc: 'Choose event slot and zone.' },
    { num: 4, title: 'Select Seat(s)', desc: 'Choose available seat(s) on layout.' },
    { num: 5, title: 'Attendee Details', desc: 'Enter attendee/holder details.' },
    { num: 6, title: 'Add-ons & Promo Code', desc: 'Select add-ons (if any) and apply promo code.' },
    { num: 7, title: 'Review Order', desc: 'Review full order summary including tax & fees.' },
    { num: 8, title: 'Payment', desc: 'Make payment through available methods.' }
  ];

  if (loadingData) {
    return (
      <Box sx={{ width: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={45} />
        <Typography variant="body2" sx={{ color: colors.greyMuted }}>Loading event options...</Typography>
      </Box>
    );
  }

  // --- Sub-render Steps helper ---
  const renderStep = (sNum: number) => {
    switch (sNum) {
      case 1:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Book Now</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: colors.greyMuted, mb: 3.5 }}>{event ? event.eventName : 'Event First'}</Typography>
            
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 1.5, color: colors.greyDark }}>Select Booking Type</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper 
                onClick={() => setBookingType('ticket')}
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3, 
                  border: `2px solid ${bookingType === 'ticket' ? colors.primary : colors.greyBorder}`,
                  cursor: 'pointer',
                  bgcolor: bookingType === 'ticket' ? colors.primarySoft : '#FFF',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box sx={{ 
                  p: 1.2, 
                  borderRadius: 2, 
                  bgcolor: bookingType === 'ticket' ? colors.primary : '#E2E8F0',
                  color: bookingType === 'ticket' ? '#FFF' : colors.greyMuted
                }}>
                  <TicketIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: colors.greyDark }}>Ticket</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: colors.greyMuted }}>Book specific ticket with a seat.</Typography>
                </Box>
                <Radio checked={bookingType === 'ticket'} color="primary" size="small" />
              </Paper>

              <Paper 
                onClick={() => setBookingType('pass')}
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3, 
                  border: `2px solid ${bookingType === 'pass' ? colors.primary : colors.greyBorder}`,
                  cursor: 'pointer',
                  bgcolor: bookingType === 'pass' ? colors.primarySoft : '#FFF',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box sx={{ 
                  p: 1.2, 
                  borderRadius: 2, 
                  bgcolor: bookingType === 'pass' ? colors.green : '#E2E8F0',
                  color: '#FFF'
                }}>
                  <PassIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: colors.greyDark }}>Pass</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: colors.greyMuted }}>Book pass for the event (with seat allocation).</Typography>
                </Box>
                <Radio checked={bookingType === 'pass'} color="primary" size="small" />
              </Paper>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Select Item</Typography>
            
            <Tabs 
              value={bookingType === 'ticket' ? 0 : 1} 
              onChange={(_, val) => {
                const type = val === 0 ? 'ticket' : 'pass';
                setBookingType(type);
                setSelectedItem(type === 'ticket' ? (ticketsToUse[0]?.id || '') : (passesToUse[0]?.id || ''));
              }}
              sx={{ 
                mb: 3, 
                borderBottom: `1px solid ${colors.greyBorder}`,
                '& .MuiTabs-indicator': { bgcolor: colors.primary },
                '& .MuiTab-root.Mui-selected': { color: colors.primary }
              }}
            >
              <Tab label="Tickets" sx={{ textTransform: 'none', fontWeight: 700 }} />
              <Tab label="Passes" sx={{ textTransform: 'none', fontWeight: 700 }} />
            </Tabs>

            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 1.5, color: colors.greyDark }}>Available Types</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {bookingType === 'ticket' ? (
                ticketsToUse.map(t => (
                  <Paper 
                    key={t.id} 
                    onClick={() => setSelectedItem(t.id)}
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2.5, 
                      border: `1.5px solid ${selectedItem === t.id ? colors.primary : colors.greyBorder}`,
                      bgcolor: selectedItem === t.id ? colors.primarySoft : '#FFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    <Radio checked={selectedItem === t.id} size="small" />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.86rem' }}>{t.name}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: colors.greyMuted }}>₹{t.price}.00</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: colors.greyMuted }}>{t.available} available</Typography>
                  </Paper>
                ))
              ) : (
                passesToUse.map(p => (
                  <Paper 
                    key={p.id} 
                    onClick={() => setSelectedItem(p.id)}
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2.5, 
                      border: `1.5px solid ${selectedItem === p.id ? colors.primary : colors.greyBorder}`,
                      bgcolor: selectedItem === p.id ? colors.primarySoft : '#FFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    <Radio checked={selectedItem === p.id} size="small" />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.86rem' }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: colors.greyMuted }}>₹{p.price}.00</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: colors.greyMuted }}>{p.available} available</Typography>
                  </Paper>
                ))
              )}
              {((bookingType === 'ticket' ? ticketsToUse : passesToUse).length === 0) && (
                <Typography sx={{ fontSize: '0.8rem', color: colors.greyMuted, textAlign: 'center', py: 4 }}>
                  No available items found.
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Select Slot & Zone</Typography>
            
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 1, color: colors.greyDark }}>Select Slot</Typography>
            {event ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3.5 }}>
                {eventSlots.map(s => {
                  const isSel = selectedSlotIds.includes(s.slotId);
                  return (
                    <Paper 
                      key={s.slotId}
                      onClick={() => {
                        if (event.allowMultipleDateBooking || event.allowMultiSlotBooking) {
                          const updated = isSel ? selectedSlotIds.filter(id => id !== s.slotId) : [...selectedSlotIds, s.slotId];
                          setSelectedSlotIds(updated);
                          if (updated.length > 0) setSelectedSlotId(updated[0]);
                        } else {
                          setSelectedSlotId(s.slotId);
                          setSelectedSlotIds([s.slotId]);
                          setSelectedSlot(`${new Date(s.slotDate || s.startDate || s.StartDate).toLocaleDateString()} (${s.startTime} - ${s.endTime})`);
                        }
                        setSelectedSeats([]);
                        setAttendees([]);
                      }}
                      elevation={0}
                      sx={{
                        p: 1.8,
                        borderRadius: 2.5,
                        border: `1.5px solid ${isSel ? colors.primary : colors.greyBorder}`,
                        bgcolor: isSel ? colors.primarySoft : '#FFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                      }}
                    >
                      <Checkbox checked={isSel} size="small" />
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>{new Date(s.slotDate || s.startDate || s.StartDate).toLocaleDateString()}</Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: colors.greyMuted }}>{s.startTime} - {s.endTime}</Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              <Paper elevation={0} sx={{ 
                p: 1.8, 
                borderRadius: 2.5, 
                border: `1.5px solid ${colors.greyBorder}`, 
                mb: 3.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <DateRangeIcon sx={{ color: colors.primary }} />
                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>19 Jun 2026</Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: colors.greyMuted }}>09:00 AM - 06:00 PM</Typography>
                </Box>
              </Paper>
            )}

            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 1, color: colors.greyDark }}>Select Zone</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {zonesToUse.map(z => {
                const isSel = event ? (selectedZoneId === z.id) : (selectedZone === z.id);
                return (
                  <Paper 
                    key={z.id}
                    onClick={() => {
                      if (event) {
                        setSelectedZoneId(z.id);
                      } else {
                        setSelectedZone(z.id);
                      }
                      setSelectedSeats([]);
                      setAttendees([]);
                    }}
                    elevation={0}
                    sx={{ 
                      p: 1.8, 
                      borderRadius: 2.5, 
                      border: `1.5px solid ${isSel ? colors.primary : colors.greyBorder}`,
                      bgcolor: isSel ? colors.primarySoft : '#FFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    <Radio checked={isSel} size="small" />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                        {z.name} <span style={{ color: colors.greyMuted, fontWeight: 500 }}>(INR {z.price})</span>
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.74rem', color: colors.greyMuted }}>{z.seats} Seats</Typography>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, alignSelf: 'flex-start', width: '100%' }}>Select Seats</Typography>

            {/* Flat Legend */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 3, mb: 3, width: '100%' }}>
              {[
                { col: '#10B981', lab: 'Available' },
                { col: colors.primary, lab: 'Selected' },
                { col: '#E2E8F0', lab: 'Booked' }
              ].map(({ col, lab }) => (
                <Box key={lab} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '4px', 
                    bgcolor: col,
                  }} />
                  <Typography sx={{ fontSize: '0.74rem', color: colors.greyMuted, fontWeight: 700 }}>{lab}</Typography>
                </Box>
              ))}
            </Box>

            {/* Subtitle Zone Layout */}
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 850, mb: 2.5, width: '100%', textAlign: 'left', color: colors.greyDark }}>
              {zoneObj ? `${zoneObj.name} – Layout` : 'Layout'}
            </Typography>

            {loadingSeats ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
                <CircularProgress size={32} />
                <Typography sx={{ fontSize: '0.8rem', color: colors.greyMuted }}>Loading seating layout...</Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', mb: 4 }}>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: 1.5, 
                  justifyContent: 'center',
                  bgcolor: '#FFF',
                  p: 1
                }}>
                  {seats.map(seat => {
                    const fullSeatName = `${seat.seatNumber}${seat.assetName ? ` (${seat.assetName})` : ''}`;
                    const isBooked = bookedSeatNumbers.includes(fullSeatName) || seat.isBooked || seat.isBlocked || seat.isReserved;
                    const isSelected = selectedSeats.includes(seat.seatId.toString());

                    let bg = '#D1FAE5'; // Soft green background
                    let color = '#065F46'; // Green text
                    let border = '1px solid #A7F3D0';

                    if (isBooked) {
                      bg = '#E5E7EB'; // Grey background
                      color = '#4B5563'; // Dark text
                      border = '1px solid #D1D5DB';
                    } else if (isSelected) {
                      bg = colors.primary; // Purple background
                      color = '#FFF'; // White text
                      border = `1.5px solid ${colors.primary}`;
                    }

                    return (
                      <Box
                        key={seat.seatId}
                        onClick={() => !isBooked && toggleSeat(seat.seatId.toString())}
                        sx={{
                          height: 52,
                          borderRadius: 2,
                          bgcolor: bg,
                          color: color,
                          border: border,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          transition: 'all 0.1s ease',
                          gap: 0.2,
                          '&:hover': !isBooked ? {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                          } : {},
                          '&:active': !isBooked ? {
                            transform: 'scale(0.95)'
                          } : {}
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.1 }}>
                          {seat.seatNumber}
                        </Typography>
                        {seat.assetName && (
                          <Typography sx={{ 
                            fontSize: '0.54rem', 
                            fontWeight: 700, 
                            opacity: 0.85, 
                            lineHeight: 1.1,
                            textTransform: 'capitalize',
                            textAlign: 'center',
                            maxWidth: '90%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {seat.assetName.replace("Plastic ", "").replace("Three Seater ", "")}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                {seats.length === 0 && (
                  <Typography sx={{ py: 4, fontSize: '0.8rem', color: colors.greyMuted, textAlign: 'center' }}>
                    No seating layout configured for this zone.
                  </Typography>
                )}
              </Box>
            )}

            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, mb: 1.5, color: colors.greyDark, width: '100%', textAlign: 'left' }}>Selected Seats</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%', mb: 1 }}>
              {selectedSeats.map(idOrNo => {
                const seatObj = seats.find(s => s.seatId.toString() === idOrNo);
                const displayLabel = seatObj 
                  ? `${seatObj.seatNumber}${seatObj.assetName ? ` (${seatObj.assetName})` : ''}` 
                  : idOrNo;
                return (
                  <Chip 
                    key={idOrNo}
                    label={displayLabel}
                    onDelete={() => toggleSeat(idOrNo)}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: colors.primary, color: colors.primary, fontWeight: 700 }}
                  />
                );
              })}
              {selectedSeats.length === 0 && (
                <Typography sx={{ fontSize: '0.74rem', color: colors.greyMuted }}>No seat selected yet.</Typography>
              )}
            </Box>
          </Box>
        );

      case 5:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Attendee Details</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {attendees.map((att, idx) => (
                <Box key={idx}>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: colors.greyDark, mb: 1.5 }}>
                    Attendee {idx + 1} {att.seatNo ? `(Seat: ${att.seatNo})` : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField 
                      label="Full Name" 
                      required
                      fullWidth 
                      size="small" 
                      value={att.name}
                      onChange={(e) => updateAttendee(idx, 'name', e.target.value)}
                    />
                    <TextField 
                      label="Email" 
                      required
                      fullWidth 
                      size="small" 
                      value={att.email}
                      onChange={(e) => updateAttendee(idx, 'email', e.target.value)}
                    />
                    <TextField 
                      label="Phone" 
                      required
                      fullWidth 
                      size="small" 
                      value={att.phone}
                      onChange={(e) => updateAttendee(idx, 'phone', e.target.value)}
                    />
                  </Box>
                </Box>
              ))}
              {attendees.length === 0 && (
                <Typography sx={{ fontSize: '0.8rem', color: colors.greyMuted, textAlign: 'center', py: 4 }}>
                  Please select seats first to fill details.
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 6:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Add-ons & Promo</Typography>
            
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 1.5, color: colors.greyDark }}>Add-ons</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4 }}>
              {addOnDetails.map((a) => (
                <Paper 
                  key={a.id}
                  elevation={0}
                  onClick={() => setAddons({ ...addons, [a.id]: !addons[a.id] })}
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    border: `1px solid ${addons[a.id] ? colors.primary : colors.greyBorder}`,
                    bgcolor: addons[a.id] ? colors.primarySoft : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <FormControlLabel
                    control={<Checkbox checked={!!addons[a.id]} size="small" color="primary" />}
                    label={<span style={{ fontWeight: 600, fontSize: '0.85rem', color: colors.greyDark }}>{a.name}</span>}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => setAddons({ ...addons, [a.id]: !addons[a.id] })}
                  />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>₹{a.price}.00</Typography>
                </Paper>
              ))}
              {addOnDetails.length === 0 && (
                <Typography sx={{ fontSize: '0.74rem', color: colors.greyMuted }}>No add-ons available.</Typography>
              )}
            </Box>

            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 1.5, color: colors.greyDark }}>Promo Code</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField 
                placeholder="e.g. SAVE10"
                size="small" 
                fullWidth 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button 
                variant="contained" 
                onClick={handleApplyPromoCode}
                sx={{ bgcolor: colors.primary, boxShadow: 'none', fontWeight: 700, '&:hover': { bgcolor: '#5A52FF' } }}
              >
                Apply
              </Button>
            </Box>

            {promoApplied && (
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: colors.greenSoft, 
                border: `1.5px solid ${colors.green}`,
                color: colors.green,
                mb: 2
              }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>Promo applied successfully!</Typography>
                <Typography sx={{ fontSize: '0.74rem' }}>
                  You saved ₹{discount.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 7:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3.5 }}>Order Summary</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {[
                { label: 'Item', value: activeItemObj ? activeItemObj.name : 'Ticket' },
                { label: 'Slot', value: selectedSlot },
                { label: 'Zone', value: `${zoneObj.name} (INR ${zoneObj.price})` },
                { label: 'Seats', value: selectedSeats.join(', ') || 'None' },
                { label: 'Quantity', value: `${ticketCount} Ticket(s)` }
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: colors.greyMuted, fontWeight: 500 }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.greyDark, textAlign: 'right' }}>{value}</Typography>
                </Box>
              ))}
              
              <Divider sx={{ my: 1.5, borderColor: colors.greyBorder }} />

              {[
                { label: 'Ticket Price', value: `₹${basePriceSum.toFixed(2)}`, isGreen: false },
                { label: 'Add-ons', value: `₹${addOnSum.toFixed(2)}`, isGreen: false },
                { label: 'Discount', value: `-₹${discount.toFixed(2)}`, isGreen: true }
              ].map(({ label, value, isGreen }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: colors.greyMuted, fontWeight: 500 }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: isGreen ? colors.green : colors.greyDark }}>{value}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

              {[
                { label: 'Subtotal', value: `₹${subtotal.toFixed(2)}` },
                { label: 'GST (18%)', value: `₹${gst.toFixed(2)}` },
                { label: 'Platform Fee', value: `₹${platformFee.toFixed(2)}` }
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: colors.greyMuted, fontWeight: 500 }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: colors.greyDark }}>{value}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1.5, borderColor: colors.greyBorder }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: colors.greyDark }}>Total Payable</Typography>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: colors.primary }}>
                  ₹{totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Box>
        );

      case 8:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Payment</Typography>

            {event && bookingSuccess && (
              <Box sx={{ 
                bgcolor: '#FFFBEB', 
                border: '1.5px solid #FEF3C7', 
                borderRadius: 2.5, 
                p: 1.5, 
                mb: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#78350F' }}>
                  Temporary Hold Timer
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#B45309' }}>
                  {Math.floor(holdTimer / 60)}:{(holdTimer % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
            )}

            {isHoldExpired ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="error" sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 1 }}>Hold Expired!</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: colors.greyMuted, mb: 2 }}>
                  Your temporary seat holds have expired. Please start over to re-select seats.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setStep(4)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                  Start Over
                </Button>
              </Box>
            ) : (
              <>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 1.5, color: colors.greyDark }}>Select Payment Method</Typography>
                <RadioGroup 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  {[
                    ['upi', 'UPI'],
                    ['card', 'Credit / Debit Card'],
                    ['netbanking', 'Net Banking'],
                    ['wallet', 'Wallet'],
                    ['venue', 'Pay at Venue']
                  ].map(([val, label]) => {
                    const isSelected = paymentMethod === val;
                    return (
                      <Paper 
                        key={val}
                        onClick={() => setPaymentMethod(val)}
                        elevation={0}
                        sx={{ 
                          p: 1.8, 
                          borderRadius: 2.5, 
                          border: `1.5px solid ${isSelected ? colors.primary : colors.greyBorder}`,
                          bgcolor: isSelected ? colors.primarySoft : '#FFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5
                        }}
                      >
                        <Radio value={val} checked={isSelected} size="small" />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: colors.greyDark }}>{label}</Typography>
                      </Paper>
                    );
                  })}
                </RadioGroup>
              </>
            )}
          </Box>
        );

      case 9: // Confirmation step
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: colors.greenSoft,
              color: colors.green,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <CheckCircleIcon sx={{ fontSize: 35 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: colors.greyDark, mb: 1 }}>
              Booking Confirmed!
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: colors.greyMuted, mb: 4 }}>
              Your order has been processed. Here is your reference:
            </Typography>

            {bookingSuccess && (
              <CardPaper sx={{ p: 2.5, bgcolor: colors.background, borderRadius: 3, mb: 4, border: '1px dashed #CBD5E1' }}>
                <Typography sx={{ fontSize: '0.64rem', color: colors.greyMuted, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                  Booking Reference
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: colors.primary, mb: 1.5 }}>
                  {bookingSuccess.bookingReference || bookingSuccess.BookingReference || `BK-${bookingSuccess.bookingId || bookingSuccess.BookingId}`}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.74rem', color: colors.greyMuted }}>Tickets</Typography>
                    <Typography sx={{ fontSize: '0.74rem', fontWeight: 700 }}>
                      {(bookingSuccess.totalTickets ?? bookingSuccess.TotalTickets ?? ticketCount)} Seats ({((bookingSuccess.attendees ?? bookingSuccess.Attendees ?? []).map((a: any) => a.seatNo ?? a.SeatNo).filter(Boolean).join(', ') || selectedSeats.join(', '))})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.74rem', color: colors.greyMuted }}>Amount Paid</Typography>
                    <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: colors.green }}>₹{totalPayable.toFixed(2)}</Typography>
                  </Box>
                </Box>
              </CardPaper>
            )}

            {event && (
              <Box sx={{ mb: 4, textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Your Entry Passes:</Typography>
                {loadingPasses ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography sx={{ fontSize: '0.74rem', color: colors.greyMuted }}>Loading passes...</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {generatedPasses.map((pass, index) => (
                      <Box key={index} sx={{ p: 1.5, border: `1px solid ${colors.greyBorder}`, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{pass.holderName || pass.HolderName}</Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: colors.greyMuted }}>Seat: {pass.seatNo || pass.SeatNo} | Code: {pass.passCode || pass.PassCode}</Typography>
                        </Box>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => window.open(`/booking/${bookingSuccess.bookingId || bookingSuccess.BookingId}/passes`, '_blank')}
                          sx={{ fontSize: '0.64rem', textTransform: 'none', borderRadius: 1.5 }}
                        >
                          View
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            <Button 
              fullWidth
              variant="contained"
              onClick={onClose}
              sx={{ bgcolor: colors.primary, borderRadius: 2.5, py: 1.3, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#5A52FF' } }}
            >
              Done & Close
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', py: 2 }}>

      {/* --- Stepper Indicators (Progress Tracker) --- */}
      {viewMode === 'wizard' && (
        <Box sx={{ 
          maxWidth: 1200, 
          mx: 'auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          overflowX: 'auto', 
          pb: 3, 
          mb: 4, 
          gap: 2,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: colors.greyBorder, borderRadius: 3 }
        }}>
          {stepTitles.map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <Box key={s.num} sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 1, 
                minWidth: 160, 
                opacity: isActive ? 1 : (isCompleted ? 0.85 : 0.4),
                transition: 'opacity 0.2s'
              }}>
                <Box sx={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  bgcolor: isActive || isCompleted ? colors.primary : '#E2E8F0',
                  color: isActive || isCompleted ? '#FFF' : colors.greyMuted,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {isCompleted ? '✓' : s.num}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: colors.greyDark, lineHeight: 1.2 }}>
                    {s.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: colors.greyMuted, mt: 0.25, display: { xs: 'none', md: 'block' } }}>
                    {s.desc}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* --- CONTENT WORKSPACE --- */}
      {viewMode === 'flow-map' ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'stretch', 
          gap: 2, 
          overflowX: 'auto', 
          py: 4, 
          px: 3,
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 4 }
        }}>
          {(step === 9 ? [...stepTitles, { num: 9, title: 'Confirmed', desc: 'Summary' }] : stepTitles).map((s) => {
            const isCardActive = step === s.num;
            const isCardCompleted = step > s.num;
            const isCardDisabled = step < s.num;

            return (
              <React.Fragment key={s.num}>
                <Paper
                  ref={(el) => { cardRefs.current[s.num - 1] = el; }}
                  elevation={0}
                  sx={{
                    width: 380,
                    flexShrink: 0,
                    borderRadius: 4,
                    border: `2px solid ${isCardActive ? colors.primary : colors.greyBorder}`,
                    boxShadow: isCardActive ? '0 10px 40px rgba(108, 99, 255, 0.15)' : '0 10px 30px rgba(0,0,0,0.02)',
                    bgcolor: colors.surface,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 580,
                    position: 'relative',
                    opacity: isCardActive ? 1 : (isCardCompleted ? 0.8 : 0.35),
                    pointerEvents: isCardDisabled ? 'none' : 'auto',
                    transition: 'all 0.3s ease',
                    transform: isCardActive ? 'scale(1.02)' : 'scale(1.0)',
                  }}
                >
                  {/* Card Header inside horizontal Flow Map */}
                  <Box sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isCardActive ? colors.primary : colors.greyMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Step {s.num === 9 ? 'Success' : `${s.num} of 8`}
                    </Typography>
                    {isCardCompleted && (
                      <CheckCircleIcon sx={{ color: colors.green, fontSize: 20 }} />
                    )}
                  </Box>

                  {/* Content workspace inside Card */}
                  <Box sx={{ px: 3, pb: 12, flex: 1, overflowY: 'auto' }}>
                    {renderStep(s.num)}
                  </Box>

                  {/* Floating Footer inside Card */}
                  {s.num < 9 && (
                    <Box sx={{
                      p: 3,
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(4px)',
                      borderTop: `1px solid ${colors.greyBorder}`
                    }}>
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={isCardDisabled || submitting || processingPayment || isHoldExpired}
                        onClick={handleNext}
                        sx={{
                          bgcolor: isCardActive ? colors.primary : '#E2E8F0',
                          color: isCardActive ? '#FFF' : colors.greyMuted,
                          boxShadow: 'none',
                          borderRadius: 2.5,
                          py: 1.5,
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#5A52FF', boxShadow: 'none' }
                        }}
                      >
                        {submitting || processingPayment ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : s.num === 7 ? (
                          'Proceed to Payment'
                        ) : s.num === 8 ? (
                          'Pay Now'
                        ) : (
                          'Continue'
                        )}
                      </Button>
                      {s.num === 8 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 1.25 }}>
                          <LockIcon sx={{ fontSize: 13, color: colors.greyMuted }} />
                          <Typography sx={{ fontSize: '0.72rem', color: colors.greyMuted, fontWeight: 600 }}>
                            Secure Payment
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>

                {s.num < 8 && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primary,
                    opacity: step >= s.num ? 0.9 : 0.25,
                    transition: 'opacity 0.3s ease',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    px: 1
                  }}>
                    <ArrowForwardIcon sx={{ fontSize: 28, color: colors.primary }} />
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </Box>
      ) : (
        /* --- wizard mode: centered active card --- */
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Paper elevation={0} sx={{ 
            width: '100%', 
            maxWidth: 450, 
            borderRadius: 4, 
            border: `1px solid ${colors.greyBorder}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
            bgcolor: colors.surface, 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 540,
            position: 'relative'
          }}>
            
            {/* Header Action inside card */}
            <Box sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {step > 1 && step < 9 && (
                <Button onClick={handleBack} sx={{ minWidth: 'auto', p: 0.5, color: colors.greyMuted }}>
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </Button>
              )}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.greyDark, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {step === 9 ? 'Success' : `Step ${step} of 8`}
              </Typography>
            </Box>

            {/* Content area inside card */}
            <Box sx={{ px: 3, pb: 12, flex: 1, overflowY: 'auto' }}>
              {renderStep(step)}
            </Box>

            {/* Footer inside card */}
            {step < 9 && (
              <Box sx={{ 
                p: 3, 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                bgcolor: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(4px)',
                borderTop: `1px solid ${colors.greyBorder}`
              }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  disabled={submitting || processingPayment || isHoldExpired}
                  onClick={handleNext}
                  sx={{ 
                    bgcolor: colors.primary, 
                    boxShadow: 'none', 
                    borderRadius: 2.5, 
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#5A52FF', boxShadow: 'none' }
                  }}
                >
                  {submitting || processingPayment ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : step === 7 ? (
                    'Proceed to Payment'
                  ) : step === 8 ? (
                    'Pay Now'
                  ) : (
                    'Continue'
                  )}
                </Button>
                {step === 8 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 1.25 }}>
                    <LockIcon sx={{ fontSize: 13, color: colors.greyMuted }} />
                    <Typography sx={{ fontSize: '0.72rem', color: colors.greyMuted, fontWeight: 600 }}>
                      Secure Payment
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* --- Close or Cancel Button at bottom --- */}
      {onClose && step < 9 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleCancelBooking}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Cancel & Exit
          </Button>
        </Box>
      )}

    </Box>
  );
};

const CardPaper = Box; // simple alias for legacy markup mapping

export default Booking;
