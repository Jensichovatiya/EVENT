import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import AppTextarea from '../AppTextarea';
import { EP } from './theme';
import { Field, StepHeading, StepLayout, SidebarCard, Grid, StepsOverviewCard } from './parts';
import { RichTextToolbar } from './RichTextToolbar';
import { StepProps } from './stepProps';
import { BasicInfo } from './types';

const FORMAT_OPTIONS = [
  { label: 'Physical', value: 'physical' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'Hybrid', value: 'hybrid' },
];
const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Scheduled', value: 'scheduled' },
];
const PURPOSE_OPTIONS = [
  { label: 'Conference', value: 'conference' },
  { label: 'Exhibition / Expo', value: 'exhibition' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Concert', value: 'concert' },
  { label: 'Networking', value: 'networking' },
  { label: 'Other', value: 'other' },
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export const Step1BasicInfo: React.FC<StepProps> = ({ draft, onChange, ddl, meta, goToStep, errors = {} }) => {
  const data = draft.basic;
  const set = (p: Partial<BasicInfo>) => onChange('basic', { ...data, ...p });

  return (
    <StepLayout
      main={
        <>
          <StepHeading title="Basic Information" subtitle="Provide the basic details about your event." />

          <Grid cols={3}>
            <Field label="Event Title" required>
              <AppInput
                placeholder="Enter event title"
                value={data.eventName}
                errorText={errors.eventName}
                onChange={(e) => set({ eventName: e.target.value, slug: slugify(e.target.value) })}
              />
            </Field>
            <Field label="Event Slug" required helper="URL friendly version">
              <AppInput
                placeholder="event-slug"
                value={data.slug}
                errorText={errors.slug}
                onChange={(e) => set({ slug: slugify(e.target.value) })}
              />
            </Field>
            <Field label="Event Tagline">
              <AppInput
                placeholder="A short catchy tagline for your event"
                value={data.tagline}
                onChange={(e) => set({ tagline: e.target.value })}
              />
            </Field>
          </Grid>

          <Grid cols={4} sx={{ mt: 2.5 }}>
            <Field label="Event Category" required>
              <AppDropdown
                label="Select category"
                options={ddl.categories}
                value={data.categoryId === '' ? '' : data.categoryId}
                errorText={errors.categoryId}
                onChange={(e) => set({ categoryId: Number(e.target.value), eventSubCategoryId: '' })}
              />
            </Field>
            <Field label="Event Type" required>
              <AppDropdown
                label="Select event type"
                options={ddl.eventTypes}
                value={data.eventType === '' ? '' : data.eventType}
                errorText={errors.eventType}
                onChange={(e) => set({ eventType: Number(e.target.value) })}
              />
            </Field>
            <Field label="Event Format" required helper="Physical / Virtual / Hybrid">
              <AppDropdown
                label="Select format"
                options={FORMAT_OPTIONS}
                value={data.eventFormat}
                errorText={errors.eventFormat}
                onChange={(e) => set({ eventFormat: e.target.value as BasicInfo['eventFormat'] })}
              />
            </Field>
            <Field label="Event Status" required>
              <AppDropdown
                label="Select status"
                options={STATUS_OPTIONS}
                value={data.eventStatus}
                onChange={(e) => set({ eventStatus: e.target.value as BasicInfo['eventStatus'] })}
              />
            </Field>
          </Grid>

          <Grid cols={2} sx={{ mt: 2.5 }}>
            <Field label="Short Description" required>
              <AppTextarea
                rows={3}
                placeholder="Brief summary of your event (Max 200 characters)"
                value={data.shortDescription}
                inputProps={{ maxLength: 200 }}
                errorText={errors.shortDescription}
                onChange={(e) => set({ shortDescription: e.target.value })}
                helperText={`${data.shortDescription.length}/200`}
              />
            </Field>
            <Field label="Keywords" helper="Helps in search and discovery">
              <AppInput
                placeholder="Enter keywords separated by commas"
                value={data.keywords}
                onChange={(e) => set({ keywords: e.target.value })}
              />
            </Field>
          </Grid>

          <Grid cols={3} sx={{ mt: 2.5 }}>
            <Field label="Event Purpose" required>
              <AppDropdown
                label="Select purpose"
                options={PURPOSE_OPTIONS}
                value={data.purpose}
                onChange={(e) => set({ purpose: e.target.value as string })}
              />
            </Field>
            <Field label="Target Audience" required>
              <AppInput
                placeholder="Describe your target audience"
                value={data.targetAudience}
                onChange={(e) => set({ targetAudience: e.target.value })}
              />
            </Field>
            <Field label="Expected Attendance">
              <AppInput
                type="number"
                placeholder="Enter expected count"
                value={data.expectedAttendance}
                onChange={(e) => set({ expectedAttendance: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </Field>
          </Grid>

          <Box sx={{ mt: 2.5 }}>
            <Field label="About Event" required>
              <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, overflow: 'hidden' }}>
                <RichTextToolbar />
                <AppTextarea
                  rows={5}
                  placeholder="Provide detailed information about your event, its purpose, agenda, and what attendees can expect..."
                  value={data.about}
                  onChange={(e) => set({ about: e.target.value })}
                  sx={{ '& fieldset': { border: 'none' } }}
                />
              </Box>
            </Field>
          </Box>
        </>
      }
      rail={
        <>
          <SidebarCard
            title="Event Summary"
            action={<EditOutlinedIcon sx={{ fontSize: 18, color: EP.primary, cursor: 'pointer' }} />}
          >
            {data.eventName ? (
              <Box>
                <Typography sx={{ fontWeight: 700, color: EP.ink, fontSize: '1rem' }}>{data.eventName}</Typography>
                {data.tagline && <Typography sx={{ color: EP.muted, fontSize: '0.82rem', mt: 0.5 }}>{data.tagline}</Typography>}
                {data.shortDescription && (
                  <Typography sx={{ color: EP.muted, fontSize: '0.8rem', mt: 1 }}>{data.shortDescription}</Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CalendarMonthOutlinedIcon sx={{ fontSize: 48, color: EP.primarySoft }} />
                <Typography sx={{ fontWeight: 700, color: EP.text, mt: 1 }}>No event created yet</Typography>
                <Typography sx={{ color: EP.faint, fontSize: '0.8rem', mt: 0.5 }}>
                  Complete all steps to see the summary
                </Typography>
              </Box>
            )}
          </SidebarCard>

          <StepsOverviewCard activeStep={meta.activeStep} completed={meta.completed} onStepClick={goToStep} />

          <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radius}px`, p: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start', bgcolor: '#F6FBF8' }}>
            <VerifiedUserOutlinedIcon sx={{ color: EP.green, fontSize: 22 }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: EP.text }}>Your data is safe</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: EP.muted }}>
                We use industry-standard encryption to protect your information.
              </Typography>
            </Box>
          </Box>
        </>
      }
    />
  );
};

export default Step1BasicInfo;
