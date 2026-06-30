import { fetchClient } from './fetchClient';
import { ApiResponseModel } from '../models';

export const reportApi = {
  getRevenueReport: (params?: any): Promise<ApiResponseModel<any>> => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchClient(`/report/revenue${query}`);
  },

  getBookingReport: (params?: any): Promise<ApiResponseModel<any>> => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchClient(`/report/bookings${query}`);
  },

  getAttendanceReport: (): Promise<ApiResponseModel<any>> => {
    return fetchClient('/pass/report/attendance');
  }
};
