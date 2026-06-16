import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  label: string
  description?: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  className?: string
}

function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn('flex items-start', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isActive && 'border-primary bg-background text-primary ring-4 ring-primary/15',
                  !isCompleted && !isActive && 'border-muted-foreground/30 bg-background text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              {/* Label */}
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-xs font-medium',
                    isActive && 'text-foreground',
                    isCompleted && 'text-muted-foreground',
                    !isCompleted && !isActive && 'text-muted-foreground/60',
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'mx-2 mt-4 h-0.5 flex-1 transition-colors',
                  index < currentStep ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

Steps.displayName = 'Steps'

export { Steps }
export type { StepsProps, Step }
