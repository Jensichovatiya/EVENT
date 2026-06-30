import { fetchClient } from './fetchClient';
import { ApiResponseModel, Pass } from '../models';

export const scannerApi = {
  validatePass: (passCode: string): Promise<ApiResponseModel<Pass>> => {
    return fetchClient('/passes/validate', {
      method: 'POST',
      body: JSON.stringify({ passCode }),
    });
  },

  scanPass: (data: { passCode: string; scannerUserId: number }): Promise<ApiResponseModel<string>> => {
    return fetchClient('/scanner/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getScanHistory: (): Promise<ApiResponseModel<any[]>> => {
    return fetchClient('/scanner/history');
  }
};

