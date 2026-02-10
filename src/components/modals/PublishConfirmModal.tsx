'use client'

import { useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'

interface PublishConfirmModalProps {
  isOpen: boolean
  entityType: string
  entityName: string
  onConfirm: () => void
  onCancel: () => void
}

export function PublishConfirmModal({
  isOpen,
  entityType,
  entityName,
  onConfirm,
  onCancel,
}: PublishConfirmModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    first?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      if (focusable.length === 0) return

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Publish Changes"
      description={`You're about to publish this ${entityType}.`}
    >
      <div ref={containerRef} className="space-y-4">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Publishing makes <span className="font-semibold">{entityName}</span> the active source of truth. Draft edits will
          be considered live for your team.
        </p>
        <div
          className="rounded-lg border p-3 text-xs"
          style={{ background: 'var(--cream)', borderColor: 'var(--stone)', color: 'var(--text-muted)' }}
        >
          You can still edit after publishing, which will create a new draft state.
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-medium text-white"
            style={{ background: 'var(--gk-green)' }}
          >
            Publish
          </button>
        </div>
      </div>
    </Modal>
  )
}
