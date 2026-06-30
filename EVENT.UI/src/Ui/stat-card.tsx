import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/Ui/card'
import { Badge } from '@/Ui/badge'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  className?: string
}

function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const trendVariant =
    trend === 'up' ? 'success' : trend === 'down' ? 'destructive' : 'secondary'

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
            {(change || description) && (
              <div className="mt-2 flex items-center gap-2">
                {change && (
                  <Badge variant={trendVariant} className="gap-1 px-1.5 py-0.5 text-[10px]">
                    <TrendIcon className="h-2.5 w-2.5" />
                    {change}
                  </Badge>
                )}
                {description && (
                  <span className="text-xs text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

StatCard.displayName = 'StatCard'

export { StatCard }
export type { StatCardProps }
