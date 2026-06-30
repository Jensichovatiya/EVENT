import { fetchClient } from './fetchClient';
import { ApiResponseModel } from '../models';

export const notificationApi = {
  getNotifications: (userId: number): Promise<ApiResponseModel<any[]>> => {
    return fetchClient(`/notifications?userId=${userId}`);
  },
  markAsRead: (notificationId: number): Promise<ApiResponseModel<string>> => {
    return fetchClient(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }
};
