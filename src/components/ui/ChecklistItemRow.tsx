'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'

interface ChecklistItemRowProps {
  id: string
  text: string
  completed: boolean
  videoUrl?: string
  onToggle: (checked: boolean) => void
  onDelete: () => void
  onUpdateText: (text: string) => void
  onUpdateVideoUrl?: (url: string) => void
}

export function ChecklistItemRow({
  id,
  text,
  completed,
  videoUrl,
  onToggle,
  onDelete,
  onUpdateText,
  onUpdateVideoUrl,
}: ChecklistItemRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftText, setDraftText] = useState(text)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  const commitEdit = () => {
    const trimmed = draftText.trim()
    if (trimmed.length === 0) {
      setDraftText(text)
      setIsEditing(false)
      return
    }
    if (trimmed !== text) {
      onUpdateText(trimmed)
    }
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      className="p-3 rounded-lg"
      data-dragging={isDragging}
      aria-roledescription="Draggable checklist item"
      aria-label={text}
      style={{
        ...style,
        background: 'var(--cream-light)'
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="p-1 rounded hover:bg-slate-200 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </button>
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 rounded flex-shrink-0"
          style={{ accentColor: 'var(--gk-green)' }}
        />
        <div className="flex-1 text-sm">
          {isEditing ? (
            <input
              type="text"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitEdit()
                }
                if (e.key === 'Escape') {
                  setDraftText(text)
                  setIsEditing(false)
                }
              }}
              className="w-full bg-white rounded border px-2 py-1 text-sm"
              style={{
                borderColor: 'var(--stone)',
                color: 'var(--text-primary)'
              }}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftText(text)
                setIsEditing(true)
              }}
              className={`w-full text-left ${completed ? 'line-through' : ''}`}
              style={{ color: completed ? 'var(--text-muted)' : 'var(--text-primary)' }}
            >
              {text}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-100 transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
      <div className="mt-2 ml-9">
        <input
          type="url"
          value={videoUrl || ''}
          onChange={(e) => onUpdateVideoUrl?.(e.target.value || '')}
          placeholder="Video URL (optional)"
          className="w-full px-2 py-1 rounded border text-xs"
          style={{
            borderColor: 'var(--stone)',
            background: 'var(--white)',
            color: 'var(--text-secondary)'
          }}
        />
      </div>
    </div>
  )
}
