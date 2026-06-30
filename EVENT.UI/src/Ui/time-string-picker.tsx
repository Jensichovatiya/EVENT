import * as React from 'react'
import { TimePicker, type TimeValue } from '@/Ui/time-picker'

interface TimeStringPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  use24Hour?: boolean
  showSeconds?: boolean
  className?: string
}

function pad(n: number): string { return String(n).padStart(2, '0') }

function parseHm(s: string | undefined): TimeValue | undefined {
  if (!s) return undefined
  const parts = s.split(':').map(Number)
  const h = parts[0]
  const m = parts[1] ?? 0
  if (!Number.isFinite(h) || !Number.isFinite(m)) return undefined
  return { hours: Math.max(0, Math.min(23, h)), minutes: Math.max(0, Math.min(59, m)) }
}

function formatHm(v: TimeValue): string {
  return `${pad(v.hours)}:${pad(v.minutes)}`
}

/**
 * Adapter that exposes the project's TimePicker with a plain "HH:mm" string
 * value — the format that most form state in this app already uses.
 */
export function TimeStringPicker({
  value, onChange, disabled, placeholder, use24Hour = true, showSeconds = false, className,
}: TimeStringPickerProps) {
  return (
    <TimePicker
      value={parseHm(value)}
      onValueChange={(v) => onChange(formatHm(v))}
      disabled={disabled}
      placeholder={placeholder}
      use24Hour={use24Hour}
      showSeconds={showSeconds}
      className={className}
    />
  )
}
