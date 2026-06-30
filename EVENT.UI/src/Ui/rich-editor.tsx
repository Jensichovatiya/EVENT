/**
 * RichEditor — three editor variants built on contenteditable + browser Selection API.
 *
 *  variant="inline"  Minimal in-place editor. Looks like plain text, subtle ring on focus.
 *  variant="chat"    Slack-style composer: format bar, @mention support, send action.
 *  variant="rich"    Full Quill-like editor with heading/quote/list toolbar.
 */
import * as React from 'react'
import {
  Bold, Italic, Underline, Strikethrough,
  Heading2, Heading3, Quote, Code,
  List, ListOrdered,
  AtSign, Smile, Paperclip, Send,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/Ui/avatar'
import { Button } from '@/Ui/button'
import { Separator } from '@/Ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Ui/tooltip'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MentionUser {
  id: string
  name: string
  initials: string
  role?: string
}

export interface RichEditorProps {
  /**
   * `inline` — minimal contenteditable, no toolbar, in-place editing feel
   * `chat`   — Slack-like composer with @mention and send button
   * `rich`   — full toolbar: headings, blockquote, code block, lists
   */
  variant?: 'inline' | 'chat' | 'rich'
  /** Initial / controlled HTML content */
  value?: string
  /** Fires on every keystroke with the current raw HTML */
  onChange?: (html: string) => void
  /** Chat variant: fires when the send button is clicked (or Enter pressed) */
  onSend?: (html: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Users shown in the @mention dropdown (chat variant). Falls back to built-in sample list. */
  mentionUsers?: MentionUser[]
  /** Called when attach file button is clicked (chat variant) */
  onAttach?: (files: FileList) => void
}

const DEFAULT_USERS: MentionUser[] = [
  { id: '1', name: 'Alice Johnson',  initials: 'AJ', role: 'Designer' },
  { id: '2', name: 'Bob Smith',      initials: 'BS', role: 'Engineer' },
  { id: '3', name: 'Carol White',    initials: 'CW', role: 'Product Manager' },
  { id: '4', name: 'David Lee',      initials: 'DL', role: 'Marketing' },
  { id: '5', name: 'Eva Martinez',   initials: 'EM', role: 'Engineer' },
]

// ── Shared prose styles applied to the contenteditable element ────────────────

const PROSE_CLASSES = [
  '[&_b]:font-bold [&_strong]:font-bold',
  '[&_i]:italic [&_em]:italic',
  '[&_u]:underline',
  '[&_s]:line-through',
  '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-1',
  '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:my-0.5',
  '[&_blockquote]:border-l-[3px] [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
  '[&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:px-3 [&_pre]:py-2 [&_pre]:font-mono [&_pre]:text-xs',
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-0.5',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-0.5',
  // mention chips inside contenteditable
  '[&_.mention-chip]:inline-flex [&_.mention-chip]:items-center [&_.mention-chip]:rounded-sm',
  '[&_.mention-chip]:bg-primary/10 [&_.mention-chip]:px-1.5 [&_.mention-chip]:py-0.5',
  '[&_.mention-chip]:text-xs [&_.mention-chip]:font-medium [&_.mention-chip]:text-primary',
].join(' ')

// ── Toolbar button ────────────────────────────────────────────────────────────

interface ToolbarBtnProps {
  icon: React.ElementType
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

function ToolbarBtn({ icon: Icon, label, active, disabled, onClick }: ToolbarBtnProps) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          // onMouseDown + preventDefault keeps the editor focused while formatting
          onMouseDown={(e) => {
            e.preventDefault()
            if (!disabled) onClick()
          }}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-40',
            active
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  )
}

// ── @mention dropdown ─────────────────────────────────────────────────────────

interface MentionDropdownProps {
  users: MentionUser[]
  activeIndex: number
  onSelect: (user: MentionUser) => void
}

function MentionDropdown({ users, activeIndex, onSelect }: MentionDropdownProps) {
  if (users.length === 0) return null
  return (
    <div
      role="listbox"
      aria-label="Mention someone"
      className="absolute bottom-full left-0 z-50 mb-1.5 min-w-[220px] overflow-hidden rounded-md border bg-popover shadow-lg"
    >
      <p className="border-b px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        People
      </p>
      {users.map((user, idx) => (
        <div
          key={user.id}
          role="option"
          aria-selected={idx === activeIndex}
          // onMouseDown to avoid blur before selection
          onMouseDown={(e) => { e.preventDefault(); onSelect(user) }}
          className={cn(
            'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            idx === activeIndex && 'bg-accent text-accent-foreground',
          )}
        >
          <Avatar size="sm">
            <AvatarFallback className="text-[10px]">{user.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium leading-none">{user.name}</p>
            {user.role && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.role}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Core editor logic helpers ─────────────────────────────────────────────────

function execFmt(cmd: string, value?: string) {
  document.execCommand(cmd, false, value)
}

function queryState(cmd: string): boolean {
  try { return document.queryCommandState(cmd) } catch { return false }
}

function queryBlock(): string {
  try { return document.queryCommandValue('formatBlock').toLowerCase() } catch { return '' }
}

function applyBlock(tag: string) {
  const cur = queryBlock()
  execFmt('formatBlock', cur === tag ? 'div' : tag)
}

/** Read text from start-of-editor to cursor */
function textBeforeCaret(editorEl: HTMLElement): string {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return ''
  const range = sel.getRangeAt(0)
  const pre = range.cloneRange()
  pre.selectNodeContents(editorEl)
  pre.setEnd(range.endContainer, range.endOffset)
  return pre.toString()
}

/** Insert a mention chip at the current selection, replacing "@query" */
function doInsertMention(user: MentionUser, queryLen: number, editorEl: HTMLElement) {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)

  // Delete the "@query" text backwards from cursor (only when inside a text node)
  if (range.endContainer.nodeType === Node.TEXT_NODE) {
    const deleteLen = queryLen + 1 // +1 for the '@' character
    range.setStart(range.endContainer, Math.max(0, range.endOffset - deleteLen))
    range.deleteContents()
  }

  // Build the non-editable mention chip
  const chip = document.createElement('span')
  chip.contentEditable = 'false'
  chip.className = 'mention-chip'
  chip.dataset.userId = user.id
  chip.textContent = `@${user.name}`
  range.insertNode(chip)

  // Add a space after the chip and move cursor there
  const space = document.createTextNode('\u00A0')
  chip.after(space)
  const after = document.createRange()
  after.setStartAfter(space)
  after.collapse(true)
  sel.removeAllRanges()
  sel.addRange(after)

  // Notify editor
  editorEl.dispatchEvent(new Event('input', { bubbles: true }))
}

// ── Emoji Picker ─────────────────────────────────────────────────────────────

function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const [activeTab, setActiveTab] = React.useState(0)
  const [search, setSearch] = React.useState('')
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const allEmojis = React.useMemo(() => EMOJI_CATEGORIES.flatMap(c => c.emojis), [])
  const filtered = search
    ? allEmojis // can't search by name without a map, so just show all — filter visually later
    : EMOJI_CATEGORIES[activeTab]?.emojis || []

  // Close on outside click (ignore toggle button)
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.emoji-picker-panel') && !target.closest('.emoji-picker-toggle')) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="emoji-picker-panel absolute bottom-full left-0 mb-1.5 z-50 rounded-xl border bg-popover shadow-2xl w-[340px] overflow-hidden"
      onMouseDown={e => e.preventDefault()}>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="w-full rounded-lg border bg-muted/50 px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
            autoFocus
          />
        </div>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex items-center border-b px-1">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button key={i} type="button"
              className={cn(
                'flex-1 flex items-center justify-center py-2 text-lg transition-all border-b-2',
                activeTab === i ? 'border-primary scale-110' : 'border-transparent opacity-50 hover:opacity-100',
              )}
              onMouseDown={(e) => { e.preventDefault(); setActiveTab(i) }}
              title={cat.label}>
              {cat.emojis[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emojis grid */}
      <div ref={scrollRef} className="h-[220px] overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/80">
        {!search && (
          <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 px-1 uppercase tracking-wider">
            {EMOJI_CATEGORIES[activeTab]?.label}
          </p>
        )}
        <div className="grid grid-cols-8 gap-0.5">
          {filtered.map((emoji, idx) => (
            <button key={`${emoji}-${idx}`} type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-accent active:scale-90 transition-all"
              onMouseDown={(e) => { e.preventDefault(); onSelect(emoji) }}>
              {emoji}
            </button>
          ))}
        </div>
        {search && filtered.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-6">No emoji found</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/20 px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {search ? `${allEmojis.length} emojis` : EMOJI_CATEGORIES[activeTab]?.label}
        </span>
        <span className="text-[10px] text-muted-foreground">Click to insert</span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  { label: 'Smileys', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','😐','😑','😶','😏','😒','🙄','😬','😮‍💨','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱'] },
  { label: 'Gestures', emojis: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','💪'] },
  { label: 'Hearts', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝'] },
  { label: 'Objects', emojis: ['🔥','✨','⭐','🌟','💯','💢','💥','💫','💦','🎉','🎊','🎈','🎁','🏆','🥇','🏅','📌','📎','💡','🔔','🔕','📝','✏️','📁','📂','📊','📈','📉','⏰','⌛','🔒','🔑','🔧','⚙️','💻','📱','📧','✈️','🚀','⚡','🔋'] },
  { label: 'Symbols', emojis: ['✅','❌','⭕','❗','❓','‼️','⁉️','💲','©️','®️','™️','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','▶️','⏸️','⏹️','⏺️','⏭️','⏮️','🔀','🔁','🔂','➕','➖','➗','✖️','♾️','💱'] },
]

export function RichEditor({
  variant = 'rich',
  value,
  onChange,
  onSend,
  placeholder,
  disabled = false,
  className,
  mentionUsers = DEFAULT_USERS,
  onAttach,
}: RichEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [emojiOpen, setEmojiOpen] = React.useState(false)

  // Common state
  const [isEmpty, setIsEmpty] = React.useState(true)
  const [hasFocus, setHasFocus] = React.useState(false)

  // Toolbar active state (rich + chat)
  const [fmt, setFmt] = React.useState({ bold: false, italic: false, underline: false, strike: false })
  const [block, setBlock] = React.useState('')

  // @mention state (chat)
  const [mentionOpen, setMentionOpen] = React.useState(false)
  const [mentionQuery, setMentionQuery] = React.useState('')
  const [mentionIdx, setMentionIdx] = React.useState(0)

  const filteredUsers = React.useMemo(
    () => mentionUsers.filter((u) => u.name.toLowerCase().includes(mentionQuery.toLowerCase())),
    [mentionUsers, mentionQuery],
  )

  // Sync controlled value on mount / when value changes externally
  React.useEffect(() => {
    const el = editorRef.current
    if (!el || value === undefined) return
    if (el.innerHTML !== value) {
      el.innerHTML = value
      checkEmpty(el)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track selection changes → update toolbar state
  React.useEffect(() => {
    const update = () => {
      if (!hasFocus) return
      setFmt({
        bold: queryState('bold'),
        italic: queryState('italic'),
        underline: queryState('underline'),
        strike: queryState('strikeThrough'),
      })
      setBlock(queryBlock())
    }
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [hasFocus])

  // ── Handlers ────────────────────────────────────────────────────────────────

  function checkEmpty(el: HTMLElement) {
    const text = el.textContent ?? ''
    const html = el.innerHTML
    setIsEmpty(
      text.trim() === '' &&
      !html.includes('<img') &&
      !html.includes('mention-chip'),
    )
  }

  function handleInput() {
    const el = editorRef.current
    if (!el) return
    checkEmpty(el)
    onChange?.(el.innerHTML)

    // @mention detection (chat variant only)
    if (variant !== 'chat') return
    const text = textBeforeCaret(el)
    const match = text.match(/@(\w*)$/)
    if (match) {
      setMentionQuery(match[1])
      setMentionIdx(0)
      setMentionOpen(true)
    } else {
      setMentionOpen(false)
      setMentionQuery('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Mention dropdown keyboard navigation
    if (mentionOpen && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIdx((i) => Math.min(i + 1, filteredUsers.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIdx((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        const user = filteredUsers[mentionIdx]
        if (user) insertMention(user)
        return
      }
      if (e.key === 'Escape') {
        setMentionOpen(false)
        return
      }
    }

    // Chat: Enter sends, Shift+Enter = newline
    if (variant === 'chat' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function insertMention(user: MentionUser) {
    const el = editorRef.current
    if (!el) return
    doInsertMention(user, mentionQuery.length, el)
    setMentionOpen(false)
    setMentionQuery('')
    checkEmpty(el)
    onChange?.(el.innerHTML)
  }

  function handleSend() {
    const el = editorRef.current
    if (!el) return
    const html = el.innerHTML
    if (!html || (el.textContent?.trim() === '' && !html.includes('<img'))) return
    onSend?.(html)
    el.innerHTML = ''
    setIsEmpty(true)
    onChange?.('')
  }

  function format(cmd: string, val?: string) {
    editorRef.current?.focus()
    execFmt(cmd, val)
    setFmt({
      bold: queryState('bold'),
      italic: queryState('italic'),
      underline: queryState('underline'),
      strike: queryState('strikeThrough'),
    })
    setBlock(queryBlock())
    onChange?.(editorRef.current?.innerHTML ?? '')
  }

  // Insert literal '@' then trigger mention detection
  function triggerMention() {
    const el = editorRef.current
    if (!el) return
    el.focus()
    execFmt('insertText', '@')
    setMentionOpen(true)
    setMentionQuery('')
    setMentionIdx(0)
  }

  function insertEmoji(emoji: string) {
    const el = editorRef.current
    if (!el) return
    el.focus()
    execFmt('insertText', emoji)
    setEmojiOpen(false)
    onChange?.(el.innerHTML)
  }

  function handleFileAttach() {
    fileInputRef.current?.click()
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onAttach?.(e.target.files)
      e.target.value = ''
    }
  }

  // ── Shared editable area ─────────────────────────────────────────────────────

  const editorArea = (isChat: boolean) => (
    <div className="relative">
      {/* Placeholder overlay */}
      {isEmpty && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute select-none text-sm text-muted-foreground/60',
            isChat ? 'left-4 top-3' : 'left-4 top-3',
          )}
        >
          {placeholder ?? (isChat ? 'Message…' : 'Start writing…')}
        </div>
      )}

      {/* @mention dropdown (chat only) */}
      {isChat && mentionOpen && filteredUsers.length > 0 && (
        <MentionDropdown
          users={filteredUsers}
          activeIndex={mentionIdx}
          onSelect={insertMention}
        />
      )}

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-placeholder={placeholder}
        onFocus={() => setHasFocus(true)}
        onBlur={() => { setHasFocus(false); setMentionOpen(false) }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full px-4 py-3 text-sm leading-relaxed outline-none',
          isChat ? 'max-h-40 min-h-[52px] overflow-y-auto' : 'min-h-[180px]',
          PROSE_CLASSES,
          disabled && 'cursor-not-allowed opacity-50',
        )}
      />
    </div>
  )

  // ── Toolbar groups ────────────────────────────────────────────────────────────

  const textFormatGroup = (
    <>
      <ToolbarBtn icon={Bold}          label="Bold (Ctrl+B)"       active={fmt.bold}    disabled={disabled} onClick={() => format('bold')} />
      <ToolbarBtn icon={Italic}        label="Italic (Ctrl+I)"     active={fmt.italic}  disabled={disabled} onClick={() => format('italic')} />
      <ToolbarBtn icon={Underline}     label="Underline (Ctrl+U)"  active={fmt.underline} disabled={disabled} onClick={() => format('underline')} />
      <ToolbarBtn icon={Strikethrough} label="Strikethrough"       active={fmt.strike}  disabled={disabled} onClick={() => format('strikeThrough')} />
    </>
  )

  const listGroup = (
    <>
      <ToolbarBtn icon={List}          label="Bullet list"    disabled={disabled} onClick={() => format('insertUnorderedList')} />
      <ToolbarBtn icon={ListOrdered}   label="Numbered list"  disabled={disabled} onClick={() => format('insertOrderedList')} />
    </>
  )

  // ── Inline variant ────────────────────────────────────────────────────────────
  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <div className={cn('relative', className)}>
          {isEmpty && (
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 select-none text-sm text-muted-foreground/60"
            >
              {placeholder ?? 'Click to edit…'}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable={!disabled}
            suppressContentEditableWarning
            role="textbox"
            aria-multiline
            aria-placeholder={placeholder}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full rounded px-1 py-0.5 text-sm leading-relaxed outline-none transition-shadow',
              PROSE_CLASSES,
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-accent/40 focus-visible:ring-1 focus-visible:ring-ring',
            )}
          />
        </div>
      </TooltipProvider>
    )
  }

  // ── Chat variant ──────────────────────────────────────────────────────────────
  if (variant === 'chat') {
    return (
      <TooltipProvider>
        <div className={cn('w-full', className)}>
          <div
            className={cn(
              'relative overflow-visible rounded-lg border bg-background transition-colors',
              !disabled && 'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30',
              disabled && 'opacity-60',
            )}
          >
            {/* Format bar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1">
              {textFormatGroup}
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              <ToolbarBtn icon={Code} label="Code" disabled={disabled} onClick={() => format('formatBlock', 'pre')} />
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              {listGroup}
            </div>

            {/* Editable content area */}
            {editorArea(true)}

            {/* Bottom action bar */}
            <div className="flex items-center justify-between border-t px-2 py-1.5">
              <div className="flex items-center gap-0.5 relative">
                <ToolbarBtn icon={AtSign}     label="Mention someone" disabled={disabled} onClick={triggerMention} />
                <button
                  type="button"
                  aria-label="Add emoji"
                  className={cn(
                    'emoji-picker-toggle flex h-7 w-7 items-center justify-center rounded text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    emojiOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                  onMouseDown={(e) => { e.preventDefault(); setEmojiOpen(!emojiOpen) }}
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
                <ToolbarBtn icon={Paperclip}  label="Attach file"     disabled={disabled} onClick={handleFileAttach} />
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFileSelected} />

                {/* Emoji picker — WhatsApp style */}
                {emojiOpen && <EmojiPicker onSelect={insertEmoji} onClose={() => setEmojiOpen(false)} />}
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-[11px] text-muted-foreground sm:flex items-center gap-1">
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd>
                  send
                  <span className="opacity-40 mx-0.5">·</span>
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">⇧↵</kbd>
                  newline
                </span>
                <Button
                  type="button"
                  size="sm"
                  disabled={disabled || isEmpty}
                  onClick={handleSend}
                  className="h-7 gap-1.5 px-3 text-xs"
                >
                  <Send className="h-3 w-3" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // ── Rich variant ──────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex w-full flex-col overflow-hidden rounded-lg border bg-background transition-colors',
          !disabled && 'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30',
          disabled && 'opacity-60',
          className,
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
          {textFormatGroup}
          <Separator orientation="vertical" className="mx-0.5 h-4" />
          <ToolbarBtn icon={Heading2} label="Heading 2" active={block === 'h2'}          disabled={disabled} onClick={() => applyBlock('h2')} />
          <ToolbarBtn icon={Heading3} label="Heading 3" active={block === 'h3'}          disabled={disabled} onClick={() => applyBlock('h3')} />
          <Separator orientation="vertical" className="mx-0.5 h-4" />
          <ToolbarBtn icon={Quote}    label="Blockquote" active={block === 'blockquote'} disabled={disabled} onClick={() => applyBlock('blockquote')} />
          <ToolbarBtn icon={Code}     label="Code block" active={block === 'pre'}        disabled={disabled} onClick={() => applyBlock('pre')} />
          <Separator orientation="vertical" className="mx-0.5 h-4" />
          {listGroup}
        </div>

        {/* Content */}
        {editorArea(false)}
      </div>
    </TooltipProvider>
  )
}

RichEditor.displayName = 'RichEditor'
