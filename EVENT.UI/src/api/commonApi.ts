import { fetchClient } from './fetchClient';
import { ApiResponseModel } from '../models';

export interface DropdownOption {
  value: number;
  label: string;
}

export interface UserDDL {
  roles: DropdownOption[];
}

export interface EventDDL {
  categories: DropdownOption[];
  organizers: DropdownOption[];
}

export interface AssetDDL {
  assetTypes: DropdownOption[];
}

export interface ZoneOption {
  value: number;
  label: string;
  seatPrice: number;
  capacity: number;
  blueprintId: number;
  eventId: number;
}

export interface EventSlotDropdownOption {
  value: number;
  label: string;
  slotId: number;
  eventId: number;
  eventName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  slotName: string;
  ticketPrice: number;
}

export interface BookingDDL {
  eventSlots: EventSlotDropdownOption[];
  zones: ZoneOption[];
}

export interface CurrencyOption {
  value: number;
  code: string;
  label: string;
  symbol: string;
}

export interface StringDropdownOption {
  value: string;
  label: string;
}

export interface EventDropdowns {
  currencies: CurrencyOption[];
  listingTypes: DropdownOption[];
  bookingTypes: DropdownOption[];
  eventTypes: DropdownOption[];
  zoneTypes: StringDropdownOption[];
  gateTypes: StringDropdownOption[];
  entryGates: DropdownOption[];
}

export interface CurrencyItem {
  currencyId: number;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  status: string;
  isDefault: boolean;
  autoUpdateRate: boolean;
  createdBy?: string;
  createdDate?: string;
  createdFrom?: string;
  updatedBy?: string;
  updatedDate?: string;
  updatedFrom?: string;
}

export const commonApi = {
  getUserDDL: (): Promise<ApiResponseModel<UserDDL>> => {
    return fetchClient('/common/user/ddl');
  },

  getEventDDL: (): Promise<ApiResponseModel<EventDDL>> => {
    return fetchClient('/common/event/ddl');
  },

  getAssetDDL: (): Promise<ApiResponseModel<AssetDDL>> => {
    return fetchClient('/common/asset/ddl');
  },

  getBookingDDL: (): Promise<ApiResponseModel<BookingDDL>> => {
    return fetchClient('/common/booking/ddl');
  },

  getEventDropdowns: (eventId?: number): Promise<ApiResponseModel<EventDropdowns>> => {
    const url = eventId ? `/common/event/dropdowns?eventId=${eventId}` : '/common/event/dropdowns';
    return fetchClient(url);
  },

  getCurrencies: (): Promise<ApiResponseModel<CurrencyItem[]>> => {
    return fetchClient('/settings/currencies');
  },

  addEditCurrency: (payload: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/settings/currencies', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
