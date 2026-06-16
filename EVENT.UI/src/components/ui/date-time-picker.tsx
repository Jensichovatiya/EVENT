import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { TimePicker, type TimeValue } from '@/components/ui/time-picker'

export interface DateTimeValue {
  date?: Date
  time?: TimeValue
}

interface DateTimePickerProps {
  value?: DateTimeValue
  onValueChange?: (value: DateTimeValue | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showSeconds?: boolean
  use24Hour?: boolean
  dateFormat?: string
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function DateTimePicker({
  value,
  onValueChange,
  placeholder = 'Pick date & time',
  disabled = false,
  className,
  showSeconds = false,
  use24Hour = false,
  dateFormat = 'LLL dd, y',
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    onValueChange?.({ ...value, date })
  }

  const handleTimeChange = (time: TimeValue) => {
    onValueChange?.({ ...value, time })
  }

  const fmtTime = (t: TimeValue) => {
    if (use24Hour) {
      return `${pad2(t.hours)}:${pad2(t.minutes)}${showSeconds ? `:${pad2(t.seconds ?? 0)}` : ''}`
    }
    const h = t.hours % 12 === 0 ? 12 : t.hours % 12
    const period = t.hours >= 12 ? 'PM' : 'AM'
    return `${pad2(h)}:${pad2(t.minutes)}${showSeconds ? `:${pad2(t.seconds ?? 0)}` : ''} ${period}`
  }

  const displayValue = value?.date
    ? `${format(value.date, dateFormat)}${value.time ? `, ${fmtTime(value.time)}` : ''}`
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
          mode="single"
          selected={value?.date}
          onSelect={handleDateSelect}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={new Date().getFullYear() - 80}
          toYear={new Date().getFullYear() + 5}
          defaultMonth={value?.date}
        />

        <Separator />

        <div className="p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Time</p>
          <TimePicker
            value={value?.time}
            onValueChange={handleTimeChange}
            showSeconds={showSeconds}
            use24Hour={use24Hour}
            placeholder="Pick a time"
          />
        </div>

        <div className="flex justify-end border-t p-3 pt-2">
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
