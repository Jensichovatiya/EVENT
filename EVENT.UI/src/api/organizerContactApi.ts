import { fetchClient } from './fetchClient';
import { ApiResponseModel } from '../models';

export interface OrganizerContactResponse {
  contactId: number;
  publicId: string;
  organizerId: number;
  contactName: string;
  designation: string;
  roleResponsibility: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export interface OrganizerContactRequest {
  publicId?: string | null;
  organizerId: number;
  contactName: string;
  designation: string;
  roleResponsibility: string;
  email: string;
  phone: string;
  isActive?: boolean;
}

export const organizerContactApi = {
  getContacts: (): Promise<ApiResponseModel<OrganizerContactResponse[]>> => {
    return fetchClient('/organizer-contacts');
  },

  getContactById: (id: string): Promise<ApiResponseModel<OrganizerContactResponse>> => {
    return fetchClient(`/organizer-contacts/${id}`);
  },

  addEditContact: (data: OrganizerContactRequest): Promise<ApiResponseModel<OrganizerContactResponse>> => {
    return fetchClient('/organizer-contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteContact: (id: string): Promise<ApiResponseModel<string>> => {
    return fetchClient(`/organizer-contacts/${id}`, {
      method: 'DELETE',
    });
  },
};
