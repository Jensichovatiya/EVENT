import { fetchClient } from './fetchClient';
import { ApiResponseModel } from '../models';

export const passApi = {
  getUserPasses: (userId: number): Promise<ApiResponseModel<any[]>> => {
    return fetchClient(`/passes/my-passes?userId=${userId}`);
  }
};
