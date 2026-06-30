import { fetchClient } from './fetchClient';
import { ApiResponseModel } from '../models';

const getToken   = () => localStorage.getItem('authToken') || '';
const getBaseUrl = () =>
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5209/api';

export interface ComponentItem {
  componentId:   number;
  componentRId:  string;
  componentName: string;
  componentCode: string;
  category:      string;
  description:   string;
  iconUrl:       string;
  // Shape & Size
  shape:         string;
  defaultWidth:  number;
  defaultHeight: number;
  rotation:      number;
  widthUnit:     string;
  heightUnit:    string;
  // Appearance
  defaultColor:  string;
  borderColor:   string;
  borderWidth:   number;
  opacity:       number;
  // Booking & Access
  allowBooking:  boolean;
  bookableAs:    string;
  accessibility: string;
  accessType:    string;
  // Placement
  snapToGrid:    boolean;
  stackable:     boolean;
  movable:       boolean;
  resizable:     boolean;
  isFixed:       boolean;
  // Additional
  defaultLabel:  string;
  labelPosition: string;
  showLabel:     boolean;
  zIndex:        number;
  defaultPrice:  number;
  currency:      string;
  notes:         string;
  isActive:      boolean;
  // Audit
  createdBy?:    string;
  createdFrom?:  string;
  updatedBy?:    string;
  updatedFrom?:  string;

  // Lookup ID properties
  categoryId?:      number;
  bookableAsId?:    number;
  accessibilityId?: number;
  accessTypeId?:    number;
  shapeTypeId?:     number;
  currencyId?:      number;
  labelPositionId?: number;
}

export const componentApi = {
  // ── GET /api/components?searchText=&pageNumber=1&pageSize=100 ────────────
  getComponents: (
    searchText?: string,
    pageNumber = 1,
    pageSize   = 100
  ): Promise<ApiResponseModel<ComponentItem[]>> => {
    const params = new URLSearchParams();
    if (searchText) params.set('searchText', searchText);
    params.set('pageNumber', String(pageNumber));
    params.set('pageSize',   String(pageSize));
    return fetchClient(`/components?${params.toString()}`);
  },

  // ── GET /api/components/{id} ─────────────────────────────────────────────
  getComponentById: (id: number): Promise<ApiResponseModel<ComponentItem>> => {
    return fetchClient(`/components/${id}`);
  },

  // ── POST /api/components  — multipart: flat properties + optional IconFile ──
  addEditComponent: async (
    data:     Partial<ComponentItem>,
    iconFile?: File | null
  ): Promise<ApiResponseModel<ComponentItem>> => {
    const fd = new FormData();

    // Append all properties directly to FormData
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        fd.append(key, String(val));
      }
    });

    // Attach icon file if provided
    if (iconFile) fd.append('IconFile', iconFile);

    const res = await fetch(`${getBaseUrl()}/components`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      // Do NOT set Content-Type — browser sets multipart boundary automatically
      body:    fd,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.message || 'Failed to save component.');
    }
    return res.json();
  },

  // ── DELETE /api/components/{id} ──────────────────────────────────────────
  deleteComponent: (
    id:          number,
    updatedBy:   string,
    updatedFrom: string
  ): Promise<ApiResponseModel<string>> => {
    return fetchClient(
      `/components/${id}?updatedBy=${encodeURIComponent(updatedBy)}&updatedFrom=${encodeURIComponent(updatedFrom)}`,
      { method: 'DELETE' }
    );
  },
};
