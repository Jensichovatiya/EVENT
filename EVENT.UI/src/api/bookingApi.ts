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
  }
};

