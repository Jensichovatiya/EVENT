import React from 'react';
import { toast } from 'sonner';
import { Box, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PublicIcon from '@mui/icons-material/Public';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import AppDatePicker from '../AppDatePicker';
import { EP } from './theme';
import { Field, StepHeading, StepLayout, SidebarCard, TipsCard, ToggleRow, SummaryLine, Grid, StepsOverviewCard } from './parts';
import { TIME_OPTIONS, TIMEZONE_OPTIONS, fmtTime12, fmtDate } from './options';
import { StepProps } from './stepProps';
import { DateTimeInfo, DateTimeSlot } from './types';
import { Button } from '@/Ui/button';
import { parseToTime } from './mappers';

const ModeTab: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
      py: 1.5, borderRadius: `${EP.radiusSm}px`, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
      bgcolor: active ? EP.primarySoft : 'transparent',
      color: active ? EP.primary : EP.muted,
      border: active ? `1px solid ${EP.primary}33` : '1px solid transparent',
    }}
  >
    {icon}{label}
  </Box>
);

export const Step2DateTime: React.FC<StepProps> = ({ draft, onChange, ddl, meta, goToStep }) => {
  const d = draft.datetime;
  const set = (p: Partial<DateTimeInfo>) => onChange('datetime', { ...d, ...p });
  const eventTypeLabel = draft.basic.eventFormat ? draft.basic.eventFormat[0].toUpperCase() + draft.basic.eventFormat.slice(1) : '';

  const [newSlot, setNewSlot] = React.useState<Omit<DateTimeSlot, 'slotId'>>({
    slotDate: '',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    capacity: '',
    slotName: '',
    ticketPrice: '',
  });

  const updateDraftSlots = (newSlots: DateTimeSlot[]) => {
    let newStart = d.startDate;
    let newEnd = d.endDate;
    let newStartTime = d.startTime;
    let newEndTime = d.endTime;

    if (newSlots.length > 0) {
      // Sort slots chronologically to calculate overall start & end
      const sorted = [...newSlots].sort((a, b) => {
        const timeA = parseToTime(a.startTime) || '00:00';
        const timeB = parseToTime(b.startTime) || '00:00';
        const dateA = new Date(`${a.slotDate}T${timeA.length === 5 ? timeA + ':00' : timeA}`).getTime();
        const dateB = new Date(`${b.slotDate}T${timeB.length === 5 ? timeB + ':00' : timeB}`).getTime();
        return dateA - dateB;
      });

      newStart = sorted[0].slotDate;
      newStartTime = sorted[0].startTime;
      
      newEnd = sorted[sorted.length - 1].slotDate;
      newEndTime = sorted[sorted.length - 1].endTime;
    }
    
    set({ 
      slots: newSlots, 
      startDate: newStart, 
      endDate: newEnd,
      startTime: newStartTime,
      endTime: newEndTime
    });
  };

  const isAddSlotEnabled = !!(
    newSlot.slotDate &&
    newSlot.startTime &&
    newSlot.endTime
  );

  const handleAddSlot = () => {
    if (!isAddSlotEnabled) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDateObj = new Date(newSlot.slotDate);
    if (slotDateObj < today) {
      toast.error('Cannot create a slot for a past date.');
      return;
    }
    
    const newSlotItem: DateTimeSlot = {
      slotId: 0,
      slotDate: newSlot.slotDate,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      capacity: newSlot.capacity,
      slotName: newSlot.slotName || `Slot ${(d.slots || []).length + 1}`,
      ticketPrice: newSlot.ticketPrice,
    };
    
    const updatedSlots = [...(d.slots || []), newSlotItem];
    updateDraftSlots(updatedSlots);
    
    // Reset form inputs (retaining default times)
    setNewSlot({
      slotDate: '',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      capacity: '',
      slotName: '',
      ticketPrice: '',
    });
  };

  const handleRemoveSlot = (index: number) => {
    const updatedSlots = (d.slots || []).filter((_, idx) => idx !== index);
    updateDraftSlots(updatedSlots);
  };

  return (
    <StepLayout
      main={
        <>
          <StepHeading title="Date & Time" subtitle="Select when your event starts, ends and how it repeats." />

          <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: '#F7F8FB', borderRadius: `${EP.radiusSm}px`, mb: 3 }}>
            <ModeTab active={d.mode === 'single'} icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />} label="Single Day / Multi-Day Event" onClick={() => set({ mode: 'single' })} />
            <ModeTab active={d.mode === 'recurring'} icon={<AutorenewIcon sx={{ fontSize: 18 }} />} label="Recurring Event" onClick={() => set({ mode: 'recurring' })} />
          </Box>

          {d.mode === 'single' ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: EP.text, mb: 2 }}>
                  Added Slots ({(d.slots || []).length})
                </Typography>
                
                {!d.slots || d.slots.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F9FAFC', border: `1px dashed ${EP.line}`, borderRadius: `${EP.radius}px` }}>
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 36, color: EP.muted, mb: 1 }} />
                    <Typography sx={{ color: EP.muted, fontSize: '0.85rem' }}>
                      No slots added yet. Please use the builder below to configure and add event slots.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: `${EP.radius}px`, border: `1px solid ${EP.line}`, overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F7F8FB' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: EP.muted, fontSize: '0.78rem', py: 1.5 }}>Slot Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: EP.muted, fontSize: '0.78rem', py: 1.5 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: EP.muted, fontSize: '0.78rem', py: 1.5 }}>Time</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: EP.muted, fontSize: '0.78rem', py: 1.5 }}>Capacity</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: EP.muted, fontSize: '0.78rem', py: 1.5 }}>Ticket Price</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, color: EP.muted, fontSize: '0.78rem', py: 1.5, width: 80 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody> 
                        {d.slots.map((slot, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: '#FAFBFC' } }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', color: EP.text }}>
                              {slot.slotName}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.85rem', color: EP.text }}>
                              {fmtDate(slot.slotDate)}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.85rem', color: EP.text }}>
                              {`${fmtTime12(slot.startTime)} - ${fmtTime12(slot.endTime)}`}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.85rem', color: EP.text }}>
                              {slot.capacity !== '' ? slot.capacity : 'Unlimited'}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.85rem', color: EP.text, fontWeight: 600 }}>
                              {slot.ticketPrice !== '' && Number(slot.ticketPrice) > 0 ? `${draft.tickets.payment.currency || 'INR'} ${slot.ticketPrice}` : 'Free'}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton 
                                onClick={() => handleRemoveSlot(index)} 
                                size="small" 
                                sx={{ 
                                  color: '#E11D48', 
                                  '&:hover': { bgcolor: '#FFE4E6' },
                                  transition: 'all 0.2s'
                                }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

              <Box sx={{ p: 3, bgcolor: '#FFFFFF', border: `1px solid ${EP.line}`, borderRadius: `${EP.radius}px`, mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: EP.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddIcon sx={{ color: EP.primary, fontSize: 20 }} /> Add Event Slot
                </Typography>
                
                <Grid cols={3}>
                  <Field label="Slot Date" required>
                    <AppDatePicker 
                      value={newSlot.slotDate} 
                      onChange={(e) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (e.target.value) {
                          const slotDateObj = new Date(e.target.value);
                          if (slotDateObj < today) {
                            toast.error('Cannot create a slot for a past date.');
                            return;
                          }
                        }
                        setNewSlot(prev => ({ ...prev, slotDate: e.target.value }));
                      }} 
                    />
                  </Field>
                  <Field label="Event Start Time" required>
                    <AppInput 
                      placeholder="e.g. 09:00 AM" 
                      value={newSlot.startTime} 
                      onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))} 
                    />
                  </Field>
                  <Field label="Event End Time" required>
                    <AppInput 
                      placeholder="e.g. 06:00 PM" 
                      value={newSlot.endTime} 
                      onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))} 
                    />
                  </Field>
                </Grid>

                <Grid cols={3} sx={{ mt: 2 }}>
                  <Field label="Slot Name (Optional)">
                    <AppInput 
                      placeholder="e.g. Day 1 Session" 
                      value={newSlot.slotName} 
                      onChange={(e) => setNewSlot(prev => ({ ...prev, slotName: e.target.value }))} 
                    />
                  </Field>
                  <Field label="Capacity (Optional)">
                    <AppInput 
                      type="number" 
                      placeholder="e.g. 100" 
                      value={newSlot.capacity} 
                      onChange={(e) => setNewSlot(prev => ({ ...prev, capacity: e.target.value === '' ? '' : Number(e.target.value) }))} 
                    />
                  </Field>
                  <Field label="Ticket Price (Optional)">
                    <AppInput 
                      type="number" 
                      placeholder="e.g. 500" 
                      value={newSlot.ticketPrice} 
                      onChange={(e) => setNewSlot(prev => ({ ...prev, ticketPrice: e.target.value === '' ? '' : Number(e.target.value) }))} 
                    />
                  </Field>
                </Grid>
              </Box>
            </>
          ) : (
            <>
              <Grid cols={2}>
                <Field label="Event Start Date" required>
                  <AppDatePicker 
                    value={d.startDate} 
                    onChange={(e) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (e.target.value) {
                        const valDate = new Date(e.target.value);
                        if (valDate < today) {
                          toast.error('Event Start Date cannot be in the past.');
                          return;
                        }
                      }
                      set({ startDate: e.target.value });
                    }} 
                  />
                </Field>
                <Field label="Event End Date" required>
                  <AppDatePicker value={d.endDate} onChange={(e) => set({ endDate: e.target.value })} />
                </Field>
              </Grid>

              <Grid cols={2} sx={{ mt: 2.5 }}>
                <Field label="Event Start Time" required>
                  <AppInput 
                    placeholder="e.g. 09:00 AM" 
                    value={d.startTime} 
                    onChange={(e) => set({ startTime: e.target.value })} 
                  />
                </Field>
                <Field label="Event End Time" required>
                  <AppInput 
                    placeholder="e.g. 06:00 PM" 
                    value={d.endTime} 
                    onChange={(e) => set({ endTime: e.target.value })} 
                  />
                </Field>
              </Grid>
            </>
          )}

          <Grid cols={2} sx={{ mt: 2.5 }}>
            <Field label="Timezone" required helper="All event times will be displayed in this timezone.">
              <AppDropdown label="Timezone" options={ddl.timezones.length > 0 ? ddl.timezones : TIMEZONE_OPTIONS} value={d.timezone} onChange={(e) => set({ timezone: e.target.value as string })} />
            </Field>
            <Field label="Event Duration">
              <Box sx={{ display: 'flex', gap: 1 }}>
                {([['durationDays', 'Days'], ['durationHours', 'Hours'], ['durationMinutes', 'Minutes']] as const).map(([key, lbl]) => (
                  <AppInput
                    key={key}
                    type="number"
                    placeholder={lbl}
                    value={d[key]}
                    onChange={(e) => set({ [key]: e.target.value === '' ? '' : Number(e.target.value) } as Partial<DateTimeInfo>)}
                  />
                ))}
              </Box>
            </Field>
          </Grid>

          {d.mode === 'recurring' && (
            <Grid cols={3} sx={{ mt: 2.5 }}>
              <Field label="Repeats" required>
                <AppDropdown
                  label="Frequency"
                  options={
                    ddl.repeatsConfig && ddl.repeatsConfig.length > 0
                      ? ddl.repeatsConfig
                      : [
                          { label: 'Daily', value: 'daily' },
                          { label: 'Weekly', value: 'weekly' },
                          { label: 'Monthly', value: 'monthly' }
                        ]
                  }
                  value={d.recurrenceFrequency}
                  onChange={(e) => set({ recurrenceFrequency: e.target.value as DateTimeInfo['recurrenceFrequency'] })}
                />
              </Field>
              <Field label="Every (interval)">
                <AppInput type="number" placeholder="1" value={d.recurrenceInterval} onChange={(e) => set({ recurrenceInterval: e.target.value === '' ? '' : Number(e.target.value) })} />
              </Field>
              <Field label="Repeat Until">
                <AppDatePicker value={d.recurrenceEndDate} onChange={(e) => set({ recurrenceEndDate: e.target.value })} />
              </Field>
            </Grid>
          )}

          <Box sx={{ mt: 2.5 }}>
            <ToggleRow checked={d.allDay} onChange={(v) => set({ allDay: v })} title="All Day Event" subtitle="Enable if your event lasts the whole day" />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem', mb: 2 }}>Countdown & Visibility</Typography>
          <Grid cols={2}>
            <ToggleRow checked={d.showCountdown} onChange={(v) => set({ showCountdown: v })} title="Show Countdown on Event Page" subtitle="Display countdown to the event start" />
            <Field label="Event Visibility Start (Optional)" helper="Event will be visible from this date & time">
              <Box sx={{ display: 'flex', gap: 1 }}>
                <AppDatePicker 
                  value={d.visibilityStartDate} 
                  onChange={(e) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (e.target.value) {
                      const valDate = new Date(e.target.value);
                      if (valDate < today) {
                        toast.error('Visibility Start Date cannot be in the past.');
                        return;
                      }
                    }
                    set({ visibilityStartDate: e.target.value });
                  }} 
                />
                <AppInput placeholder="e.g. 09:00 AM" value={d.visibilityStartTime} onChange={(e) => set({ visibilityStartTime: e.target.value })} />
              </Box>
            </Field>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem', mb: 2 }}>Setup & Teardown Time (Optional)</Typography>
          <Grid cols={2}>
            <Field label="Setup Start Time" helper="Time when setup / registration begins">
              <AppInput placeholder="e.g. 05:00 AM" value={d.setupStartTime} onChange={(e) => set({ setupStartTime: e.target.value })} />
            </Field>
            <Field label="Teardown End Time" helper="Time when teardown / cleanup ends">
              <AppInput placeholder="e.g. 06:00 AM" value={d.teardownEndTime} onChange={(e) => set({ teardownEndTime: e.target.value })} />
            </Field>
          </Grid>

          {d.mode === 'single' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3.5 }}>
              <Button 
                onClick={handleAddSlot}
                disabled={!isAddSlotEnabled}
                style={{
                  backgroundColor: isAddSlotEnabled ? EP.primary : EP.muted,
                  color: '#fff',
                  padding: '10px 28px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isAddSlotEnabled ? 'pointer' : 'not-allowed',
                  border: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <AddIcon sx={{ fontSize: 18 }} /> Add Slot
              </Button>
            </Box>
          )}
        </>
      }
      rail={
        <>
          <SidebarCard title="Event Summary">
            <SummaryLine icon={<EventOutlinedIcon sx={{ fontSize: 18 }} />} label="Event Title" value={draft.basic.eventName} />
            <Divider sx={{ my: 0.5 }} />
            {d.mode !== 'single' && (
              <>
                <SummaryLine icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />} label="Event Dates" value={d.startDate ? `${fmtDate(d.startDate)}${d.endDate ? ' - ' + fmtDate(d.endDate) : ''}` : ''} />
                <Divider sx={{ my: 0.5 }} />
                <SummaryLine icon={<AccessTimeIcon sx={{ fontSize: 18 }} />} label="Time" value={`${fmtTime12(d.startTime)} - ${fmtTime12(d.endTime)}`} />
                <Divider sx={{ my: 0.5 }} />
                <SummaryLine icon={<HourglassEmptyIcon sx={{ fontSize: 18 }} />} label="Duration" value={[d.durationDays && `${d.durationDays} Days`, d.durationHours && `${d.durationHours} Hours`].filter(Boolean).join(' ') || '—'} />
                <Divider sx={{ my: 0.5 }} />
              </>
            )}
            <SummaryLine icon={<PublicIcon sx={{ fontSize: 18 }} />} label="Timezone" value={(ddl.timezones.length > 0 ? ddl.timezones : TIMEZONE_OPTIONS).find((t) => t.value === d.timezone)?.label || d.timezone} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<CategoryOutlinedIcon sx={{ fontSize: 18 }} />} label="Event Type" value={eventTypeLabel} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<PlaceOutlinedIcon sx={{ fontSize: 18 }} />} label="Venue" value={draft.venue.venueName} />
          </SidebarCard>

          <StepsOverviewCard activeStep={meta.activeStep} completed={meta.completed} onStepClick={goToStep} />

          <TipsCard
            tips={[
              'Ensure your timezone is correct for accurate scheduling.',
              'Add setup and teardown time if required for smooth operations.',
              'You can choose to make the event visible before it starts.',
              'For events running multiple days, set daily schedule in the next step.',
            ]}
          />
        </>
      }
    />
  );
};

export default Step2DateTime;
