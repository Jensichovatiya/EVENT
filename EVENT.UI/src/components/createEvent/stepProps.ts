import { EventDraft } from './types';

export interface DDL {
  categories: { label: string; value: number }[];
  subCategories: { label: string; value: number }[];
  eventTypes: { label: string; value: number }[];
  currencies: { label: string; value: string }[];
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
