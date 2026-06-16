import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PublicIcon from '@mui/icons-material/Public';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import AppDatePicker from '../AppDatePicker';
import { EP } from './theme';
import { Field, StepHeading, StepLayout, SidebarCard, TipsCard, ToggleRow, SummaryLine, Grid } from './parts';
import { TIME_OPTIONS, TIMEZONE_OPTIONS, fmtTime12, fmtDate } from './options';
import { StepProps } from './stepProps';
import { DateTimeInfo } from './types';

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

export const Step2DateTime: React.FC<StepProps> = ({ draft, onChange }) => {
  const d = draft.datetime;
  const set = (p: Partial<DateTimeInfo>) => onChange('datetime', { ...d, ...p });
  const eventTypeLabel = draft.basic.eventFormat ? draft.basic.eventFormat[0].toUpperCase() + draft.basic.eventFormat.slice(1) : '';

  return (
    <StepLayout
      main={
        <>
          <StepHeading title="Date & Time" subtitle="Select when your event starts, ends and how it repeats." />

          <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: '#F7F8FB', borderRadius: `${EP.radiusSm}px`, mb: 3 }}>
            <ModeTab active={d.mode === 'single'} icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />} label="Single Day / Multi-Day Event" onClick={() => set({ mode: 'single' })} />
            <ModeTab active={d.mode === 'recurring'} icon={<AutorenewIcon sx={{ fontSize: 18 }} />} label="Recurring Event" onClick={() => set({ mode: 'recurring' })} />
          </Box>

          <Grid cols={2}>
            <Field label="Event Start Date" required>
              <AppDatePicker value={d.startDate} onChange={(e) => set({ startDate: e.target.value })} />
            </Field>
            <Field label="Event End Date" required>
              <AppDatePicker value={d.endDate} onChange={(e) => set({ endDate: e.target.value })} />
            </Field>
          </Grid>

          <Grid cols={2} sx={{ mt: 2.5 }}>
            <Field label="Event Start Time" required>
              <AppDropdown label="Start time" options={TIME_OPTIONS} value={d.startTime} onChange={(e) => set({ startTime: e.target.value as string })} />
            </Field>
            <Field label="Event End Time" required>
              <AppDropdown label="End time" options={TIME_OPTIONS} value={d.endTime} onChange={(e) => set({ endTime: e.target.value as string })} />
            </Field>
          </Grid>

          <Grid cols={2} sx={{ mt: 2.5 }}>
            <Field label="Timezone" required helper="All event times will be displayed in this timezone.">
              <AppDropdown label="Timezone" options={TIMEZONE_OPTIONS} value={d.timezone} onChange={(e) => set({ timezone: e.target.value as string })} />
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
                  options={[{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }]}
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
                <AppDatePicker value={d.visibilityStartDate} onChange={(e) => set({ visibilityStartDate: e.target.value })} />
                <AppDropdown label="Time" options={TIME_OPTIONS} value={d.visibilityStartTime} onChange={(e) => set({ visibilityStartTime: e.target.value as string })} />
              </Box>
            </Field>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem', mb: 2 }}>Setup & Teardown Time (Optional)</Typography>
          <Grid cols={2}>
            <Field label="Setup Start Time" helper="Time when setup / registration begins">
              <AppDropdown label="Setup start" options={TIME_OPTIONS} value={d.setupStartTime} onChange={(e) => set({ setupStartTime: e.target.value as string })} />
            </Field>
            <Field label="Teardown End Time" helper="Time when teardown / cleanup ends">
              <AppDropdown label="Teardown end" options={TIME_OPTIONS} value={d.teardownEndTime} onChange={(e) => set({ teardownEndTime: e.target.value as string })} />
            </Field>
          </Grid>
        </>
      }
      rail={
        <>
          <SidebarCard title="Event Summary">
            <SummaryLine icon={<EventOutlinedIcon sx={{ fontSize: 18 }} />} label="Event Title" value={draft.basic.eventName} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />} label="Event Dates" value={d.startDate ? `${fmtDate(d.startDate)}${d.endDate ? ' - ' + fmtDate(d.endDate) : ''}` : ''} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<AccessTimeIcon sx={{ fontSize: 18 }} />} label="Time" value={`${fmtTime12(d.startTime)} - ${fmtTime12(d.endTime)}`} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<HourglassEmptyIcon sx={{ fontSize: 18 }} />} label="Duration" value={[d.durationDays && `${d.durationDays} Days`, d.durationHours && `${d.durationHours} Hours`].filter(Boolean).join(' ') || '—'} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<PublicIcon sx={{ fontSize: 18 }} />} label="Timezone" value={TIMEZONE_OPTIONS.find((t) => t.value === d.timezone)?.label} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<CategoryOutlinedIcon sx={{ fontSize: 18 }} />} label="Event Type" value={eventTypeLabel} />
            <Divider sx={{ my: 0.5 }} />
            <SummaryLine icon={<PlaceOutlinedIcon sx={{ fontSize: 18 }} />} label="Venue" value={draft.venue.venueName} />
          </SidebarCard>

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
