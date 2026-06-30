import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { EP } from './theme';
import { SidebarCard } from './parts';
import { fmtDate, fmtTime12 } from './options';
import { StepProps } from './stepProps';
import { RadioGroup, RadioGroupItem } from '@/Ui/radio-group';

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.6 }}>
    <Typography sx={{ fontSize: '0.8rem', color: EP.muted, flexShrink: 0 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.82rem', color: EP.text, fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{value || '—'}</Typography>
  </Box>
);

const ReviewCard: React.FC<{ icon: React.ReactNode; tint: string; title: string; onEdit: () => void; children: React.ReactNode }> = ({ icon, tint, title, onEdit, children }) => (
  <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radius}px`, p: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: tint + '22', color: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</Typography>
      </Box>
      <Box onClick={onEdit} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: EP.primary, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
        <EditOutlinedIcon sx={{ fontSize: 15 }} /> Edit
      </Box>
    </Box>
    {children}
  </Box>
);

export const Step8Review: React.FC<StepProps> = ({ draft, onChange, goToStep }) => {
  const go = (i: number) => goToStep && goToStep(i);
  const b = draft.basic, d = draft.datetime, v = draft.venue, t = draft.tickets;
  const allPrices = [...t.ticketTypes.map((x) => x.price), ...t.passes.map((x) => x.price)].filter((n) => n > 0);
  const lowest = allPrices.length ? Math.min(...allPrices) : 0;
  const highest = allPrices.length ? Math.max(...allPrices) : 0;
  const org = draft.organizer;

  const checklist = [
    { ok: !!b.eventName && !!b.categoryId, label: 'All required information is provided' },
    { ok: !!d.startDate && !!d.endDate, label: 'Event date and time are valid' },
    { ok: !!v.venueName, label: 'Venue and floor plan are set' },
    { ok: t.ticketTypes.length + t.passes.length > 0, label: 'Tickets and pricing are configured' },
    { ok: Object.values(t.payment.methods).some(Boolean), label: 'Payment settings are complete' },
  ];
  const allGood = checklist.every((c) => c.ok);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 320px' }, gap: 3, alignItems: 'start' }}>
      <Box sx={{ ...{ borderRadius: `${EP.radius}px`, border: `1px solid ${EP.line}`, background: EP.surface, boxShadow: EP.shadowCard }, p: { xs: 2.5, md: 3.5 } }}>
        <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '1.05rem' }}>Review & Publish</Typography>
        <Typography sx={{ color: EP.muted, fontSize: '0.85rem', mt: 0.5, mb: 3 }}>Review all the details of your event before publishing.</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <ReviewCard icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />} tint={EP.indigo} title="Basic Information" onEdit={() => go(0)}>
            <Row label="Event Title" value={b.eventName} />
            <Row label="Event Format" value={b.eventFormat} />
            <Row label="Event Purpose" value={b.purpose} />
            <Row label="Status" value={b.eventStatus} />
          </ReviewCard>

          <ReviewCard icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />} tint={EP.blue} title="Date & Time" onEdit={() => go(1)}>
            <Row label="Start" value={d.startDate ? `${fmtDate(d.startDate)}, ${fmtTime12(d.startTime)}` : ''} />
            <Row label="End" value={d.endDate ? `${fmtDate(d.endDate)}, ${fmtTime12(d.endTime)}` : ''} />
            <Row label="Time Zone" value={d.timezone} />
          </ReviewCard>

          <ReviewCard icon={<PlaceOutlinedIcon sx={{ fontSize: 18 }} />} tint={EP.red} title="Venue & Location" onEdit={() => go(2)}>
            <Row label="Venue" value={v.venueName} />
            <Row label="Address" value={[v.addressLine1, v.city, v.state, v.zip].filter(Boolean).join(', ')} />
          </ReviewCard>

          <ReviewCard icon={<GridOnOutlinedIcon sx={{ fontSize: 18 }} />} tint={EP.green} title="Event Details" onEdit={() => go(3)}>
            <Row label="Expected Attendance" value={b.expectedAttendance ? `${b.expectedAttendance} People` : ''} />
            <Row label="Target Audience" value={b.targetAudience} />
            <Row label="Floor Components" value={draft.details.components.length} />
          </ReviewCard>

          <ReviewCard icon={<GroupsOutlinedIcon sx={{ fontSize: 18 }} />} tint={EP.amber} title="Organisers" onEdit={() => go(4)}>
            <Row label="Organizer" value={org.companyName} />
            <Row label="Contact" value={org.ownerName} />
            <Row label="Email" value={org.ownerEmail || org.primaryEmail} />
          </ReviewCard>

          <ReviewCard icon={<ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />} tint={EP.primary} title="Tickets & Pricing" onEdit={() => go(5)}>
            <Row label="Ticket Types" value={`${t.ticketTypes.length} types, ${t.passes.length} passes`} />
            <Row label="Currency" value={t.payment.currency} />
            <Row label="Lowest Price" value={`₹${lowest.toLocaleString('en-IN')}`} />
            <Row label="Highest Price" value={`₹${highest.toLocaleString('en-IN')}`} />
          </ReviewCard>

          <ReviewCard icon={<ImageOutlinedIcon sx={{ fontSize: 18 }} />} tint={EP.pink} title="Media & Branding" onEdit={() => go(6)}>
            <Row label="Event Logo" value={draft.media.logoFile[0]?.name} />
            <Row label="Cover Image" value={draft.media.coverFile[0]?.name} />
            <Row label="Brand Color" value={draft.media.primaryColor} />
          </ReviewCard>

          <ReviewCard icon={<PaymentsOutlinedIcon sx={{ fontSize: 18 }} />} tint={EP.amber} title="Payment Settings" onEdit={() => go(5)}>
            <Row label="Currency" value={t.payment.currency} />
            <Row label="Payment Methods" value={Object.entries(t.payment.methods).filter(([, on]) => on).map(([k]) => k).join(', ')} />
            <Row label="Payment Mode" value={t.payment.paymentMode.replace('_', ' & ')} />
          </ReviewCard>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: { lg: 'sticky' }, top: 16 }}>
        <SidebarCard title="Event Summary">
          <SummaryItem icon={<ConfirmationNumberOutlinedIcon sx={{ fontSize: 16 }} />} text={b.eventName} />
          <SummaryItem icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />} text={d.startDate ? `${fmtDate(d.startDate)} - ${fmtDate(d.endDate)}` : ''} />
          <SummaryItem icon={<AccessTimeIcon sx={{ fontSize: 16 }} />} text={`${fmtTime12(d.startTime)} - ${fmtTime12(d.endTime)}`} />
          <SummaryItem icon={<PlaceOutlinedIcon sx={{ fontSize: 16 }} />} text={[v.venueName, v.city].filter(Boolean).join(', ')} />
          <SummaryItem icon={<PeopleAltOutlinedIcon sx={{ fontSize: 16 }} />} text={b.expectedAttendance ? `${b.expectedAttendance} Expected Attendees` : ''} />
        </SidebarCard>

        <SidebarCard title="Review Checklist">
          {checklist.map((c, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.6 }}>
              <CheckCircleIcon sx={{ fontSize: 18, color: c.ok ? EP.green : EP.line }} />
              <Typography sx={{ fontSize: '0.8rem', color: c.ok ? EP.text : EP.faint }}>{c.label}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 18, color: allGood ? EP.green : EP.amber }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: allGood ? EP.green : EP.amber }}>
              {allGood ? 'All good to publish your event!' : 'Complete required items to publish'}
            </Typography>
          </Box>
        </SidebarCard>

        <SidebarCard title="Publish Options">
          <RadioGroup
            value={draft.publish.publishOption}
            onValueChange={(val) => onChange('publish', { ...draft.publish, publishOption: val as any })}
            className="space-y-3"
          >
            {[
              ['now', 'Publish Now', 'Your event will be live and visible to attendees.'],
              ['schedule', 'Schedule Publish', 'Choose a future date and time to publish.'],
              ['draft', 'Save as Draft', 'Save and continue editing later.'],
            ].map(([val, title, sub]) => {
              const itemId = `publish-${val}`;
              return (
                <div key={val} className="flex items-start gap-2.5">
                  <RadioGroupItem value={val} id={itemId} className="mt-1 flex-shrink-0" />
                  <label htmlFor={itemId} className="cursor-pointer select-none">
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: EP.text }}>{title}</Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: EP.muted }}>{sub}</Typography>
                  </label>
                </div>
              );
            })}
          </RadioGroup>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, p: 1.5, bgcolor: '#F5F8FF', borderRadius: 1.5 }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: EP.blue }} />
            <Typography sx={{ fontSize: '0.74rem', color: EP.muted }}>Once published, attendees will be able to view and book tickets for your event.</Typography>
          </Box>
        </SidebarCard>
      </Box>
    </Box>
  );
};

const SummaryItem: React.FC<{ icon: React.ReactNode; text?: string }> = ({ icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.7 }}>
    <Box sx={{ color: EP.faint, display: 'flex' }}>{icon}</Box>
    <Typography sx={{ fontSize: '0.82rem', color: EP.text }}>{text || '—'}</Typography>
  </Box>
);

export default Step8Review;
