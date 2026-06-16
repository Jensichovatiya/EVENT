// Shared option lists for the wizard.

export const TIME_OPTIONS = (() => {
  const out: { label: string; value: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const value = `${hh}:${mm}`;
      const ampm = h < 12 ? 'AM' : 'PM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      out.push({ label: `${String(h12).padStart(2, '0')}:${mm} ${ampm}`, value });
    }
  }
  return out;
})();

export const TIMEZONE_OPTIONS = [
  { label: '(GMT+05:30) Asia/Kolkata – India Standard Time', value: 'Asia/Kolkata' },
  { label: '(GMT+00:00) UTC', value: 'UTC' },
  { label: '(GMT+04:00) Asia/Dubai', value: 'Asia/Dubai' },
  { label: '(GMT+08:00) Asia/Singapore', value: 'Asia/Singapore' },
  { label: '(GMT-05:00) America/New_York', value: 'America/New_York' },
  { label: '(GMT-08:00) America/Los_Angeles', value: 'America/Los_Angeles' },
  { label: '(GMT+01:00) Europe/London', value: 'Europe/London' },
];

export const VENUE_CATEGORY_OPTIONS = [
  { label: 'Convention Center', value: 'convention' },
  { label: 'Hotel / Banquet', value: 'hotel' },
  { label: 'Auditorium', value: 'auditorium' },
  { label: 'Stadium / Ground', value: 'stadium' },
  { label: 'Exhibition Hall', value: 'exhibition' },
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Other', value: 'other' },
];

export const COUNTRY_OPTIONS = [
  { label: 'India', value: 'India' },
  { label: 'United States', value: 'United States' },
  { label: 'United Arab Emirates', value: 'United Arab Emirates' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Singapore', value: 'Singapore' },
];

export const PHONE_CODES = [
  { label: '+91', value: '+91' },
  { label: '+1', value: '+1' },
  { label: '+44', value: '+44' },
  { label: '+971', value: '+971' },
  { label: '+65', value: '+65' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
].map((s) => ({ label: s, value: s }));

export const EMPLOYEE_COUNT_OPTIONS = [
  { label: '1 - 10', value: '1-10' }, { label: '11 - 50', value: '11-50' },
  { label: '51 - 200', value: '51-200' }, { label: '201 - 500', value: '201-500' },
  { label: '500+', value: '500+' },
];

export const INDUSTRY_OPTIONS = [
  { label: 'Events & Entertainment', value: 'events' }, { label: 'Technology', value: 'tech' },
  { label: 'Education', value: 'education' }, { label: 'Healthcare', value: 'healthcare' },
  { label: 'Hospitality', value: 'hospitality' }, { label: 'Other', value: 'other' },
];

export const BUSINESS_TYPE_OPTIONS = [
  { label: 'Private Limited', value: 'pvt' }, { label: 'Public Limited', value: 'public' },
  { label: 'Partnership', value: 'partnership' }, { label: 'Proprietorship', value: 'proprietorship' },
  { label: 'LLP', value: 'llp' }, { label: 'NGO / Trust', value: 'ngo' },
];

export const ORGANIZER_TYPE_OPTIONS = [
  { label: 'Company / Organization', value: 'company' }, { label: 'Individual', value: 'individual' },
  { label: 'Government Body', value: 'government' }, { label: 'Non-Profit', value: 'nonprofit' },
];

export const fmtTime12 = (v: string) => {
  const found = TIME_OPTIONS.find((t) => t.value === v);
  return found ? found.label : v;
};

export const fmtDate = (v: string) => {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
