export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ORGANIZER: 'Organizer',
  EMPLOYEE: 'Employee',
  VISITOR: 'Visitor',
  SCANNER: 'Scanner'
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
  
  // Portals
  DASHBOARD: '/dashboard',
  USERS: '/users',
  ROLES: '/roles',
  
  // Events
  EVENTS: '/events',
  EVENT_CREATE: '/events/create',
  EVENT_EDIT: '/events/edit/:id',
  EVENT_DETAILS: '/events/:id',
  EVENT_SLOTS: '/events/:id/slots',
  EVENT_ASSETS: '/events/:id/assets',
  EVENT_DOCUMENTS: '/events/:id/documents',

  // Bookings & Passes
  BOOKINGS: '/bookings',
  BOOKING_DETAILS: '/bookings/:id',
  SEAT_SELECTION: '/booking/seats',
  CHECKOUT: '/booking/checkout',
  PASSES: '/passes',
  PASS_DETAILS: '/passes/:id',
  BOOKING_PASSES: '/booking/:bookingId/passes',

  // Payments & Invoices
  INVOICES: '/invoices',
  INVOICE_DETAILS: '/invoices/:id',
  PAYMENTS: '/payments',

  // Scanner Portal
  SCANNER: '/scanner',
  ATTENDANCE: '/attendance',

  // Admin Config
  CATEGORIES: '/categories',
  ASSETS: '/assets',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  LOGS: '/logs',
  PROFILE: '/profile',
  
  // Missing Role-Specific Routes
  EVENT_APPROVAL: '/event-approvals',
  ASSET_TYPES: '/asset-types',
  SCANNER_LOGS: '/scanner-logs',
  EMPLOYEES: '/employees'
};
