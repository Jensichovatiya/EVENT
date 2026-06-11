import { fetchClient } from './fetchClient';
import { ApiResponseModel, Asset, AssetType } from '../models';

export const assetApi = {
  getAssets: (): Promise<ApiResponseModel<Asset[]>> => {
    return fetchClient('/assets');
  },

  addEditAsset: (data: any): Promise<ApiResponseModel<Asset>> => {
    return fetchClient('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAssetTypes: (): Promise<ApiResponseModel<AssetType[]>> => {
    return fetchClient('/asset-types');
  },

  addEditAssetType: (data: any): Promise<ApiResponseModel<AssetType>> => {
    return fetchClient('/asset-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  allocateReturnAsset: (data: any): Promise<ApiResponseModel<any>> => {
    return fetchClient('/assets/allocation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAssetInventory: (): Promise<ApiResponseModel<any[]>> => {
    return fetchClient('/assets/inventory');
  }
};
