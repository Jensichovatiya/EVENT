import { fetchClient } from './fetchClient';
import { ApiResponseModel, User, Role } from '../models';

export const authApi = {
  login: (data: any): Promise<ApiResponseModel<User>> => {
    return fetchClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  register: (data: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyOtp: (data: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/auth/otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  forgotPassword: (email: string): Promise<ApiResponseModel<string>> => {
    return fetchClient('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: (data: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/auth/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  changePassword: (data: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUsers: (): Promise<ApiResponseModel<User[]>> => {
    return fetchClient('/users');
  },

  updateUserStatus: (data: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/users/status', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getRoles: (): Promise<ApiResponseModel<Role[]>> => {
    return fetchClient('/roles');
  },

  addEditRole: (data: any): Promise<ApiResponseModel<Role>> => {
    return fetchClient('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteRole: (id: number): Promise<ApiResponseModel<string>> => {
    return fetchClient(`/roles/${id}`, {
      method: 'DELETE',
    });
  }
};
