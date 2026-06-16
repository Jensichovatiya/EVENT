import * as React from 'react'
import {
  format,
  startOfMonth,
  startOfWeek,
  eachDayOfInterval,
  addDays,
  addWeeks,
  addMonths,
  addHours,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  getHours,
  getMinutes,
  differenceInMinutes,
  startOfDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ── Constants ──────────────────────────────────────────────────────────────────

const HOUR_HEIGHT = 64 // px per hour in time grid
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const EVENT_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316',
]
const MONTH_EVENTS_LIMIT = 3

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  /** Unique identifier */
  id: string
  /** Display title */
  title: string
  /** Event start time */
  start: Date
  /** Event end time (defaults to start + 1 hour for timed events) */
  end?: Date
  /** CSS color string or hex (e.g. "#3b82f6" or "blue"). Falls back to a hash-based palette color. */
  color?: string
  /** If true the event spans the full day and appears in the all-day strip */
  allDay?: boolean
  /** Optional description shown in tooltips / detail views */
  description?: string
  /** Any extra fields are preserved and forwarded via onEventClick */
  [key: string]: unknown
}

export type CalendarView = 'day' | 'week' | 'weekday' | 'month'

export interface FullCalendarProps {
  /** Events to render */
  events?: CalendarEvent[]
  /** Initial view (uncontrolled) */
  defaultView?: CalendarView
  /** Controlled current view */
  view?: CalendarView
  /** Called when the user switches views */
  onViewChange?: (view: CalendarView) => void
  /** Initial date to show (uncontrolled) */
  initialDate?: Date
  /** Controlled current date */
  date?: Date
  /** Called when navigation changes the visible date */
  onDateChange?: (date: Date) => void
  /** Called when the user clicks an event chip */
  onEventClick?: (event: CalendarEvent, e: React.MouseEvent) => void
  /** Called when the user clicks an empty date cell */
  onDateClick?: (date: Date) => void
  /** Extra class applied to the outer container */
  className?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function colorFor(event: CalendarEvent): string {
  if (event.color) return event.color
  let h = 0
  for (let i = 0; i < event.id.length; i++) h = (h * 31 + event.id.charCodeAt(i)) & 0xffffffff
  return EVENT_COLORS[Math.abs(h) % EVENT_COLORS.length]
}

function getEventEnd(event: CalendarEvent): Date {
  return event.end ?? addHours(event.start, 1)
}

function getMonthGridDays(date: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(date))
  return eachDayOfInterval({ start: gridStart, end: addDays(gridStart, 41) })
}

function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date)
  return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })
}

function getWeekdayDays(date: Date): Date[] {
  const weekStart = startOfWeek(date)
  return eachDayOfInterval({ start: addDays(weekStart, 1), end: addDays(weekStart, 5) })
}

function eventsOnDay(day: Date, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((e) => {
    if (e.allDay) {
      const s = startOfDay(e.start)
      const end = e.end ? startOfDay(e.end) : s
      const d = startOfDay(day)
      return d >= s && d <= end
    }
    return isSameDay(e.start, day)
  })
}

// Greedy column-layout for overlapping timed events in a day column
interface LayoutedEvent {
  event: CalendarEvent
  col: number
  cols: number
}

function layoutTimedEvents(events: CalendarEvent[]): LayoutedEvent[] {
  if (!events.length) return []
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())
  const colEnds: number[] = []
  const placed: { event: CalendarEvent; col: number }[] = []

  for (const ev of sorted) {
    const evEnd = getEventEnd(ev).getTime()
    let col = colEnds.findIndex((end) => end <= ev.start.getTime())
    if (col === -1) {
      col = colEnds.length
      colEnds.push(evEnd)
    } else {
      colEnds[col] = evEnd
    }
    placed.push({ event: ev, col })
  }

  const cols = colEnds.length
  return placed.map(({ event, col }) => ({ event, col, cols }))
}

function hourLabel(h: number): string {
  if (h === 0) return ''
  const suffix = h < 12 ? 'am' : 'pm'
  const h12 = h === 12 ? 12 : h % 12
  return `${h12}${suffix}`
}

// ── MonthView ──────────────────────────────────────────────────────────────────

function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
}: {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick?: FullCalendarProps['onEventClick']
  onDateClick?: FullCalendarProps['onDateClick']
}) {
  const days = getMonthGridDays(currentDate)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Weekday labels */}
      <div className="grid shrink-0 grid-cols-7 border-b bg-muted/30">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid — 6 rows × 7 cols */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6 overflow-hidden">
        {days.map((day, i) => {
          const dayEvents = eventsOnDay(day, events)
          const overflow = Math.max(0, dayEvents.length - MONTH_EVENTS_LIMIT)
          const inMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={i}
              className={cn(
                'flex min-h-0 flex-col overflow-hidden border-r border-b p-1 transition-colors',
                !inMonth && 'bg-muted/20',
                i % 7 === 0 && 'border-l',
                'cursor-pointer hover:bg-accent/30',
              )}
              onClick={() => onDateClick?.(day)}
            >
              {/* Day number */}
              <div
                className={cn(
                  'mb-1 inline-flex h-6 w-6 shrink-0 items-center justify-center self-start rounded-full text-xs',
                  isToday(day) && 'bg-primary text-primary-foreground font-semibold',
                  !inMonth && !isToday(day) && 'text-muted-foreground',
                )}
              >
                {format(day, 'd')}
              </div>

              {/* Event chips */}
              <div className="min-h-0 flex-1 space-y-px overflow-hidden">
                {dayEvents.slice(0, MONTH_EVENTS_LIMIT).map((ev) => (
                  <button
                    key={ev.id}
                    className="flex w-full items-center gap-1 truncate rounded px-1 py-px text-left text-[11px] font-medium text-white"
                    style={{ backgroundColor: colorFor(ev) }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(ev, e)
                    }}
                  >
                    {!ev.allDay && (
                      <span className="shrink-0 opacity-80">{format(ev.start, 'h:mm')}</span>
                    )}
                    <span className="truncate">{ev.title}</span>
                  </button>
                ))}
                {overflow > 0 && (
                  <p className="px-1 text-[11px] text-muted-foreground">+{overflow} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── TimeGrid ───────────────────────────────────────────────────────────────────

function TimeGrid({
  days,
  events,
  onEventClick,
  onDateClick,
}: {
  days: Date[]
  events: CalendarEvent[]
  onEventClick?: FullCalendarProps['onEventClick']
  onDateClick?: FullCalendarProps['onDateClick']
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const now = new Date()
  const nowMinute = now.getHours() * 60 + now.getMinutes()
  const nowTop = nowMinute * (HOUR_HEIGHT / 60)

  // Scroll to ≈ 1 hour before current time on mount
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, (now.getHours() - 1) * HOUR_HEIGHT)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allDayEvents = events.filter((e) => e.allDay)
  const timedEvents = events.filter((e) => !e.allDay)
  const hasAllDay = allDayEvents.length > 0

  const allDayForDay = (day: Date) =>
    allDayEvents.filter((e) => {
      const s = startOfDay(e.start)
      const end = e.end ? startOfDay(e.end) : s
      const d = startOfDay(day)
      return d >= s && d <= end
    })

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Day header row */}
      <div className="flex shrink-0 border-b bg-muted/30">
        <div className="w-14 shrink-0" />
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-1 cursor-pointer flex-col items-center border-l py-2 transition-colors hover:bg-accent/30',
              isToday(day) && 'bg-primary/5',
            )}
            onClick={() => onDateClick?.(day)}
          >
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {format(day, 'EEE')}
            </span>
            <span
              className={cn(
                'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm',
                isToday(day)
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-foreground',
              )}
            >
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>

      {/* All-day event strip */}
      {hasAllDay && (
        <div className="flex shrink-0 border-b">
          <div className="w-14 shrink-0 pr-2 pt-1 text-right text-[10px] leading-5 text-muted-foreground">
            all‑day
          </div>
          {days.map((day, i) => (
            <div key={i} className="flex-1 border-l p-0.5 space-y-px">
              {allDayForDay(day).map((ev) => (
                <button
                  key={ev.id}
                  className="w-full truncate rounded px-1.5 py-px text-left text-xs font-medium text-white"
                  style={{ backgroundColor: colorFor(ev) }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick?.(ev, e)
                  }}
                >
                  {ev.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Scrollable 24-hour grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {/* Hour labels */}
          <div className="relative w-14 shrink-0">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] leading-none text-muted-foreground select-none"
                style={{ top: `${h * HOUR_HEIGHT - 5}px` }}
              >
                {hourLabel(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => {
            const dayTimed = timedEvents.filter((e) => isSameDay(e.start, day))
            const laid = layoutTimedEvents(dayTimed)
            const showNowLine = isToday(day)

            return (
              <div
                key={di}
                className="relative flex-1 cursor-pointer border-l"
                onClick={() => onDateClick?.(day)}
              >
                {/* Full-hour grid lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="pointer-events-none absolute left-0 right-0 border-t border-border/40"
                    style={{ top: `${h * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Half-hour dashed lines */}
                {HOURS.map((h) => (
                  <div
                    key={`${h}h`}
                    className="pointer-events-none absolute left-0 right-0 border-t border-border/20 border-dashed"
                    style={{ top: `${h * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
                  />
                ))}

                {/* Current-time indicator */}
                {showNowLine && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                    style={{ top: `${nowTop}px` }}
                  >
                    <span className="-ml-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                    <span className="h-px flex-1 bg-red-500" />
                  </div>
                )}

                {/* Timed event blocks */}
                {laid.map(({ event, col, cols }) => {
                  const startMin = getHours(event.start) * 60 + getMinutes(event.start)
                  const evEnd = getEventEnd(event)
                  const duration = Math.max(differenceInMinutes(evEnd, event.start), 30)
                  const top = startMin * (HOUR_HEIGHT / 60)
                  const height = duration * (HOUR_HEIGHT / 60)
                  const wPct = 100 / cols - 1
                  const lPct = col * (100 / cols)

                  return (
                    <button
                      key={event.id}
                      className="absolute overflow-hidden rounded px-1.5 py-0.5 text-left text-xs text-white shadow-sm"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `${lPct}%`,
                        width: `${wPct}%`,
                        backgroundColor: colorFor(event),
                        zIndex: 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event, e)
                      }}
                    >
                      <p className="truncate font-semibold leading-tight">{event.title}</p>
                      {height > 32 && (
                        <p className="truncate opacity-80 leading-tight">
                          {format(event.start, 'h:mma')}
                          {event.end ? `–${format(event.end, 'h:mma')}` : ''}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── FullCalendar ───────────────────────────────────────────────────────────────

const VIEW_OPTIONS: { key: CalendarView; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'weekday', label: 'Weekday' },
  { key: 'month', label: 'Month' },
]

export function FullCalendar({
  events = [],
  defaultView = 'month',
  view: controlledView,
  onViewChange,
  initialDate,
  date: controlledDate,
  onDateChange,
  onEventClick,
  onDateClick,
  className,
}: FullCalendarProps) {
  const [internalView, setInternalView] = React.useState<CalendarView>(defaultView)
  const [internalDate, setInternalDate] = React.useState<Date>(initialDate ?? new Date())

  const view = controlledView ?? internalView
  const currentDate = controlledDate ?? internalDate

  const setView = (v: CalendarView) => {
    if (controlledView === undefined) setInternalView(v)
    onViewChange?.(v)
  }

  const setDate = (d: Date) => {
    if (controlledDate === undefined) setInternalDate(d)
    onDateChange?.(d)
  }

  const handlePrev = () => {
    if (view === 'day') setDate(subDays(currentDate, 1))
    else if (view === 'month') setDate(subMonths(currentDate, 1))
    else setDate(subWeeks(currentDate, 1))
  }

  const handleNext = () => {
    if (view === 'day') setDate(addDays(currentDate, 1))
    else if (view === 'month') setDate(addMonths(currentDate, 1))
    else setDate(addWeeks(currentDate, 1))
  }

  // Days shown in time-grid views
  const days = React.useMemo<Date[]>(() => {
    if (view === 'week') return getWeekDays(currentDate)
    if (view === 'weekday') return getWeekdayDays(currentDate)
    if (view === 'day') return [startOfDay(currentDate)]
    return []
  }, [view, currentDate])

  // Header label
  const headerLabel = (): string => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy')
    if (view === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy')
    const first = days[0]
    const last = days[days.length - 1]
    if (!first || !last) return ''
    return `${format(first, 'MMM d')} – ${format(last, 'MMM d, yyyy')}`
  }

  // Filter events relevant to the currently visible date range
  const visibleEvents = React.useMemo<CalendarEvent[]>(() => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate))
      const end = addDays(start, 41)
      return events.filter((e) => e.start <= end && getEventEnd(e) >= start)
    }
    if (!days.length) return []
    const rangeStart = startOfDay(days[0])
    const rangeEnd = addDays(startOfDay(days[days.length - 1]), 1)
    return events.filter((e) => e.start < rangeEnd && getEventEnd(e) > rangeStart)
  }, [view, currentDate, days, events])

  return (
    <div
      className={cn(
        'flex h-[680px] flex-col overflow-hidden rounded-lg border bg-background',
        className,
      )}
    >
      {/* ── Toolbar ── */}
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5">
        <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
          Today
        </Button>

        <div className="flex items-center">
          <Button variant="ghost" size="icon-sm" onClick={handlePrev} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleNext} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <span className="min-w-0 flex-1 text-center text-sm font-semibold">
          {headerLabel()}
        </span>

        {/* View switcher */}
        <div className="flex rounded-md border">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setView(opt.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                'first:rounded-l last:rounded-r',
                view === opt.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calendar body ── */}
      {view === 'month' ? (
        <MonthView
          currentDate={currentDate}
          events={visibleEvents}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
        />
      ) : (
        <TimeGrid
          days={days}
          events={visibleEvents}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
        />
      )}
    </div>
  )
}

FullCalendar.displayName = 'FullCalendar'
