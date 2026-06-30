import { fetchClient } from './fetchClient';
import { ApiResponseModel, Asset, AssetType } from '../models';

const getToken   = () => localStorage.getItem('authToken') || '';
const getBaseUrl = () =>
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5209/api';

export const assetApi = {
  // ── Assets ──────────────────────────────────────────────────────────────

  getAssets: (): Promise<ApiResponseModel<Asset[]>> => {
    return fetchClient('/assets');
  },

  addEditAsset: (data: any): Promise<ApiResponseModel<Asset>> => {
    return fetchClient('/assets', {
      method: 'POST',
      body:   JSON.stringify(data),
    });
  },

  // ── Asset Types ──────────────────────────────────────────────────────────

  getAssetTypes: (): Promise<ApiResponseModel<AssetType[]>> => {
    return fetchClient('/asset-types');
  },

  // POST /api/asset-types — multipart: model (JSON string) + optional IconFile
  addEditAssetType: async (data: any, iconFile?: File | null): Promise<ApiResponseModel<AssetType>> => {
    const fd = new FormData();

    // Serialize all fields as a single JSON string (EventController pattern)
    fd.append('model', JSON.stringify(data));

    // Attach icon file if provided
    if (iconFile) fd.append('IconFile', iconFile);

    const res = await fetch(`${getBaseUrl()}/asset-types`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      // Do NOT set Content-Type — browser sets multipart boundary automatically
      body:    fd,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.message || 'Failed to save asset type.');
    }
    return res.json();
  },

  // ── Allocation ───────────────────────────────────────────────────────────

  allocateReturnAsset: (data: any): Promise<ApiResponseModel<any>> => {
    return fetchClient('/assets/allocation', {
      method: 'POST',
      body:   JSON.stringify(data),
    });
  },

  getAssetInventory: (): Promise<ApiResponseModel<any[]>> => {
    return fetchClient('/assets/inventory');
  },
};
