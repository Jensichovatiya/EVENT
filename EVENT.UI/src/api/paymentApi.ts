import { fetchClient } from './fetchClient';
import { ApiResponseModel, Payment } from '../models';

export const paymentApi = {
  getPayments: (): Promise<ApiResponseModel<Payment[]>> => {
    return fetchClient('/payments');
  },

  addPayment: (data: any): Promise<ApiResponseModel<Payment>> => {
    return fetchClient('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  refundPayment: (data: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/payments/refund', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTaxes: (): Promise<ApiResponseModel<any[]>> => {
    return fetchClient('/taxes');
  },

  addEditTax: (data: any): Promise<ApiResponseModel<any>> => {
    return fetchClient('/taxes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

