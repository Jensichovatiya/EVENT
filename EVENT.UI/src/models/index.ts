export interface ApiResponseModel<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors?: string[];
}

export interface User {
  userId: number;
  userName: string;
  email: string;
  mobileNo: string;
  roleName: string;
  isActive: boolean;
  profileImage?: string;
  token?: string;
  refreshToken?: string;
}

export interface Role {
  roleId: number;
  roleName: string;
  roleCode: string;
  description: string;
}

export interface EventCategory {
  categoryId: number;
  categoryName: string;
  categoryCode: string;
  description: string;
  isActive: boolean;
}

export interface EventSlot {
  slotId: number;
  eventId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedSeats?: number;
  availableSeats?: number;
  slotName?: string;
  ticketPrice?: number;
  genderRestriction?: string;
  ageRestriction?: number;
}

export interface EventDocument {
  documentId: number;
  eventId: number;
  documentName: string;
  relativePath: string;
  isPrimary?: boolean;
  displayOrder?: number;
  thumbnailPath?: string;
}

export interface EventModel {
  eventId: number;
  eventRId?: string;
  eventName: string;
  eventCode: string;
  categoryId: number;
  categoryName?: string;
  eventSubCategoryId?: number;
  thumbnailImage?: string;
  bannerImage?: string;
  about?: string;
  description?: string;
  termsAndConditions?: string;
  facebookLink?: string;
  websiteLink?: string;
  youtubeLink?: string;
  instagramLink?: string;
  twitterLink?: string;
  linkedInLink?: string;
  pintrestLink?: string;
  listingType?: number;
  isBookingAccept: boolean;
  bookingType?: number;
  currency?: string;
  eventType?: number;
  isPublishActive: boolean;
  isPassBookingActive: boolean;
  status: number;
  approvalStatus: number;
  capacity?: number;
  ticketPrice?: number;
  isCancelled: boolean;
  cancelReason?: string;
  rejectionReason?: string;
  organizerId?: number;
  shortDescription?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
  isFree?: boolean;
  isPublic?: boolean;
  metaJson?: string;
  locationName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  isActive: boolean;
  slots: EventSlot[];
  documents: EventDocument[];
}

export interface AssetType {
  assetTypeId: number;
  typeName: string;
  description: string;
}

export interface Asset {
  assetId: number;
  assetTypeId: number;
  assetTypeName?: string;
  assetName: string;
  assetCode: string;
  description: string;
  totalQty: number;
  availableQty: number;
  damageQty?: number;
  unitPrice?: number;
  purchaseDate?: string;
  vendorName?: string;
}

export interface Booking {
  bookingId: number;
  bookingNumber: string;
  eventId: number;
  eventName?: string;
  userId: number;
  userName?: string;
  slotId: number;
  bookingDate: string;
  ticketQty: number;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  bookingStatus: number;
  paymentStatus: number;
}

export interface Invoice {
  invoiceId: number;
  invoiceNumber: string;
  bookingId: number;
  bookingNumber?: string;
  invoiceDate: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  pdfPath?: string;
}

export interface Payment {
  paymentId: number;
  bookingId: number;
  invoiceId: number;
  transactionNo: string;
  paymentMode: string;
  amount: number;
  paymentDate: string;
  status: number;
  refundAmount?: number;
}

export interface Pass {
  passId: number;
  passCode: string;
  bookingId: number;
  eventId: number;
  eventName?: string;
  slotId: number;
  slotDate?: string;
  startTime?: string;
  holderName: string;
  holderEmail: string;
  qrCodePath?: string;
  isValid: boolean;
}

export interface AuditLog {
  logId: number;
  action: string;
  tableName: string;
  rowId: number;
  userId: number;
  userName?: string;
  actionDate: string;
  details: string;
}

export interface ErrorLog {
  errorId: number;
  errorMessage: string;
  stackTrace: string;
  errorDate: string;
  source: string;
}
