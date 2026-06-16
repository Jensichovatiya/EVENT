// ---------------------------------------------------------------------------
// EventPro "Create New Event" wizard — shared design tokens.
// Mirrors the EventPro reference screens while staying consistent with the
// existing App* component library (MUI based).
// ---------------------------------------------------------------------------

export const EP = {
  // Brand
  primary: '#6C3EF2',
  primaryDark: '#5B2FD6',
  primarySoft: '#EEEAFE',
  primaryGradient: 'linear-gradient(90deg, #6C3EF2 0%, #8B5CF6 60%, #EC4899 100%)',

  // Accents used across step summaries
  blue: '#3B82F6',
  green: '#10B981',
  amber: '#F59E0B',
  pink: '#EC4899',
  red: '#EF4444',
  indigo: '#6366F1',

  // Neutrals
  ink: '#111827',
  text: '#1F2937',
  muted: '#6B7280',
  faint: '#9CA3AF',
  line: '#E5E7EB',
  lineSoft: '#F1F2F6',
  surface: '#FFFFFF',
  canvas: '#F7F8FB',
  fieldBg: '#FFFFFF',

  // Radii / shadow
  radius: 12,
  radiusSm: 8,
  shadowCard: '0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)',
  shadowPop: '0 10px 40px rgba(16,24,40,0.12)',
} as const;

// The 8 wizard steps, in order, as shown in the reference.
export const WIZARD_STEPS = [
  { key: 'basic', label: 'Basic Information' },
  { key: 'datetime', label: 'Date & Time' },
  { key: 'venue', label: 'Venue & Location' },
  { key: 'details', label: 'Event Details' },
  { key: 'organizers', label: 'Organizers' },
  { key: 'tickets', label: 'Tickets & Pricing' },
  { key: 'media', label: 'Media & Branding' },
  { key: 'review', label: 'Review & Publish' },
] as const;

export type WizardStepKey = (typeof WIZARD_STEPS)[number]['key'];

// Small reusable sx snippets
export const cardSx = {
  borderRadius: `${EP.radius}px`,
  border: `1px solid ${EP.line}`,
  background: EP.surface,
  boxShadow: EP.shadowCard,
} as const;

export const sectionTitleSx = {
  color: EP.primary,
  fontWeight: 700,
  fontSize: '1.05rem',
} as const;

export const fieldLabelSx = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: EP.text,
  mb: 0.75,
  display: 'block',
} as const;

export const helperSx = {
  fontSize: '0.72rem',
  color: EP.faint,
  mt: 0.5,
  display: 'block',
} as const;
