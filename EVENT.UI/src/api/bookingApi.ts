import { fetchClient } from './fetchClient';
import { ApiResponseModel, Booking } from '../models';

export const bookingApi = {
  getBookings: (id?: string): Promise<ApiResponseModel<any>> => {
    return fetchClient(id ? `/bookings/${id}` : '/bookings');
  },

  createBooking: (data: any): Promise<ApiResponseModel<Booking>> => {
    return fetchClient('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancelBooking: (id: string, reason: string = 'Cancelled by user'): Promise<ApiResponseModel<string>> => {
    return fetchClient('/bookings/cancel', {
      method: 'PUT',
      body: JSON.stringify({ bookingRId: id, reason }),
    });
  },

  checkSeatAvailability: (eventId: number, slotId: number): Promise<ApiResponseModel<any>> => {
    return fetchClient(`/bookings/availability?eventId=${eventId}&slotId=${slotId}`);
  },

  getAvailableEventDates: (eventId: number): Promise<ApiResponseModel<string[]>> => {
    return fetchClient(`/bookings/available-dates?eventId=${eventId}`);
  },

  getAvailableZones: (eventId: number): Promise<ApiResponseModel<any[]>> => {
    return fetchClient(`/bookings/available-zones?eventId=${eventId}`);
  },

  getAvailableSlotsByDate: (eventId: number, date: string): Promise<ApiResponseModel<any[]>> => {
    return fetchClient(`/bookings/available-slots?eventId=${eventId}&date=${date}`);
  },

  getAvailableSeats: (eventId: number, zoneId: number, date: string, slotId: number): Promise<ApiResponseModel<any[]>> => {
    return fetchClient(`/bookings/available-seats?eventId=${eventId}&zoneId=${zoneId}&date=${date}&slotId=${slotId}`);
  },

  validateBookingLimit: (eventId: number, quantity: number): Promise<ApiResponseModel<any>> => {
    return fetchClient(`/bookings/validate-limit?eventId=${eventId}&quantity=${quantity}`, {
      method: 'POST'
    });
  },

  lockSeats: (payload: any): Promise<ApiResponseModel<any>> => {
    return fetchClient('/bookings/lock-seats', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  createUpdateAdvancedBooking: (payload: any): Promise<ApiResponseModel<any>> => {
    return fetchClient('/bookings/advanced', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  processPayment: (payload: any): Promise<ApiResponseModel<any>> => {
    return fetchClient('/payments/process', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  generatePasses: (bookingId: number): Promise<ApiResponseModel<any>> => {
    return fetchClient(`/passes/generate-advanced?bookingId=${bookingId}`, {
      method: 'POST'
    });
  },

  releaseSeats: (payload: any): Promise<ApiResponseModel<any>> => {
    return fetchClient('/bookings/release-seats', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

