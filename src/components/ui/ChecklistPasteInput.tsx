'use client'

import { useRef, useState } from 'react'
import { parseChecklistText } from '@/lib/checklist'

interface ChecklistPasteInputProps {
  placeholder?: string
  onAddItems: (items: string[]) => void
  maxItems?: number
  currentCount?: number
}

export function ChecklistPasteInput({
  placeholder = 'Type or paste checklist items...',
  onAddItems,
  maxItems,
  currentCount = 0,
}: ChecklistPasteInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [hasValue, setHasValue] = useState(false)

  const applyItemLimit = (items: string[]) => {
    if (!maxItems) return items
    const remaining = Math.max(0, maxItems - currentCount)
    if (remaining <= 0) return []
    return items.slice(0, remaining)
  }

  const submitItems = (rawText: string) => {
    const items = applyItemLimit(parseChecklistText(rawText))
    if (items.length === 0) return
    onAddItems(items)
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.style.height = 'auto'
    }
    setHasValue(false)
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData('text')
    if (!pastedText.includes('\n') && !pastedText.includes('\r')) {
      return
    }
    event.preventDefault()
    submitItems(pastedText)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return
    if (event.shiftKey) return
    event.preventDefault()
    const value = textareaRef.current?.value || ''
    submitItems(value)
  }

  const handleAddClick = () => {
    const value = textareaRef.current?.value || ''
    submitItems(value)
  }

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(event.target.value.trim().length > 0)
  }

  return (
    <div className="flex gap-2">
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        rows={2}
        className="flex-1 px-3 py-2 rounded-lg border text-sm resize-none"
        style={{
          borderColor: 'var(--stone)',
          background: 'var(--cream)',
          color: 'var(--text-primary)'
        }}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onChange={handleInput}
      />
      <button
        type="button"
        onClick={handleAddClick}
        disabled={!hasValue}
        className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
        style={{ background: 'var(--gk-green)' }}
      >
        Add
      </button>
    </div>
  )
}
