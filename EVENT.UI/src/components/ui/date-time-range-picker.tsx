import * as React from 'react'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { TimePicker, type TimeValue } from '@/components/ui/time-picker'

export interface DateTimeRange {
  from?: Date
  to?: Date
  fromTime?: TimeValue
  toTime?: TimeValue
}

interface DateTimeRangePickerProps {
  value?: DateTimeRange
  onValueChange?: (value: DateTimeRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showSeconds?: boolean
  formatStr?: string
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function DateTimeRangePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date & time range',
  disabled = false,
  className,
  showSeconds = false,
  formatStr = 'LLL dd, y',
}: DateTimeRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const dateRange: DateRange | undefined =
    value?.from || value?.to ? { from: value?.from, to: value?.to } : undefined

  const handleDateChange = (range: DateRange | undefined) => {
    onValueChange?.({ ...value, from: range?.from, to: range?.to })
  }

  const handleFromTime = (t: TimeValue) => {
    onValueChange?.({ ...value, fromTime: t })
  }

  const handleToTime = (t: TimeValue) => {
    onValueChange?.({ ...value, toTime: t })
  }

  const fmtTime = (t?: TimeValue) =>
    t
      ? ` ${pad2(t.hours % 12 === 0 ? 12 : t.hours % 12)}:${pad2(t.minutes)}${t.hours >= 12 ? ' PM' : ' AM'}`
      : ''

  const displayValue = value?.from
    ? [
        `${format(value.from, formatStr)}${fmtTime(value.fromTime)}`,
        value.to
          ? ` – ${format(value.to, formatStr)}${fmtTime(value.toTime)}`
          : '',
      ].join('')
    : null

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
          {displayValue ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleDateChange}
          numberOfMonths={2}
          initialFocus
        />

        <Separator />

        <div className="grid grid-cols-2 gap-4 p-3">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Start time</p>
            <TimePicker
              value={value?.fromTime}
              onValueChange={handleFromTime}
              showSeconds={showSeconds}
              placeholder="Start time"
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">End time</p>
            <TimePicker
              value={value?.toTime}
              onValueChange={handleToTime}
              showSeconds={showSeconds}
              placeholder="End time"
            />
          </div>
        </div>

        <div className="flex justify-end border-t p-3">
          <Button size="sm" onClick={() => setOpen(false)}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimeRangePicker }
