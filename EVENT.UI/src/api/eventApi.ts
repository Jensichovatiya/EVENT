import { fetchClient } from './fetchClient';
import { ApiResponseModel, EventModel, EventCategory } from '../models';

export const eventApi = {
  getEvents: (id?: string): Promise<ApiResponseModel<any>> => {
    return fetchClient(id ? `/events/${id}` : '/events');
  },

  addEditEvent: (formData: FormData): Promise<ApiResponseModel<EventModel>> => {
    return fetchClient('/events', {
      method: 'POST',
      body: formData, // Multi-part form data
    });
  },

  updateEventStatus: (data: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/events/status', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  duplicateEvent: (data: any): Promise<ApiResponseModel<EventModel>> => {
    return fetchClient('/events/duplicate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteSlot: (slotId: number): Promise<ApiResponseModel<string>> => {
    return fetchClient(`/events/slots/delete/${slotId}`, {
      method: 'DELETE',
    });
  },

  deleteDocument: (docId: number): Promise<ApiResponseModel<string>> => {
    return fetchClient(`/events/documents/delete/${docId}`, {
      method: 'DELETE',
    });
  },

  getAnalytics: (): Promise<ApiResponseModel<any>> => {
    return fetchClient('/events/analytics');
  },

  // Categories
  getCategories: (): Promise<ApiResponseModel<any[]>> => {
    return fetchClient('/categories');
  },

  addEditCategory: (data: any): Promise<ApiResponseModel<any>> => {
    return fetchClient('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: (id: string): Promise<ApiResponseModel<string>> => {
    return fetchClient(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
};
