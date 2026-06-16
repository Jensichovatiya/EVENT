import * as React from 'react'
import {
  addDays, addWeeks, addMonths, addQuarters,
  subDays, subWeeks, subMonths, subQuarters,
  startOfDay, startOfWeek, startOfMonth, startOfQuarter,
  format, isToday, isWeekend,
} from 'date-fns'
import { ChevronDown, ChevronRight, ChevronLeft, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TimelineItem {
  id: string
  label: string
  startDate?: Date
  endDate?: Date
  /** Hex or Tailwind-friendly CSS color for the bar */
  color?: string
  subtitle?: string
}

export interface TimelineGroup {
  id: string
  label: string
  color?: string
  items: TimelineItem[]
}

export type TimelineViewMode = 'day' | 'week' | 'month' | 'quarter'

export interface TimelineProps {
  groups: TimelineGroup[]
  defaultViewMode?: TimelineViewMode
  /** Controlled view mode */
  viewMode?: TimelineViewMode
  onViewModeChange?: (mode: TimelineViewMode) => void
  /** Called when a bar is moved or resized */
  onItemChange?: (itemId: string, groupId: string, start: Date, end: Date) => void
  className?: string
}

// ── Config ─────────────────────────────────────────────────────────────────────

const SIDEBAR_W = 220  // px — fixed left sidebar width
const ROW_H     = 44   // px — height of every row
const HEADER_H  = 56   // px — height of the two-row date header
const HANDLE_W  = 6    // px — resize handle width

interface ViewCfg {
  colW: number    // px per column
  cols: number    // total columns rendered
  pre:  number    // columns before the anchor date
  unitMs: number  // milliseconds per column
  label: string
}

const VIEW_CFG: Record<TimelineViewMode, ViewCfg> = {
  day:     { colW: 36,  cols: 90, pre: 14, unitMs: 86_400_000,             label: 'Day'     },
  week:    { colW: 80,  cols: 26, pre: 4,  unitMs: 7 * 86_400_000,         label: 'Week'    },
  month:   { colW: 110, cols: 18, pre: 3,  unitMs: 30.4375 * 86_400_000,   label: 'Month'   },
  quarter: { colW: 180, cols: 8,  pre: 1,  unitMs: 91.3125 * 86_400_000,   label: 'Quarter' },
}

const DEFAULT_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316',
]

// ── Pure helpers ───────────────────────────────────────────────────────────────

function viewStart(anchor: Date, mode: TimelineViewMode): Date {
  const pre = VIEW_CFG[mode].pre
  switch (mode) {
    case 'day':     return startOfDay(subDays(anchor, pre))
    case 'week':    return startOfWeek(subWeeks(anchor, pre), { weekStartsOn: 1 })
    case 'month':   return startOfMonth(subMonths(anchor, pre))
    case 'quarter': return startOfQuarter(subQuarters(anchor, pre))
  }
}

function colDate(vs: Date, i: number, mode: TimelineViewMode): Date {
  switch (mode) {
    case 'day':     return addDays(vs, i)
    case 'week':    return addWeeks(vs, i)
    case 'month':   return addMonths(vs, i)
    case 'quarter': return addQuarters(vs, i)
  }
}

function toPx(date: Date, vs: Date, mode: TimelineViewMode): number {
  const { colW, unitMs } = VIEW_CFG[mode]
  return ((date.getTime() - vs.getTime()) / unitMs) * colW
}

function dxToMs(dx: number, mode: TimelineViewMode): number {
  const { colW, unitMs } = VIEW_CFG[mode]
  return (dx / colW) * unitMs
}

function colTopLabel(date: Date, mode: TimelineViewMode): string {
  switch (mode) {
    case 'day':
    case 'week':    return format(date, 'MMM yyyy')
    case 'month':   return format(date, 'yyyy')
    case 'quarter': return format(date, 'yyyy')
  }
}

function colBotLabel(date: Date, mode: TimelineViewMode): string {
  switch (mode) {
    case 'day':     return format(date, 'd')
    case 'week':    return 'W' + format(date, 'w')
    case 'month':   return format(date, 'MMM')
    case 'quarter': return 'Q' + (Math.floor(date.getMonth() / 3) + 1)
  }
}

function isTodayCol(date: Date, mode: TimelineViewMode): boolean {
  const now = new Date()
  switch (mode) {
    case 'day':     return isToday(date)
    case 'week':    return now >= date && now < addWeeks(date, 1)
    case 'month':   return now >= date && now < addMonths(date, 1)
    case 'quarter': return now >= date && now < addQuarters(date, 1)
  }
}

function navigate(anchor: Date, dir: 1 | -1, mode: TimelineViewMode): Date {
  const step = dir
  switch (mode) {
    case 'day':     return addDays(anchor, step * 14)
    case 'week':    return addWeeks(anchor, step * 4)
    case 'month':   return addMonths(anchor, step * 3)
    case 'quarter': return addQuarters(anchor, step * 2)
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

export function Timeline({
  groups,
  defaultViewMode = 'month',
  viewMode: controlledMode,
  onViewModeChange,
  onItemChange,
  className,
}: TimelineProps) {

  const [internalMode, setInternalMode] = React.useState<TimelineViewMode>(defaultViewMode)
  const mode = controlledMode ?? internalMode

  const [anchor, setAnchor] = React.useState(() => new Date())
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  /** Per-item date overrides while dragging (or after, when uncontrolled) */
  const [overrides, setOverrides] = React.useState<Map<string, { start: Date; end: Date }>>(new Map())

  const scrollRef   = React.useRef<HTMLDivElement>(null)
  const modeRef     = React.useRef(mode)
  const cbRef       = React.useRef(onItemChange)
  modeRef.current   = mode
  cbRef.current     = onItemChange

  const vs        = viewStart(anchor, mode)
  const cfg       = VIEW_CFG[mode]
  const totalW    = cfg.cols * cfg.colW
  const todayPx   = toPx(new Date(), vs, mode)

  const columns = React.useMemo(
    () => Array.from({ length: cfg.cols }, (_, i) => colDate(vs, i, mode)),
    [vs, mode, cfg.cols],
  )

  // Build grouped top-header spans
  const topSpans = React.useMemo(() => {
    const spans: Array<{ label: string; width: number; left: number }> = []
    let cur = '', curLeft = 0, curW = 0
    columns.forEach((date, i) => {
      const lbl = colTopLabel(date, mode)
      if (lbl !== cur) {
        if (cur) spans.push({ label: cur, width: curW, left: curLeft })
        cur = lbl; curLeft = i * cfg.colW; curW = 0
      }
      curW += cfg.colW
    })
    if (cur) spans.push({ label: cur, width: curW, left: curLeft })
    return spans
  }, [columns, mode, cfg.colW])

  // Scroll to today on mount / mode change
  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = Math.max(0, todayPx - el.clientWidth / 3)
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag ────────────────────────────────────────────────────────────────────

  interface DragState {
    type: 'move' | 'resize-left' | 'resize-right'
    itemId: string; groupId: string
    startX: number; origStart: Date; origEnd: Date
  }
  const drag = React.useRef<DragState | null>(null)

  const startDrag = React.useCallback((
    e: React.MouseEvent,
    type: DragState['type'],
    itemId: string, groupId: string,
    origStart: Date, origEnd: Date,
  ) => {
    e.preventDefault(); e.stopPropagation()
    drag.current = { type, itemId, groupId, startX: e.clientX, origStart, origEnd }
  }, [])

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = drag.current; if (!d) return
      const dMs = dxToMs(e.clientX - d.startX, modeRef.current)
      let ns = d.origStart, ne = d.origEnd
      if (d.type === 'move') {
        ns = new Date(d.origStart.getTime() + dMs)
        ne = new Date(d.origEnd.getTime() + dMs)
      } else if (d.type === 'resize-right') {
        ne = new Date(d.origEnd.getTime() + dMs)
        if (ne <= ns) ne = addDays(ns, 1)
      } else {
        ns = new Date(d.origStart.getTime() + dMs)
        if (ns >= ne) ns = subDays(ne, 1)
      }
      setOverrides(prev => new Map(prev).set(d.itemId, { start: ns, end: ne }))
    }

    const onUp = () => {
      const d = drag.current; if (!d) return
      drag.current = null
      setOverrides(prev => {
        const cur = prev.get(d.itemId)
        if (cur && cbRef.current) {
          cbRef.current(d.itemId, d.groupId, cur.start, cur.end)
          // If parent controls dates, clear local override (parent will re-render)
          const next = new Map(prev); next.delete(d.itemId); return next
        }
        return prev
      })
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const setMode = (m: TimelineViewMode) => {
    setInternalMode(m); onViewModeChange?.(m)
  }

  const getItemDates = (item: TimelineItem) =>
    overrides.get(item.id) ?? { start: item.startDate, end: item.endDate }

  const toggleGroup = (id: string) =>
    setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className={cn('flex flex-col rounded-lg border bg-background', className)}>

      {/* ── Toolbar ── */}
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5">
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold">Timeline</span>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Navigation */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAnchor(d => navigate(d, -1, mode))}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAnchor(d => navigate(d, 1, mode))}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <div className="mx-1 h-4 w-px bg-border" />

          {/* View mode buttons */}
          {(['day', 'week', 'month', 'quarter'] as const).map(m => (
            <Button
              key={m}
              variant={mode === m ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs capitalize"
              onClick={() => setMode(m)}
            >
              {VIEW_CFG[m].label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Scrollable timeline ── */}
      <div ref={scrollRef} className="relative flex-1 overflow-auto" style={{ minHeight: 200 }}>
        <div style={{ width: SIDEBAR_W + totalW, minWidth: '100%' }}>

          {/* ── Date header (sticky top) ── */}
          <div
            className="sticky top-0 z-20 flex border-b bg-background"
            style={{ height: HEADER_H }}
          >
            {/* Corner cell */}
            <div
              className="sticky left-0 z-30 flex shrink-0 items-end border-r bg-muted/40 px-3 pb-1.5"
              style={{ width: SIDEBAR_W }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Items
              </span>
            </div>

            {/* Column header area */}
            <div className="relative flex-1" style={{ width: totalW }}>
              {/* Top row — grouped month/year spans */}
              <div className="absolute inset-x-0 top-0 flex border-b" style={{ height: HEADER_H / 2 }}>
                {topSpans.map((s, i) => (
                  <div
                    key={i}
                    className="shrink-0 overflow-hidden border-r px-2 text-[10px] font-semibold leading-none flex items-center text-muted-foreground"
                    style={{ width: s.width }}
                  >
                    {s.label}
                  </div>
                ))}
              </div>

              {/* Bottom row — individual column labels */}
              <div className="absolute inset-x-0 bottom-0 flex" style={{ height: HEADER_H / 2 }}>
                {columns.map((date, i) => {
                  const isT = isTodayCol(date, mode)
                  const isWE = mode === 'day' && isWeekend(date)
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex shrink-0 items-center justify-center border-r text-[10px] font-medium',
                        isT
                          ? 'bg-primary/10 text-primary font-semibold'
                          : isWE
                          ? 'bg-muted/60 text-muted-foreground/60'
                          : 'text-muted-foreground',
                      )}
                      style={{ width: cfg.colW }}
                    >
                      {colBotLabel(date, mode)}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Today vertical line (runs through entire body) ── */}
          {todayPx >= 0 && todayPx <= totalW && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-0.5 bg-primary/40"
              style={{ left: SIDEBAR_W + todayPx, height: '100%' }}
            />
          )}

          {/* ── Groups ── */}
          {groups.map((group, gIdx) => {
            const isCollapsed = collapsed.has(group.id)
            const color = group.color ?? DEFAULT_COLORS[gIdx % DEFAULT_COLORS.length]
            const doneCount = group.items.filter(item => {
              const d = getItemDates(item)
              return d.end && d.end < new Date()
            }).length

            return (
              <React.Fragment key={group.id}>
                {/* Group header row */}
                <div
                  className="flex cursor-pointer items-stretch border-b bg-muted/20 hover:bg-muted/40 transition-colors"
                  style={{ height: ROW_H }}
                  onClick={() => toggleGroup(group.id)}
                >
                  {/* Sidebar */}
                  <div
                    className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r bg-muted/20 px-3 hover:bg-muted/40"
                    style={{ width: SIDEBAR_W }}
                  >
                    <div className="h-3 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <button className="flex items-center gap-1.5 min-w-0 flex-1">
                      {isCollapsed
                        ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        : <ChevronDown  className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      }
                      <span className="truncate text-xs font-semibold">{group.label}</span>
                    </button>
                    <Badge variant="outline" className="h-4 shrink-0 px-1 text-[9px] font-normal">
                      {doneCount}/{group.items.length}
                    </Badge>
                  </div>

                  {/* Group timeline row — show a summary bar if collapsed */}
                  <div className="relative" style={{ width: totalW }}>
                    {/* Column zebra */}
                    {columns.map((date, i) => (
                      <div
                        key={i}
                        className={cn(
                          'absolute top-0 bottom-0',
                          isTodayCol(date, mode) && 'bg-primary/5',
                          mode === 'day' && isWeekend(date) && 'bg-muted/40',
                        )}
                        style={{ left: i * cfg.colW, width: cfg.colW }}
                      />
                    ))}
                    {/* If collapsed, show a thin summary bar spanning all items */}
                    {isCollapsed && (() => {
                      const dated = group.items.filter(it => it.startDate && it.endDate)
                      if (!dated.length) return null
                      const minStart = dated.reduce((m, it) => it.startDate! < m ? it.startDate! : m, dated[0].startDate!)
                      const maxEnd   = dated.reduce((m, it) => it.endDate!   > m ? it.endDate!   : m, dated[0].endDate!)
                      const left  = toPx(minStart, vs, mode)
                      const width = Math.max(toPx(maxEnd, vs, mode) - left, cfg.colW / 4)
                      return (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full opacity-60"
                          style={{ left, width, backgroundColor: color }}
                        />
                      )
                    })()}
                  </div>
                </div>

                {/* Item rows */}
                {!isCollapsed && group.items.map((item) => {
                  const { start, end } = getItemDates(item)
                  const itemColor = item.color ?? color
                  const hasDate = !!(start && end)
                  const barLeft  = hasDate ? toPx(start!, vs, mode) : 0
                  const barWidth = hasDate
                    ? Math.max(toPx(end!, vs, mode) - barLeft, cfg.colW / 3)
                    : 0
                  const isDraggingThis = drag.current?.itemId === item.id

                  return (
                    <div
                      key={item.id}
                      className="flex items-stretch border-b transition-colors hover:bg-accent/10"
                      style={{ height: ROW_H }}
                    >
                      {/* Sidebar */}
                      <div
                        className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r bg-background px-3 pl-8 hover:bg-accent/10"
                        style={{ width: SIDEBAR_W }}
                      >
                        <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: itemColor }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium leading-tight">{item.label}</p>
                          {item.subtitle && (
                            <p className="truncate text-[10px] text-muted-foreground leading-tight">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      {/* Timeline cell */}
                      <div className="relative" style={{ width: totalW }}>
                        {/* Column zebra */}
                        {columns.map((date, i) => (
                          <div
                            key={i}
                            className={cn(
                              'absolute top-0 bottom-0',
                              isTodayCol(date, mode) && 'bg-primary/5',
                              mode === 'day' && isWeekend(date) && 'bg-muted/30',
                            )}
                            style={{ left: i * cfg.colW, width: cfg.colW }}
                          />
                        ))}

                        {hasDate ? (
                          /* ── Filled bar ── */
                          <div
                            className={cn(
                              'absolute top-1/2 -translate-y-1/2 h-7 rounded-full',
                              'flex items-center overflow-hidden select-none',
                              isDraggingThis ? 'cursor-grabbing opacity-80 shadow-lg' : 'cursor-grab',
                              'transition-shadow hover:shadow-md',
                            )}
                            style={{
                              left: barLeft,
                              width: barWidth,
                              backgroundColor: itemColor,
                            }}
                            title={`${item.label}\n${format(start!, 'MMM d, yyyy')} – ${format(end!, 'MMM d, yyyy')}`}
                            onMouseDown={(e) => startDrag(e, 'move', item.id, group.id, start!, end!)}
                          >
                            {/* Left resize handle */}
                            <div
                              className="absolute left-0 top-0 h-full cursor-ew-resize rounded-l-full bg-black/20 hover:bg-black/30 transition-colors"
                              style={{ width: HANDLE_W }}
                              onMouseDown={(e) => startDrag(e, 'resize-left', item.id, group.id, start!, end!)}
                            />

                            {/* Label — only when bar is wide enough */}
                            {barWidth > 60 && (
                              <span className="pointer-events-none flex-1 truncate px-3 text-[11px] font-medium text-white">
                                {item.label}
                              </span>
                            )}

                            {/* Right resize handle */}
                            <div
                              className="absolute right-0 top-0 h-full cursor-ew-resize rounded-r-full bg-black/20 hover:bg-black/30 transition-colors"
                              style={{ width: HANDLE_W }}
                              onMouseDown={(e) => startDrag(e, 'resize-right', item.id, group.id, start!, end!)}
                            />
                          </div>
                        ) : (
                          /* ── No-date placeholder ── */
                          <div
                            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-muted-foreground/60"
                          >
                            <div className="h-0.5 w-8 rounded-full border border-dashed border-muted-foreground/30" />
                            No dates
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            )
          })}

          {/* Empty state */}
          {groups.length === 0 && (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No groups to display
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

Timeline.displayName = 'Timeline'
