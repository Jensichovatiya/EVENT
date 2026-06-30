import * as React from 'react'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/Ui/button'
import { Calendar } from '@/Ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/Ui/popover'

export type { DateRange }

interface DateRangePickerProps {
  value?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  numberOfMonths?: number
  formatStr?: string
}

function DateRangePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date range',
  disabled = false,
  className,
  numberOfMonths = 2,
  formatStr = 'LLL dd, y',
}: DateRangePickerProps) {
  const displayValue = value?.from
    ? value.to
      ? `${format(value.from, formatStr)} – ${format(value.to, formatStr)}`
      : format(value.from, formatStr)
    : null

  return (
    <Popover>
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
          {displayValue ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onValueChange}
          numberOfMonths={numberOfMonths}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={new Date().getFullYear() - 80}
          toYear={new Date().getFullYear() + 5}
          defaultMonth={value?.from}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker }
