import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const itemVariants = cva(
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        active: 'bg-accent text-accent-foreground',
        ghost: 'hover:bg-transparent hover:underline',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface ItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  icon?: React.ReactNode
  label: string
  description?: string
  action?: React.ReactNode
  disabled?: boolean
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, variant, icon, label, description, action, disabled, ...props }, ref) => (
    <div
      ref={ref}
      role="listitem"
      aria-disabled={disabled}
      className={cn(
        itemVariants({ variant }),
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-none">{label}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground truncate">{description}</p>}
      </div>
      {action && <span className="shrink-0">{action}</span>}
    </div>
  ),
)
Item.displayName = 'Item'

export { Item }
