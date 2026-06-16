import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind-aware className combiner used by all src/components/ui (shadcn) components.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
