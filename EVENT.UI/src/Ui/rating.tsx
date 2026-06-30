import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
  onChange?: (value: number) => void
  showCount?: number
  className?: string
}

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

function Rating({
  value,
  max = 5,
  size = 'md',
  readOnly = true,
  onChange,
  showCount,
  className,
}: RatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)

  const displayed = hovered ?? value

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1
          const filled = starValue <= displayed
          const halfFilled = !filled && starValue - 0.5 <= displayed

          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => !readOnly && setHovered(starValue)}
              onMouseLeave={() => !readOnly && setHovered(null)}
              className={cn(
                'transition-transform',
                !readOnly && 'cursor-pointer hover:scale-110',
                readOnly && 'cursor-default',
              )}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  sizeMap[size],
                  'transition-colors',
                  filled || halfFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted-foreground/30',
                )}
              />
            </button>
          )
        })}
      </div>
      {showCount !== undefined && (
        <span className={cn('text-muted-foreground', textSizeMap[size])}>
          ({showCount.toLocaleString()})
        </span>
      )}
    </div>
  )
}

Rating.displayName = 'Rating'

export { Rating }
export type { RatingProps }
