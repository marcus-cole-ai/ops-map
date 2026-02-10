'use client'

import { Rocket } from 'lucide-react'

interface DraftBannerProps {
  onPublish?: () => void
}

export function DraftBanner({ onPublish }: DraftBannerProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
      style={{ background: 'var(--sand)', borderColor: '#e3c17a' }}
      role="status"
      aria-live="polite"
    >
      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        You&apos;re editing a draft. Publish when it&apos;s ready to become your source of truth.
      </div>
      {onPublish && (
        <button
          onClick={onPublish}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white"
          style={{ background: 'var(--gk-green)' }}
        >
          <Rocket className="h-4 w-4" />
          Publish
        </button>
      )}
    </div>
  )
}
