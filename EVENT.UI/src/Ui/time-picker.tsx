import * as React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/Ui/button'
import { Label } from '@/Ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/Ui/popover'
import { ScrollArea } from '@/Ui/scroll-area'

export interface TimeValue {
  hours: number
  minutes: number
  seconds?: number
}

interface TimePickerProps {
  value?: TimeValue
  onValueChange?: (value: TimeValue) => void
  showSeconds?: boolean
  use24Hour?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function TimePicker({
  value,
  onValueChange,
  showSeconds = false,
  use24Hour = false,
  placeholder = 'Pick a time',
  disabled = false,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internal, setInternal] = React.useState<TimeValue>({ hours: 12, minutes: 0, seconds: 0 })

  const current = value ?? internal

  const displayH = use24Hour
    ? current.hours
    : current.hours % 12 === 0
    ? 12
    : current.hours % 12

  const period = current.hours >= 12 ? 'PM' : 'AM'

  const handleChange = (patch: Partial<TimeValue>) => {
    const next = { ...current, ...patch }
    setInternal(next)
    onValueChange?.(next)
  }

  const handleHourSelect = (h: number) => {
    if (use24Hour) {
      handleChange({ hours: h })
    } else {
      // h is 1-12, convert to 0-23 based on current period
      const real =
        period === 'AM' ? (h === 12 ? 0 : h) : h === 12 ? 12 : h + 12
      handleChange({ hours: real })
    }
  }

  const handlePeriodToggle = (p: 'AM' | 'PM') => {
    if (p === period) return
    const newHours =
      p === 'AM'
        ? current.hours >= 12
          ? current.hours - 12
          : current.hours
        : current.hours < 12
        ? current.hours + 12
        : current.hours
    handleChange({ hours: newHours })
  }

  const displayValue = value
    ? `${pad(displayH)}:${pad(current.minutes)}${showSeconds ? `:${pad(current.seconds ?? 0)}` : ''}${!use24Hour ? ` ${period}` : ''}`
    : null

  const hours = use24Hour
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1)

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
          <Clock className="mr-2 h-4 w-4" />
          {displayValue ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-start gap-2">
          {/* Hours */}
          <div className="flex flex-col items-center gap-1">
            <Label className="text-xs text-muted-foreground">HH</Label>
            <ScrollArea className="h-44 w-14">
              <div className="flex flex-col gap-0.5 px-1">
                {hours.map((h) => {
                  const isSelected = use24Hour ? current.hours === h : displayH === h
                  return (
                    <button
                      key={h}
                      onClick={() => handleHourSelect(h)}
                      className={cn(
                        'flex h-8 w-full items-center justify-center rounded text-sm transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground',
                      )}
                    >
                      {pad(h)}
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <span className="mt-7 text-muted-foreground">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center gap-1">
            <Label className="text-xs text-muted-foreground">MM</Label>
            <ScrollArea className="h-44 w-14">
              <div className="flex flex-col gap-0.5 px-1">
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleChange({ minutes: m })}
                    className={cn(
                      'flex h-8 w-full items-center justify-center rounded text-sm transition-colors',
                      current.minutes === m
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    {pad(m)}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {showSeconds && (
            <>
              <span className="mt-7 text-muted-foreground">:</span>
              <div className="flex flex-col items-center gap-1">
                <Label className="text-xs text-muted-foreground">SS</Label>
                <ScrollArea className="h-44 w-14">
                  <div className="flex flex-col gap-0.5 px-1">
                    {Array.from({ length: 60 }, (_, i) => i).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleChange({ seconds: s })}
                        className={cn(
                          'flex h-8 w-full items-center justify-center rounded text-sm transition-colors',
                          (current.seconds ?? 0) === s
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        {pad(s)}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {!use24Hour && (
            <div className="mt-7 flex flex-col gap-1">
              {(['AM', 'PM'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodToggle(p)}
                  className={cn(
                    'flex h-8 w-12 items-center justify-center rounded text-sm transition-colors',
                    period === p
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { TimePicker }
