import { EventDraft } from './types';

export interface DDL {
  categories: { label: string; value: number }[];
  subCategories: { label: string; value: number }[];
  eventTypes: { label: string; value: number }[];
  currencies: { label: string; value: string }[];
  timezones: { label: string; value: string }[];
  venueTypes: { label: string; value: string }[];
  venueCategories: { label: string; value: string }[];
  // Ticket-step dropdowns from USP_GetEventDropdowns tables 15-18
  ticketCategories?: { label: string; value: number }[];
  addonRequired?: { label: string; value: number }[];
  calculationTypes?: { label: string; value: number }[];
  chargeToOptions?: { label: string; value: number }[];
  taxes?: { label: string; value: number }[];
  passIncludes?: { label: string; value: number }[];
  repeatsConfig?: { label: string; value: string }[];
  eventZones?: { label: string; value: number }[];
  zones?: { label: string; value: string }[];
  arrangementTypes?: { label: string; value: string }[];
}

export interface StepProps {
  draft: EventDraft;
  // Replace a whole top-level section of the draft.
  onChange: <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => void;
  ddl: DDL;
  meta: { activeStep: number; completed: Record<number, boolean> };
  errors?: Record<string, string>;
  goToStep?: (index: number) => void;
}
