import * as React from 'react'
import {
  Upload, X, File, FileText, ImageIcon, Video, Music,
  Camera, CloudUpload, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.startsWith('video/')) return Video
  if (mimeType.startsWith('audio/')) return Music
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('text') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation')
  )
    return FileText
  return File
}

function validateFile(file: File, accept?: string, maxSize?: number): string | null {
  if (maxSize && file.size > maxSize) {
    return `Exceeds ${formatBytes(maxSize)} limit`
  }
  if (accept) {
    const accepted = accept.split(',').map((s) => s.trim())
    const valid = accepted.some((type) => {
      if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type.toLowerCase())
      if (type.endsWith('/*')) return file.type.startsWith(type.slice(0, -1))
      return file.type === type
    })
    if (!valid) return 'File type not allowed'
  }
  return null
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileItem {
  id: string
  file: File
  /** Object URL for image previews — revoke on cleanup */
  preview?: string
  error?: string
}

export interface FileUploadProps {
  /**
   * `avatar`   — circular image picker with hover-overlay camera icon
   * `normal`   — labelled button + filename, single file
   * `dropzone` — dashed drag-and-drop area, single file
   * `multiple` — drag-and-drop area that accepts many files, list below
   */
  variant?: 'avatar' | 'normal' | 'dropzone' | 'multiple'
  /**
   * Comma-separated MIME types or file extensions accepted.
   * Examples: `"image/*"`, `".pdf,.docx"`, `"image/png,image/jpeg"`
   */
  accept?: string
  /** Maximum file size in bytes per file. */
  maxSize?: number
  /** Maximum number of files (only respected for the `multiple` variant). */
  maxFiles?: number
  /** Controlled file list. */
  value?: File[]
  /** Called whenever the file selection changes. */
  onChange?: (files: File[]) => void
  disabled?: boolean
  className?: string
  /** Override the default placeholder text shown in the drop zone / button. */
  placeholder?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FileUpload({
  variant = 'dropzone',
  accept,
  maxSize,
  maxFiles,
  value,
  onChange,
  disabled = false,
  className,
  placeholder,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [items, setItems] = React.useState<FileItem[]>([])

  // Sync controlled value into internal state
  React.useEffect(() => {
    if (value === undefined) return
    setItems((prev) =>
      value.map((file) => {
        const existing = prev.find((i) => i.file === file)
        if (existing) return existing
        return {
          id: crypto.randomUUID(),
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          error: validateFile(file, accept, maxSize) ?? undefined,
        }
      }),
    )
  }, [value, accept, maxSize])

  // Revoke object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview)
      })
    }
  }, []) // intentionally run only on unmount

  const addFiles = React.useCallback(
    (incoming: FileList | File[]) => {
      const isMultiple = variant === 'multiple'
      const newItems: FileItem[] = Array.from(incoming).map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        error: validateFile(file, accept, maxSize) ?? undefined,
      }))

      setItems((prev) => {
        let next: FileItem[]
        if (isMultiple) {
          next = [...prev, ...newItems]
          if (maxFiles && next.length > maxFiles) {
            // Revoke URLs for dropped items
            next.slice(maxFiles).forEach((i) => {
              if (i.preview) URL.revokeObjectURL(i.preview)
            })
            next = next.slice(0, maxFiles)
          }
        } else {
          // Revoke previous preview URLs
          prev.forEach((i) => {
            if (i.preview) URL.revokeObjectURL(i.preview)
          })
          next = newItems.slice(0, 1)
        }
        onChange?.(next.map((i) => i.file))
        return next
      })
    },
    [variant, accept, maxSize, maxFiles, onChange],
  )

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      const next = prev.filter((i) => i.id !== id)
      onChange?.(next.map((i) => i.file))
      return next
    })
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files)
      e.target.value = '' // allow re-selecting the same file
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || !e.dataTransfer.files?.length) return
    addFiles(e.dataTransfer.files)
  }

  const isMultiple = variant === 'multiple'
  const currentItem = items[0]
  const hasValidFiles = items.some((i) => !i.error)
  const constraintHint = [
    accept && `Accepted: ${accept}`,
    maxSize && `Max ${formatBytes(maxSize)} per file`,
    isMultiple && maxFiles && `Up to ${maxFiles} files`,
  ]
    .filter(Boolean)
    .join(' · ')

  // ── Hidden file input (shared across all variants) ────────────────────────
  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept ?? (variant === 'avatar' ? 'image/*' : undefined)}
      multiple={isMultiple}
      className="sr-only"
      disabled={disabled}
      onChange={handleInputChange}
      tabIndex={-1}
    />
  )

  // ── Avatar ─────────────────────────────────────────────────────────────────
  if (variant === 'avatar') {
    return (
      <div className={cn('inline-flex flex-col items-start gap-2', className)}>
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className={cn(
            'group relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            currentItem && !currentItem.error
              ? 'border-transparent'
              : 'border-border hover:border-primary',
          )}
          aria-label="Upload avatar image"
        >
          {currentItem?.preview ? (
            <img
              src={currentItem.preview}
              alt="Avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5 text-white" />
            <span className="text-[10px] font-medium text-white">
              {currentItem ? 'Change' : 'Upload'}
            </span>
          </div>
        </button>

        <div className="space-y-1">
          {currentItem && !currentItem.error && (
            <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {currentItem.file.name} · {formatBytes(currentItem.file.size)}
            </p>
          )}
          {currentItem?.error && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {currentItem.error}
            </p>
          )}
          {currentItem && (
            <button
              type="button"
              onClick={() => removeItem(currentItem.id)}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Remove
            </button>
          )}
        </div>

        {fileInput}
      </div>
    )
  }

  // ── Normal ─────────────────────────────────────────────────────────────────
  if (variant === 'normal') {
    return (
      <div className={cn('flex w-full flex-col gap-2', className)}>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openPicker}
            disabled={disabled}
          >
            <Upload className="h-3.5 w-3.5" />
            Choose file
          </Button>
          <span
            className={cn(
              'truncate text-sm',
              currentItem ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {currentItem ? currentItem.file.name : (placeholder ?? 'No file chosen')}
          </span>
        </div>

        {constraintHint && (
          <p className="text-xs text-muted-foreground">{constraintHint}</p>
        )}

        {items.length > 0 && <FileList items={items} onRemove={removeItem} />}

        {fileInput}
      </div>
    )
  }

  // ── Dropzone / Multiple ────────────────────────────────────────────────────
  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openPicker}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label={isMultiple ? 'Upload files' : 'Upload file'}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center',
          'cursor-pointer select-none transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          disabled
            ? 'pointer-events-none cursor-not-allowed opacity-50'
            : isDragging
              ? 'border-primary bg-primary/5'
              : hasValidFiles
                ? 'border-border bg-muted/20 hover:border-primary/50 hover:bg-accent/40'
                : 'border-border hover:border-primary/50 hover:bg-accent/40',
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full border transition-colors',
            isDragging
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-muted/50 text-muted-foreground',
          )}
        >
          <CloudUpload className="h-6 w-6" />
        </div>

        {/* Text */}
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragging
              ? 'Drop to upload'
              : (placeholder ?? (isMultiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse'))}
          </p>
          {constraintHint && (
            <p className="mt-0.5 text-xs text-muted-foreground">{constraintHint}</p>
          )}
        </div>
      </div>

      {/* File list */}
      {items.length > 0 && <FileList items={items} onRemove={removeItem} />}

      {fileInput}
    </div>
  )
}

FileUpload.displayName = 'FileUpload'

// ─── File list ────────────────────────────────────────────────────────────────

interface FileListProps {
  items: FileItem[]
  onRemove: (id: string) => void
}

function FileList({ items, onRemove }: FileListProps) {
  return (
    <ul className="space-y-2" role="list" aria-label="Selected files">
      {items.map((item) => {
        const Icon = getFileIcon(item.file.type)
        return (
          <li
            key={item.id}
            className={cn(
              'flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors',
              item.error
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-border bg-muted/30',
            )}
          >
            {/* Thumbnail / icon */}
            <div className="shrink-0">
              {item.preview ? (
                <img
                  src={item.preview}
                  alt=""
                  className="h-9 w-9 rounded object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded border bg-background">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* File info */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-tight">{item.file.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{formatBytes(item.file.size)}</span>
                {item.file.type && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{item.file.type}</span>
                  </>
                )}
                {item.error && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {item.error}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Status badge */}
            {!item.error && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className={cn(
                'shrink-0 rounded p-1 transition-colors',
                'text-muted-foreground hover:bg-accent hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
              aria-label={`Remove ${item.file.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
