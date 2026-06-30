import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child)]:-ml-px',
        className,
      )}
      {...props}
    />
  ),
)
InputGroup.displayName = 'InputGroup'

interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'left' | 'right'
}

const InputAddon = React.forwardRef<HTMLDivElement, InputAddonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center border border-input bg-muted px-3 text-sm text-muted-foreground',
        className,
      )}
      {...props}
    />
  ),
)
InputAddon.displayName = 'InputAddon'

export { InputGroup, InputAddon }
