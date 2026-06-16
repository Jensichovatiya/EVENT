// ---------------------------------------------------------------------------
// Shared draft model for the EventPro 8-step Create Event wizard.
// One object holds the whole draft; each step reads/writes its slice.
// Fields marked "(existing API)" map to the current EventRequest / SP columns.
// The rest are new modules carried to the API boundary for backend persistence.
// ---------------------------------------------------------------------------

export type Id = number | string;

// ---- Step 1: Basic Information ----
export interface BasicInfo {
  eventName: string;        // (existing API) EventName / title
  slug: string;             // (existing API) Slug
  tagline: string;          // MetaJson
  categoryId: number | '';  // (existing API) CategoryId
  eventSubCategoryId: number | ''; // (existing API)
  eventType: number | '';   // (existing API) EventType
  eventFormat: 'physical' | 'virtual' | 'hybrid' | ''; // ListingType derived
  eventStatus: 'draft' | 'published' | 'scheduled' | ''; // Status
  shortDescription: string; // (existing API) ShortDescription
  keywords: string;         // (existing API) SeoKeywords / Tags
  purpose: string;
  targetAudience: string;
  expectedAttendance: number | '';
  about: string;            // (existing API) About (rich text/html)
}

// ---- Step 2: Date & Time ----
export interface DateTimeInfo {
  mode: 'single' | 'recurring';
  startDate: string;        // (existing API) StartDate
  endDate: string;          // (existing API) EndDate
  startTime: string;
  endTime: string;
  timezone: string;
  durationDays: number | '';
  durationHours: number | '';
  durationMinutes: number | '';
  allDay: boolean;
  showCountdown: boolean;
  visibilityStartDate: string;
  visibilityStartTime: string;
  setupStartTime: string;
  teardownEndTime: string;
  // recurrence (when mode === 'recurring')
  recurrenceFrequency: 'daily' | 'weekly' | 'monthly' | '';
  recurrenceInterval: number | '';
  recurrenceEndDate: string;
}

// ---- Step 3: Venue & Location ----
export interface VenueFacilities {
  [key: string]: boolean; // wifi, parking, wheelchair, ac, audio, projector ...
}

export interface VenueInfo {
  venueType: 'physical' | 'virtual' | 'hybrid';
  venueName: string;        // (existing API) VenueName
  venueCategory: string;
  venueCapacity: number | '';
  addressLine1: string;     // (existing API)
  addressLine2: string;     // (existing API)
  city: string;             // (existing API) CityId
  state: string;            // (existing API) StateId
  country: string;          // (existing API) CountryId
  zip: string;              // (existing API) Pincode
  latitude: number | '';    // (existing API)
  longitude: number | '';   // (existing API)
  mapQuery: string;         // (existing API) GoogleMapLink
  contactPerson: string;
  contactDesignation: string;
  contactPhoneCode: string;
  contactPhone: string;
  contactEmail: string;
  facilities: VenueFacilities;
  otherFacility: string;
  notes: string;
}

// ---- Step 4: Event Details / Floor Plan ----
export interface FloorPlanComponent {
  id: string;
  type: string;             // booth | stage | lounge | wall ...
  label: string;
  shape: string;
  width: number;
  height: number;
  rotation: number;
  x: number;
  y: number;
  color: string;
}

export interface EventDetailsInfo {
  hallName: string;         // (existing API) HallName
  viewMode: '2d' | '3d';
  components: FloorPlanComponent[];
}

// ---- Step 5: Organizers & Contacts ----
export interface ContactPerson {
  id: string;
  name: string;
  designation: string;
  role: string;
  email: string;
  phone: string;
}

export interface OrganizerProfile {
  // Organiser Information
  organizerType: string;
  companyName: string;
  gstin: string;
  pan: string;
  website: string;
  primaryEmail: string;
  primaryPhoneCode: string;
  primaryPhone: string;
  altPhoneCode: string;
  altPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  // Primary Contact (Event Owner)
  ownerName: string;
  ownerDesignation: string;
  ownerEmail: string;
  ownerPhoneCode: string;
  ownerPhone: string;
  // Additional Contacts
  additionalContacts: ContactPerson[];
  // Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhoneCode: string;
  emergencyPhone: string;
  emergencyAltPhoneCode: string;
  emergencyAltPhone: string;
  // Organisation Details
  yearEstablished: string;
  employeeCount: string;
  industry: string;
  businessType: string;
  registrationNumber: string;
  registeredAddress: string;
  // Social Media Links
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
}

// ---- Step 6: Tickets & Pricing ----
export interface TicketType {
  id: string;
  name: string;
  category: 'single' | 'group' | 'pass';
  description: string;
  price: number;
  available: number;
  perOrderLimit: number | '';
  salesFrom: string;
  salesTo: string;
  active: boolean;
  badge: string;
  badgeColor: string;
  additionalInfo: string;
  minQty?: number;
  maxQty?: number;
}

export interface Pass {
  id: string;
  name: string;
  validFrom: string;
  validTo: string;
  includes: string[];
  price: number;
  totalLimit: number;
  active: boolean;
  badge: string;
  badgeColor: string;
  description: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
  required: boolean;
  active: boolean;
  attachTo: string[];
  badge: string;
  badgeColor: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  appliesTo: string;
  usageLimit: number | '';
  minPurchase: number | '';
  validFrom: string;
  validUntil: string;
  maxDiscount: number | '';
  description: string;
  active: boolean;
  badge: string;
}

export interface TaxRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  rate: number;
  appliesTo: string;
  includedInPrice: boolean;
  active: boolean;
}

export interface FeeRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  amount: number;
  appliesTo: string;
  chargeTo: 'buyer' | 'organizer';
  includedInPrice: boolean;
  minFee: number | '';
  maxFee: number | '';
  active: boolean;
}

export interface PaymentSettings {
  currency: string;
  priceDisplay: 'inclusive' | 'exclusive';
  rounding: string;
  methods: { [key: string]: boolean }; // cards, upi, netbanking, wallets, emi, cod
  paymentMode: string;
  orderExpiry: string;
  allowPartial: boolean;
  enableInvoice: boolean;
  savePaymentDetails: boolean;
  showTerms: boolean;
}

export interface TicketsInfo {
  ticketTypes: TicketType[];
  passes: Pass[];
  addOns: AddOn[];
  promoCodes: PromoCode[];
  taxes: TaxRule[];
  fees: FeeRule[];
  payment: PaymentSettings;
}

// ---- Step 7: Media & Branding ----
export interface MediaInfo {
  logoFile: File[];         // (existing API) ThumbnailFile / attachments
  coverFile: File[];        // (existing API) BannerFile / attachments
  faviconFile: File[];
  bannerFile: File[];
  primaryColor: string;
  secondaryColor: string;
  gradientFrom: string;
  gradientTo: string;
  galleryFiles: File[];     // (existing API) attachments
  documentFiles: File[];    // (existing API) attachments
  shareTitle: string;       // (existing API) SeoTitle
  shareDescription: string; // (existing API) SeoDescription
  shareImageFile: File[];
}

// ---- Step 8: Publish ----
export interface PublishInfo {
  publishOption: 'now' | 'schedule' | 'draft';
  scheduleDate: string;
  scheduleTime: string;
}

export interface EventDraft {
  eventId: number;
  eventRId: string;
  basic: BasicInfo;
  datetime: DateTimeInfo;
  venue: VenueInfo;
  details: EventDetailsInfo;
  organizer: OrganizerProfile;
  tickets: TicketsInfo;
  media: MediaInfo;
  publish: PublishInfo;
}

// ---------------------------------------------------------------------------
// Factory: empty draft with sensible defaults.
// ---------------------------------------------------------------------------
export const createEmptyDraft = (): EventDraft => ({
  eventId: 0,
  eventRId: '',
  basic: {
    eventName: '', slug: '', tagline: '', categoryId: '', eventSubCategoryId: '',
    eventType: '', eventFormat: '', eventStatus: 'draft', shortDescription: '',
    keywords: '', purpose: '', targetAudience: '', expectedAttendance: '', about: '',
  },
  datetime: {
    mode: 'single', startDate: '', endDate: '', startTime: '09:00', endTime: '18:00',
    timezone: 'Asia/Kolkata', durationDays: '', durationHours: '', durationMinutes: '',
    allDay: false, showCountdown: true, visibilityStartDate: '', visibilityStartTime: '09:00',
    setupStartTime: '', teardownEndTime: '', recurrenceFrequency: '', recurrenceInterval: '',
    recurrenceEndDate: '',
  },
  venue: {
    venueType: 'physical', venueName: '', venueCategory: '', venueCapacity: '',
    addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', zip: '',
    latitude: '', longitude: '', mapQuery: '', contactPerson: '', contactDesignation: '',
    contactPhoneCode: '+91', contactPhone: '', contactEmail: '',
    facilities: {
      wifi: false, parking: false, wheelchair: false, ac: false, audio: false,
      projector: false, stage: false, greenRoom: false, catering: false, powerBackup: false,
      restrooms: false, lodging: false, exhibition: false, security: false,
    },
    otherFacility: '', notes: '',
  },
  details: { hallName: '', viewMode: '2d', components: [] },
  organizer: {
    organizerType: 'company', companyName: '', gstin: '', pan: '', website: '',
    primaryEmail: '', primaryPhoneCode: '+91', primaryPhone: '', altPhoneCode: '+91', altPhone: '',
    address: '', city: '', state: '', country: 'India', zip: '',
    ownerName: '', ownerDesignation: '', ownerEmail: '', ownerPhoneCode: '+91', ownerPhone: '',
    additionalContacts: [],
    emergencyName: '', emergencyRelationship: '', emergencyPhoneCode: '+91', emergencyPhone: '',
    emergencyAltPhoneCode: '+91', emergencyAltPhone: '',
    yearEstablished: '', employeeCount: '', industry: '', businessType: '', registrationNumber: '', registeredAddress: '',
    facebook: '', instagram: '', linkedin: '', twitter: '', youtube: '',
  },
  tickets: {
    ticketTypes: [], passes: [], addOns: [], promoCodes: [], taxes: [], fees: [],
    payment: {
      currency: 'INR', priceDisplay: 'inclusive', rounding: 'round2',
      methods: { cards: true, upi: true, netbanking: true, wallets: true, emi: false, cod: false },
      paymentMode: 'authorize_capture', orderExpiry: '15', allowPartial: false,
      enableInvoice: true, savePaymentDetails: true, showTerms: false,
    },
  },
  media: {
    logoFile: [], coverFile: [], faviconFile: [], bannerFile: [],
    primaryColor: '#6C3EF2', secondaryColor: '#1E1E2D',
    gradientFrom: '#6C3EF2', gradientTo: '#EC4899',
    galleryFiles: [], documentFiles: [], shareTitle: '', shareDescription: '', shareImageFile: [],
  },
  publish: { publishOption: 'now', scheduleDate: '', scheduleTime: '' },
});
