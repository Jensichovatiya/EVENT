import { fetchClient } from './fetchClient';
import { ApiResponseModel, Invoice } from '../models';

export const invoiceApi = {
  getInvoices: (): Promise<ApiResponseModel<Invoice[]>> => {
    return fetchClient('/invoices');
  },

  addEditInvoice: (data: any): Promise<ApiResponseModel<Invoice>> => {
    return fetchClient('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

