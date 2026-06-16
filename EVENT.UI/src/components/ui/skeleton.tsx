import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva('animate-pulse rounded-md bg-primary/10', {
  variants: {
    variant: {
      default: 'bg-primary/10',
      card: 'bg-muted',
      text: 'h-4 w-full bg-primary/10',
    },
  },
  defaultVariants: { variant: 'default' },
})

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return <div className={cn(skeletonVariants({ variant }), className)} {...props} />
}

export { Skeleton }
