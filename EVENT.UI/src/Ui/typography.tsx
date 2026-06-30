import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const headingVariants = cva('font-bold tracking-tight text-foreground', {
  variants: {
    size: {
      h1: 'text-4xl lg:text-5xl',
      h2: 'text-3xl lg:text-4xl',
      h3: 'text-2xl lg:text-3xl',
      h4: 'text-xl lg:text-2xl',
      h5: 'text-lg lg:text-xl',
      h6: 'text-base lg:text-lg',
    },
  },
  defaultVariants: { size: 'h2' },
})

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, size, as, ...props }, ref) => {
    const Tag = as ?? (size as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') ?? 'h2'
    return <Tag ref={ref} className={cn(headingVariants({ size }), className)} {...props} />
  },
)
Heading.displayName = 'Heading'

const textVariants = cva('text-foreground', {
  variants: {
    variant: {
      default: 'text-base',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      code: 'font-mono text-sm bg-muted rounded px-1 py-0.5',
    },
  },
  defaultVariants: { variant: 'default' },
})

interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div'
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, as = 'p', ...props }, ref) => {
    const Tag = as
    return <Tag ref={ref} className={cn(textVariants({ variant }), className)} {...props} />
  },
)
Text.displayName = 'Text'

export { Heading, Text }
