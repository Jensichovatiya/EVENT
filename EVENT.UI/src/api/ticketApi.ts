import { fetchClient } from './fetchClient';
import { ApiResponseModel } from '../models';

// ── Request models (mirroring C# InputModels) ──────────────────────────────

export interface TicketRequest {
  publicId?: string | null;
  eventId: number;
  ticketName: string;
  ticketCategoryId: number;
  description: string;
  price: number;
  availableLimit: number;
  perOrderLimit?: number | null;
  salesStartDate?: string | null;
  salesEndDate?: string | null;
  displayBadge?: string;
  badgeColor?: string;
  additionalInfo?: string;
  isActive?: boolean;
  createdBy?: string;
  createdFrom?: string;
}

export interface PassRequest {
  publicId?: string | null;
  eventId: number;
  passName: string;
  validFrom: string;
  validTo: string;
  price: number;
  totalLimit: number;
  includes?: string;
  description?: string;
  displayBadge?: string;
  badgeColor?: string;
  isActive?: boolean;
  createdBy?: string;
  createdFrom?: string;
}

export interface AddOnRequest {
  publicId?: string | null;
  eventId: number;
  addOnName: string;
  price: number;
  availableLimit: number;
  requiredTypeId: number;
  description?: string;
  ticketTypeIds?: string;
  displayBadge?: string;
  badgeColor?: string;
  isActive?: boolean;
  createdBy?: string;
  createdFrom?: string;
}

export interface PromoCodeRequest {
  publicId?: string | null;
  eventId: number;
  promoCode: string;
  discountTypeId: number;
  appliesToId: number;
  discountValue: number;
  usageLimit?: number | null;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  description?: string;
  isActive?: boolean;
  createdBy?: string;
  createdFrom?: string;
}

// ── Response models (mirroring C# OutputModels) ────────────────────────────

export interface TicketApiResponse {
  ticketId: number;
  publicId: string;
  eventId: number;
  ticketName: string;
  ticketCategoryId: number;
  ticketCategoryName: string;
  description: string;
  price: number;
  availableLimit: number;
  perOrderLimit?: number | null;
  salesStartDate?: string | null;
  salesEndDate?: string | null;
  displayBadge: string;
  badgeColor: string;
  additionalInfo: string;
  isActive: boolean;
}

export interface PassApiResponse {
  eventPassId: number;
  publicId: string;
  eventId: number;
  passName: string;
  validFrom: string;
  validTo: string;
  price: number;
  totalLimit: number;
  includes: string;
  description: string;
  displayBadge: string;
  badgeColor: string;
  isActive: boolean;
}

export interface AddOnApiResponse {
  addOnId: number;
  publicId: string;
  eventId: number;
  addOnName: string;
  price: number;
  availableLimit: number;
  requiredTypeId: number;
  requiredText: string;
  description: string;
  ticketTypeIds: string;
  displayBadge: string;
  badgeColor: string;
  isActive: boolean;
}

export interface PromoCodeApiResponse {
  promoCodeId: number;
  publicId: string;
  eventId: number;
  promoCode: string;
  discountTypeId: number;
  discountTypeName: string;
  appliesToId: number;
  discountValue: number;
  usageLimit?: number | null;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  description: string;
  isActive: boolean;
}

// ── API ────────────────────────────────────────────────────────────────────

export const ticketApi = {
  // Tickets
  getTickets: (eventId: number): Promise<ApiResponseModel<TicketApiResponse[]>> =>
    fetchClient(`/${eventId}/tickets`),

  addEditTicket: (data: TicketRequest): Promise<ApiResponseModel<TicketApiResponse>> =>
    fetchClient('/tickets', { method: 'POST', body: JSON.stringify(data) }),

  // Passes
  getPasses: (eventId: number): Promise<ApiResponseModel<PassApiResponse[]>> =>
    fetchClient(`/${eventId}/passes`),

  addEditPass: (data: PassRequest): Promise<ApiResponseModel<PassApiResponse>> =>
    fetchClient('/passes', { method: 'POST', body: JSON.stringify(data) }),

  // Add-ons
  getAddOns: (eventId: number): Promise<ApiResponseModel<AddOnApiResponse[]>> =>
    fetchClient(`/${eventId}/addons`),

  addEditAddOn: (data: AddOnRequest): Promise<ApiResponseModel<AddOnApiResponse>> =>
    fetchClient('/addons', { method: 'POST', body: JSON.stringify(data) }),

  deleteAddOn: (publicId: string): Promise<ApiResponseModel<string>> =>
    fetchClient(`/addons/${publicId}`, { method: 'DELETE' }),

  // Promo codes
  getPromoCodes: (eventId: number): Promise<ApiResponseModel<PromoCodeApiResponse[]>> =>
    fetchClient(`/${eventId}/promocodes`),

  addEditPromoCode: (data: PromoCodeRequest): Promise<ApiResponseModel<PromoCodeApiResponse>> =>
    fetchClient('/promo-codes', { method: 'POST', body: JSON.stringify(data) }),

  deletePromoCode: (publicId: string): Promise<ApiResponseModel<string>> =>
    fetchClient(`/promo-codes/${publicId}`, { method: 'DELETE' }),

  // Taxes & Fees
  getSystemTaxes: (): Promise<ApiResponseModel<any[]>> =>
    fetchClient('/taxes'),

  addSystemTax: (data: { taxName: string; percentage: number }): Promise<ApiResponseModel<any>> =>
    fetchClient('/taxes', { method: 'POST', body: JSON.stringify(data) }),

  addEventTax: (data: any): Promise<ApiResponseModel<any>> =>
    fetchClient('/event-taxes', { method: 'POST', body: JSON.stringify(data) }),

  deleteEventTax: (publicId: string): Promise<ApiResponseModel<string>> =>
    fetchClient(`/event-taxes/${publicId}`, { method: 'DELETE' }),

  getEventTaxes: (eventId: number): Promise<ApiResponseModel<any[]>> =>
    fetchClient(`/${eventId}/taxes`),

  addFee: (data: any): Promise<ApiResponseModel<any>> =>
    fetchClient('/fees', { method: 'POST', body: JSON.stringify(data) }),

  deleteFee: (publicId: string): Promise<ApiResponseModel<string>> =>
    fetchClient(`/fees/${publicId}`, { method: 'DELETE' }),

  getEventFees: (eventId: number): Promise<ApiResponseModel<any[]>> =>
    fetchClient(`/${eventId}/fees`),
};
