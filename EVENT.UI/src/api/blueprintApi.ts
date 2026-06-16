import { fetchClient } from './fetchClient';
import { ApiResponseModel } from '../models';

export interface Blueprint {
  blueprintId: number;
  blueprintRId: string;
  eventId: number;
  blueprintName: string;
  blueprintImage: string;
  blueprintJson: string;
  stagePosition: string;
  totalZones: number;
  totalSeats: number;
  isSeatBased: boolean;
  isPublished: boolean;
  remarks: string;
}

export interface Zone {
  zoneId: number;
  zoneRId: string;
  blueprintId: number;
  eventId: number;
  zoneName: string;
  zoneCode: string;
  zoneType: string;
  colorCode: string;
  capacity: number;
  rowCount: number;
  columnCount: number;
  seatPrice: number;
  isVIP: boolean;
  isReserved: boolean;
  isSeatSelectionAllowed: boolean;
  entryGateId: number | null;
  sortOrder: number;
  remarks: string;
  isActive: boolean;
}

export interface ZoneSeat {
  seatId: number;
  seatRId: string;
  zoneId: number;
  eventId: number;
  seatNumber: string;
  rowName: string;
  columnNo: number;
  seatStatus: string;
  isBooked: boolean;
  isBlocked: boolean;
  isReserved: boolean;
  bookingId: number | null;
  price: number;
  qrCode: string;
  barcode: string;
  remarks: string;
}

export interface EntryGate {
  entryGateId: number;
  entryGateRId: string;
  eventId: number;
  gateName: string;
  gateCode: string;
  gateType: string;
  latitude: string;
  longitude: string;
  scannerUserId: number | null;
  remarks: string;
  isActive: boolean;
}

export interface ZonePricing {
  zonePricingId: number;
  zonePricingRId: string;
  eventId: number;
  zoneId: number;
  slotId: number | null;
  price: number;
  taxPercentage: number;
  finalPrice: number;
  isEarlyBird: boolean;
  validFrom: string | null;
  validTo: string | null;
  remarks: string;
}

export const blueprintApi = {
  // Blueprints
  getBlueprintsByEvent: (eventId: number): Promise<ApiResponseModel<Blueprint[]>> => {
    return fetchClient(`/blueprints/event/${eventId}`);
  },
  getBlueprintById: (blueprintId: number, rid: string = ''): Promise<ApiResponseModel<Blueprint>> => {
    return fetchClient(`/blueprints/${blueprintId}?rid=${rid}`);
  },
  addEditBlueprint: (payload: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/blueprints', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  deleteBlueprint: (blueprintId: number, rid: string = ''): Promise<ApiResponseModel<string>> => {
    return fetchClient(`/blueprints/${blueprintId}?rid=${rid}`, {
      method: 'DELETE'
    });
  },

  // Zones
  getZonesByBlueprint: (blueprintId: number): Promise<ApiResponseModel<Zone[]>> => {
    return fetchClient(`/blueprints/zones/blueprint/${blueprintId}`);
  },
  getZoneById: (zoneId: number, rid: string = ''): Promise<ApiResponseModel<Zone>> => {
    return fetchClient(`/blueprints/zones/${zoneId}?rid=${rid}`);
  },
  addEditZone: (payload: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/blueprints/zones', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  deleteZone: (zoneId: number, rid: string = ''): Promise<ApiResponseModel<string>> => {
    return fetchClient(`/blueprints/zones/${zoneId}?rid=${rid}`, {
      method: 'DELETE'
    });
  },

  // Seats
  getSeatsByZone: (zoneId: number): Promise<ApiResponseModel<ZoneSeat[]>> => {
    return fetchClient(`/blueprints/seats/zone/${zoneId}`);
  },
  saveZoneSeats: (payload: any[]): Promise<ApiResponseModel<string>> => {
    return fetchClient('/blueprints/seats/save-bulk', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Entry Gates
  getEntryGatesByEvent: (eventId: number): Promise<ApiResponseModel<EntryGate[]>> => {
    return fetchClient(`/blueprints/entrygates/event/${eventId}`);
  },
  addEditEntryGate: (payload: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/blueprints/entrygates', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Zone Pricing
  getZonePricingByEvent: (eventId: number): Promise<ApiResponseModel<ZonePricing[]>> => {
    return fetchClient(`/blueprints/pricing/event/${eventId}`);
  },
  addEditZonePricing: (payload: any): Promise<ApiResponseModel<string>> => {
    return fetchClient('/blueprints/pricing', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
