import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/Ui/input'
import { Label } from '@/Ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/Ui/popover'

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#f43f5e', '#78716c', '#6b7280', '#475569',
  '#000000', '#ffffff', '#fef9c3', '#dcfce7', '#dbeafe',
]

interface ColorPickerProps {
  value?: string
  onValueChange?: (color: string) => void
  presets?: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

function isValidHex(hex: string) {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)
}

function ColorPicker({
  value = '#3b82f6',
  onValueChange,
  presets = PRESET_COLORS,
  placeholder = 'Pick a color',
  disabled = false,
  className,
}: ColorPickerProps) {
  const [hexInput, setHexInput] = React.useState(value)

  React.useEffect(() => {
    setHexInput(value)
  }, [value])

  const safeColor = isValidHex(value) ? value : '#3b82f6'

  const handleNative = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value)
    onValueChange?.(e.target.value)
  }

  const handleHexInput = (raw: string) => {
    setHexInput(raw)
    if (isValidHex(raw)) onValueChange?.(raw)
  }

  const handlePreset = (color: string) => {
    setHexInput(color)
    onValueChange?.(color)
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            'flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
            className,
          )}
          disabled={disabled}
        >
          <span
            className="h-4 w-4 shrink-0 rounded border border-input"
            style={{ backgroundColor: safeColor }}
          />
          <span className="font-mono text-xs uppercase">{value || placeholder}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3" align="start">
        {/* Native color + hex input row */}
        <div className="flex items-end gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Color</Label>
            <input
              type="color"
              value={safeColor}
              onChange={handleNative}
              className="h-9 w-9 cursor-pointer rounded border border-input bg-transparent p-0.5"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Hex</Label>
            <Input
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              className="mt-1 h-9 font-mono text-xs uppercase"
              maxLength={7}
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Preset swatches */}
        <Label className="text-xs text-muted-foreground">Presets</Label>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePreset(color)}
              title={color}
              className={cn(
                'h-7 w-full rounded border border-input transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                value === color && 'ring-2 ring-primary ring-offset-1',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { ColorPicker }
