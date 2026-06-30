import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const registerSchema = yup.object().shape({
  userName: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  mobileNo: yup.string().matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').required('Mobile number is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  roleName: yup.string().required('Role is required'),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

export const resetPasswordSchema = yup.object().shape({
  otp: yup.string().length(6, 'OTP must be exactly 6 digits').required('OTP is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm Password is required'),
});

export const eventBasicSchema = yup.object().shape({
  eventName: yup.string().required('Event Name is required').max(300, 'Max 300 characters'),
  eventCode: yup.string().required('Event Code is required').max(100, 'Max 100 characters'),
  categoryId: yup.number().transform((value, originalValue) => originalValue === "" ? null : value).positive('Please select a category').required('Category is required'),
  eventSubCategoryId: yup.number().transform((value, originalValue) => originalValue === "" ? null : value).nullable(),
  about: yup.string().required('About details are required'),
  termsAndConditions: yup.string().required('Terms and conditions are required'),
  listingType: yup.number().required('Listing Type is required'),
  bookingType: yup.number().required('Booking Type is required'),
  currency: yup.string().default('INR'),
  eventType: yup.number().required('Event Type is required'),
  ticketPrice: yup.number().min(0, 'Price cannot be negative').required('Ticket Price is required'),
  capacity: yup.number().positive('Capacity must be positive').required('Capacity is required'),
});

export const eventLocationSchema = yup.object().shape({
  locationName: yup.string().optional(),
  address: yup.string().optional(),
  venueName: yup.string().required('Venue Name is required'),
  addressLine1: yup.string().required('Address Line 1 is required'),
  addressLine2: yup.string().optional(),
  areaName: yup.string().optional(),
  landmark: yup.string().optional(),
  pincode: yup.string().required('Pincode is required'),
  latitude: yup.number().typeError('Must be a number').required('Latitude is required'),
  longitude: yup.number().typeError('Must be a number').required('Longitude is required'),
  googleMapLink: yup.string().optional(),
  hallName: yup.string().optional(),
  groundName: yup.string().optional(),
  parkingAvailable: yup.boolean().default(false),
  parkingDetails: yup.string().optional(),
  countryId: yup.string().required('Country is required'),
  stateId: yup.string().required('State is required'),
  cityId: yup.string().required('City is required'),
});

export const bookingSchema = yup.object().shape({
  slotId: yup.number().positive('Select a valid slot').required('Slot selection is required'),
  ticketQty: yup.number().positive('Quantity must be greater than 0').max(10, 'Max 10 tickets per booking').required('Quantity is required'),
});
