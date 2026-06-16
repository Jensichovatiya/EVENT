import * as React from 'react'
import { format, setMonth, setYear } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, type Matcher } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// ── Months / Year helpers ───────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function range(start: number, end: number) {
  const arr: number[] = []
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
}

// ── DOB Calendar with styled month/year dropdowns ───────────────────────────

interface DobCalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  fromYear: number
  toYear: number
  disabled?: Matcher | Matcher[]
}

function DobCalendar({ selected, onSelect, fromYear, toYear, disabled }: DobCalendarProps) {
  const [month, setDisplayMonth] = React.useState<Date>(selected || new Date())

  const years = React.useMemo(() => range(fromYear, toYear).reverse(), [fromYear, toYear])

  return (
    <div className="p-3">
      {/* Month / Year selectors */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Select
            value={month.getMonth().toString()}
            onValueChange={(val) => setDisplayMonth(prev => setMonth(prev, parseInt(val)))}
          >
            <SelectTrigger className="h-8 text-xs font-medium flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={i.toString()} className="text-xs">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={month.getFullYear().toString()}
            onValueChange={(val) => setDisplayMonth(prev => setYear(prev, parseInt(val)))}
          >
            <SelectTrigger className="h-8 text-xs font-medium w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {years.map(y => (
                <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day grid */}
      <DayPicker
        mode="single"
        month={month}
        onMonthChange={setDisplayMonth}
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        showOutsideDays
        classNames={{
          months: 'flex flex-col',
          month: 'space-y-2',
          caption: 'hidden',
          nav: 'hidden',
          table: 'w-full border-collapse',
          head_row: 'flex',
          head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
          row: 'flex w-full mt-1',
          cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md',
          day: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
          ),
          day_selected:
            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          day_today: 'bg-accent text-accent-foreground',
          day_outside: 'text-muted-foreground opacity-50',
          day_disabled: 'text-muted-foreground opacity-50',
          day_hidden: 'invisible',
        }}
      />
    </div>
  )
}

// ── Standard Calendar (no dropdowns) ────────────────────────────────────────

import { Calendar } from '@/components/ui/calendar'

// ── DatePicker ──────────────────────────────────────────────────────────────

interface DatePickerProps {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  formatStr?: string
  /** Show styled month/year dropdown selectors for quick navigation (useful for DOB) */
  showMonthYearDropdown?: boolean
  /** Earliest selectable year when using month/year dropdowns */
  fromYear?: number
  /** Latest selectable year when using month/year dropdowns */
  toYear?: number
  /** Days to disable (react-day-picker matcher), e.g. {`{ after: new Date() }`} to block future dates */
  disabledDates?: Matcher | Matcher[]
}

function DatePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  formatStr = 'dd MMM yyyy',
  // Month + year dropdowns are the default app-wide. Callers can still opt out
  // with `showMonthYearDropdown={false}` if they want a plain calendar.
  showMonthYearDropdown = true,
  // Sensible range that covers both historical (DOB) and forward-planning
  // (deadlines, milestones) without forcing every caller to specify it.
  // Pages that need a wider DOB range pass `fromYear={1950}` explicitly.
  fromYear = new Date().getFullYear() - 80,
  toYear,
  disabledDates,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const resolvedToYear = toYear ?? new Date().getFullYear() + 5

  const handleSelect = (date: Date | undefined) => {
    onValueChange?.(date)
    if (!showMonthYearDropdown) setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-9',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {value ? format(value, formatStr) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {showMonthYearDropdown ? (
          <DobCalendar
            selected={value}
            onSelect={(d) => { handleSelect(d); if (d) setOpen(false) }}
            fromYear={fromYear}
            toYear={resolvedToYear}
            disabled={disabledDates}
          />
        ) : (
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={disabledDates}
            initialFocus
            defaultMonth={value}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
