import * as React from 'react'
import { useState } from 'react'
import { format, setMonth, setYear } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/Ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/Ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Ui/select'

interface DobDatePickerProps {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function DobDatePicker({
  value,
  onValueChange,
  placeholder = 'Select date of birth',
  disabled = false,
  className,
}: DobDatePickerProps) {
  const today = new Date()
  const startYear = 1900
  const endYear = today.getFullYear()

  const [month, setMonthState] = useState<Date>(
    value || new Date(endYear - 25, 0, 1)
  )
  const [open, setOpen] = useState(false)

  const years = React.useMemo(() => {
    const arr: number[] = []
    for (let y = endYear; y >= startYear; y--) {
      arr.push(y)
    }
    return arr
  }, [endYear])

  const handleMonthChange = (monthIndex: string) => {
    const updated = setMonth(month, parseInt(monthIndex))
    setMonthState(updated)
  }

  const handleYearChange = (year: string) => {
    const updated = setYear(month, parseInt(year))
    setMonthState(updated)
  }

  const handleSelect = (date: Date | undefined) => {
    onValueChange?.(date)
    if (date) {
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'dd MMM yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Month & Year Dropdowns */}
          <div className="flex items-center gap-2 mb-3">
            <Select
              value={month.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-8 flex-1 text-sm">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={month.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-8 w-[90px] text-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calendar */}
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonthState}
            toDate={today}
            fromYear={startYear}
            toYear={endYear}
            showOutsideDays
            className={cn('!p-0')}
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption: 'flex justify-center pt-1 relative items-center',
              caption_label: 'text-sm font-medium hidden',
              nav: 'space-x-1 flex items-center',
              nav_button: cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
              ),
              nav_button_previous: 'absolute left-0',
              nav_button_next: 'absolute right-0',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
              row: 'flex w-full mt-2',
              cell: cn(
                'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md',
              ),
              day: cn(
                buttonVariants({ variant: 'ghost' }),
                'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
              ),
              day_selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
              day_outside:
                'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
              day_disabled: 'text-muted-foreground opacity-50',
              day_hidden: 'invisible',
            }}
            components={{
              IconLeft: () => <ChevronLeft className="h-4 w-4" />,
              IconRight: () => <ChevronRight className="h-4 w-4" />,
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DobDatePicker }
