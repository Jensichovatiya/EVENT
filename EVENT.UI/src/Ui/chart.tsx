import * as React from 'react'
import {
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from 'recharts'
import { cn } from '@/lib/utils'

export interface ChartConfig {
  [key: string]: {
    label?: string
    color?: string
    icon?: React.ComponentType
  }
}

interface ChartContextProps {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error('useChart must be used within a <ChartContainer />')
  return context
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactElement
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={chartId}
          ref={ref}
          className={cn(
            "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
            className,
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  },
)
ChartContainer.displayName = 'ChartContainer'

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.color)
  if (!colorConfig.length) return null
  return (
    <style>{`[data-chart=${id}] { ${colorConfig.map(([key, cfg]) => `--color-${key}: ${cfg.color};`).join('\n')} }`}</style>
  )
}

const ChartTooltip = Tooltip

interface ChartTooltipContentProps extends Omit<TooltipProps<any, any>, 'content'> {
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: 'line' | 'dot' | 'dashed'
  nameKey?: string
  labelKey?: string
  className?: string
  formatter?: (value: any, name: any) => React.ReactNode
  labelFormatter?: (label: any) => React.ReactNode
  payload?: any[]
  label?: any
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      formatter,
      nameKey,
    },
    ref,
  ) => {
    const { config } = useChart()

    if (!active || !payload?.length) return null

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}
      >
        {!hideLabel && (
          <div className="font-medium text-foreground">
            {labelFormatter ? labelFormatter(String(label)) : label}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = nameKey ?? item.name ?? item.dataKey ?? 'value'
            const itemConfig = config[String(key)]
            const indicatorColor = item.color ?? itemConfig?.color

            return (
              <div
                key={index}
                className={cn('flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground')}
              >
                {!hideIndicator && (
                  <div
                    className={cn('shrink-0 rounded-[2px]', {
                      'h-2.5 w-2.5 mt-0.5': indicator === 'dot',
                      'w-1': indicator === 'line',
                      'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                    })}
                    style={{ background: indicatorColor, borderColor: indicatorColor }}
                  />
                )}
                <div className="flex flex-1 justify-between leading-none">
                  <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
                  {item.value !== undefined && (
                    <span className="font-mono font-medium tabular-nums text-foreground ml-2">
                      {formatter
                        ? formatter(Number(item.value), String(item.name))
                        : item.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = 'ChartTooltipContent'

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { payload?: Array<{ value: string; color: string }> }
>(({ className, payload }, ref) => {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <div ref={ref} className={cn('flex items-center justify-center gap-4', className)}>
      {payload.map((item) => {
        const cfg = config[item.value]
        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ background: item.color ?? cfg?.color }}
            />
            <span className="text-muted-foreground">{cfg?.label ?? item.value}</span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegend.displayName = 'ChartLegend'

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend }
