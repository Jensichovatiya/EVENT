import * as React from 'react'
import { cn } from '@/lib/utils'
import { Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/Ui/button'
import { Badge } from '@/Ui/badge'

export interface KanbanItem {
  id: string
  [key: string]: unknown
}

export interface KanbanColumn<T extends KanbanItem> {
  id: string
  title: string
  color?: string
  items: T[]
  metadata?: Record<string, unknown>
}

export interface KanbanProps<T extends KanbanItem> {
  columns: KanbanColumn<T>[]
  renderCard: (item: T, column: KanbanColumn<T>) => React.ReactNode
  onMove?: (itemId: string, fromColumnId: string, toColumnId: string) => void
  onAddCard?: (columnId: string) => void
  onAddColumn?: (name: string) => void
  columnHeaderContent?: (column: KanbanColumn<T>) => React.ReactNode
  className?: string
  /** Number of cards to show initially per column. 0 = show all */
  initialVisibleCount?: number
}

const COLUMN_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  gray: 'bg-gray-500',
}

export function KanbanBoard<T extends KanbanItem>({
  columns,
  renderCard,
  onMove,
  onAddCard,
  onAddColumn,
  columnHeaderContent,
  className,
  initialVisibleCount = 5,
}: KanbanProps<T>) {
  const boardRef = React.useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [draggingFrom, setDraggingFrom] = React.useState<string | null>(null)
  const [overColumn, setOverColumn] = React.useState<string | null>(null)
  const [expandedCols, setExpandedCols] = React.useState<Set<string>>(new Set())

  // Mouse wheel → horizontal scroll on the board
  React.useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      // Only hijack if not scrolling inside a vertical-scrollable child
      const target = e.target as HTMLElement
      const scrollableParent = target.closest('.kanban-card-list')
      if (scrollableParent) {
        const sp = scrollableParent as HTMLElement
        const canScrollVertically = sp.scrollHeight > sp.clientHeight
        if (canScrollVertically) return // let vertical scroll happen naturally
      }
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const handleDragStart = (e: React.DragEvent, itemId: string, columnId: string) => {
    setDraggingId(itemId)
    setDraggingFrom(columnId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', itemId)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverColumn(columnId)
  }

  const handleDragLeave = () => { setOverColumn(null) }

  const handleDrop = (e: React.DragEvent, toColumnId: string) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain')
    if (itemId && draggingFrom && draggingFrom !== toColumnId && onMove) {
      onMove(itemId, draggingFrom, toColumnId)
    }
    setDraggingId(null)
    setDraggingFrom(null)
    setOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDraggingFrom(null)
    setOverColumn(null)
  }

  const toggleExpand = (colId: string) => {
    setExpandedCols(prev => {
      const next = new Set(prev)
      if (next.has(colId)) next.delete(colId); else next.add(colId)
      return next
    })
  }

  return (
    // Two-level scroll: the outer div owns horizontal scroll; the inner
    // row is the column track. The inner row uses `w-max` so it sizes to
    // the sum of its children — without that, the flex container caps at
    // the wrapper's width and the rightmost columns get clipped instead
    // of becoming scroll-reachable. The 12px-tall scrollbar with a
    // theme-coloured thumb makes the scroll affordance obvious.
    <div
      ref={boardRef}
      className={cn(
        'kanban-board-scroll w-full h-full overflow-x-auto overflow-y-hidden',
        className,
      )}
    >
      <div className="flex w-max gap-4 pb-2 pr-6 flex-nowrap h-full items-stretch">
      {columns.map((column) => {
        const isHex = column.color?.startsWith('#')
        const colorClass = isHex ? '' : (column.color ? COLUMN_COLORS[column.color] ?? 'bg-primary' : 'bg-primary')
        const isOver = overColumn === column.id
        const isExpanded = expandedCols.has(column.id)
        const showCount = initialVisibleCount > 0 && !isExpanded ? initialVisibleCount : column.items.length
        const visibleItems = column.items.slice(0, showCount)
        const hiddenCount = column.items.length - showCount

        return (
          <div
            key={column.id}
            className={cn(
              'flex flex-col w-[280px] sm:w-72 shrink-0 rounded-xl border bg-muted/30 transition-colors h-full overflow-hidden',
              isOver && 'bg-muted/70 border-primary/50 ring-2 ring-primary/20',
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Color accent strip — visually links the column to its status */}
            <div
              className={cn('h-1 w-full shrink-0', !isHex && colorClass)}
              style={isHex ? { backgroundColor: column.color } : undefined}
              aria-hidden
            />

            {/* Column Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-sm truncate">{column.title}</span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shrink-0 font-medium">
                  {column.items.length}
                </Badge>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {onAddCard && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => onAddCard(column.id)}
                    aria-label={`Add card to ${column.title}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                {columnHeaderContent && columnHeaderContent(column)}
              </div>
            </div>

            {/* Cards — vertical scroll inside column */}
            <div className="kanban-card-list flex-1 overflow-y-auto px-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/40 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="space-y-2 pb-2">
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id, column.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'cursor-grab active:cursor-grabbing rounded-lg transition-opacity',
                      draggingId === item.id && 'opacity-40',
                    )}
                  >
                    {renderCard(item, column)}
                  </div>
                ))}

                {column.items.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-24 gap-1 text-xs text-muted-foreground border border-dashed rounded-lg">
                    <span>No tasks yet</span>
                    {onAddCard && (
                      <button
                        onClick={() => onAddCard(column.id)}
                        className="text-primary hover:underline text-[11px] font-medium"
                      >
                        + Add card
                      </button>
                    )}
                  </div>
                )}

                {/* View more button */}
                {hiddenCount > 0 && (
                  <button
                    onClick={() => toggleExpand(column.id)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <ChevronDown className="h-3 w-3" />
                    View {hiddenCount} more
                  </button>
                )}

                {/* Collapse button */}
                {isExpanded && initialVisibleCount > 0 && column.items.length > initialVisibleCount && (
                  <button
                    onClick={() => toggleExpand(column.id)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>

            {/* Add Card Button (footer) — secondary to the header "+" */}
            {onAddCard && column.items.length > 0 && (
              <div className="px-2 pb-2 pt-1 shrink-0 border-t border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => onAddCard(column.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add card
                </Button>
              </div>
            )}
          </div>
        )
      })}

      {/* Add Status Column */}
      {onAddColumn && <AddColumnCard onAdd={onAddColumn} />}
      </div>
    </div>
  )
}

// ── Add Column Card ─────────────────────────────────────────────────────────

function AddColumnCard({ onAdd }: { onAdd: (name: string) => void }) {
  const [editing, setEditing] = React.useState(false)
  const [name, setName] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex flex-col items-center justify-center w-[280px] sm:w-72 shrink-0 rounded-xl border-2 border-dashed bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-colors h-full min-h-[120px] gap-2 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Add Status</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col w-[280px] sm:w-72 shrink-0 rounded-xl border bg-muted/40 p-3 gap-3">
      <input
        ref={inputRef}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setEditing(false); setName('') } }}
        placeholder="Status name..."
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
      />
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={handleAdd} disabled={!name.trim()}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setEditing(false); setName('') }}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
