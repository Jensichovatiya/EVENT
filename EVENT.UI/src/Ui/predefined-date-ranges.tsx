import * as React from 'react'
import { type DateRange } from 'react-day-picker'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  format,
} from 'date-fns'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/Ui/button'
import { Calendar } from '@/Ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/Ui/popover'

export interface DatePreset {
  label: string
  getValue: () => DateRange
}

export const DEFAULT_PRESETS: DatePreset[] = [
  {
    label: 'Today',
    getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    label: 'Yesterday',
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: 'Last 7 days',
    getValue: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }),
  },
  {
    label: 'Last 14 days',
    getValue: () => ({ from: startOfDay(subDays(new Date(), 13)), to: endOfDay(new Date()) }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }),
  },
  {
    label: 'This week',
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'Last week',
    getValue: () => {
      const last = subWeeks(new Date(), 1)
      return {
        from: startOfWeek(last, { weekStartsOn: 1 }),
        to: endOfWeek(last, { weekStartsOn: 1 }),
      }
    },
  },
  {
    label: 'This month',
    getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  {
    label: 'Last month',
    getValue: () => {
      const last = subMonths(new Date(), 1)
      return { from: startOfMonth(last), to: endOfMonth(last) }
    },
  },
  {
    label: 'This year',
    getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
  },
]

interface PredefinedDateRangesProps {
  value?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  presets?: DatePreset[]
  placeholder?: string
  disabled?: boolean
  className?: string
  formatStr?: string
}

function PredefinedDateRanges({
  value,
  onValueChange,
  presets = DEFAULT_PRESETS,
  placeholder = 'Select date range',
  disabled = false,
  className,
  formatStr = 'LLL dd, y',
}: PredefinedDateRangesProps) {
  const [open, setOpen] = React.useState(false)
  const [activePreset, setActivePreset] = React.useState<string | null>(null)

  const displayValue = value?.from
    ? value.to
      ? `${format(value.from, formatStr)} – ${format(value.to, formatStr)}`
      : format(value.from, formatStr)
    : null

  const handlePreset = (preset: DatePreset) => {
    setActivePreset(preset.label)
    onValueChange?.(preset.getValue())
  }

  const handleCalendar = (range: DateRange | undefined) => {
    setActivePreset(null)
    onValueChange?.(range)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !displayValue && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1 truncate">{displayValue ?? placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="flex w-auto p-0" align="start">
        {/* Presets sidebar */}
        <div className="flex min-w-[140px] flex-col border-r p-2">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Quick select</p>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset)}
              className={cn(
                'flex rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                activePreset === preset.label && 'bg-accent font-medium text-accent-foreground',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Calendar */}
        <div>
          <Calendar
            mode="range"
            selected={value}
            onSelect={handleCalendar}
            numberOfMonths={2}
            initialFocus
          />
          <div className="flex justify-end border-t p-2">
            <Button size="sm" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { PredefinedDateRanges }
