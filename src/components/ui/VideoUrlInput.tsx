'use client'

import { useEffect, useState } from 'react'
import { Link, X } from 'lucide-react'
import { parseVideoUrl, type VideoPlatform } from '@/lib/video'

interface VideoUrlInputProps {
  value?: string
  onChange: (url: string | null, platform: VideoPlatform | null) => void
  placeholder?: string
  helperText?: string
}

const LoomIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
    <path
      d="M7 12a5 5 0 1 0 10 0 5 5 0 0 0-10 0zm3 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"
      fill="currentColor"
    />
  </svg>
)

const DriveIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M8 3l4 7h8l-4-7H8z" fill="currentColor" opacity="0.75" />
    <path d="M4 10l4-7 4 7-4 7-4-7z" fill="currentColor" opacity="0.4" />
    <path d="M12 17l4-7h8l-4 7h-8z" fill="currentColor" />
  </svg>
)

const getPlatformLabel = (platform: VideoPlatform | null) => {
  if (platform === 'loom') return 'Loom'
  if (platform === 'gdrive') return 'Google Drive'
  return null
}

export function VideoUrlInput({
  value,
  onChange,
  placeholder = 'https://www.loom.com/share/... or https://drive.google.com/file/d/.../view',
  helperText,
}: VideoUrlInputProps) {
  const [draft, setDraft] = useState(value || '')
  const [error, setError] = useState<string | null>(null)
  const [platform, setPlatform] = useState<VideoPlatform | null>(null)

  useEffect(() => {
    setDraft(value || '')
    if (value) {
      const parsed = parseVideoUrl(value)
      setPlatform(parsed.platform)
      setError(null)
    } else {
      setPlatform(null)
      setError(null)
    }
  }, [value])

  const commitValue = (nextValue: string) => {
    const trimmed = nextValue.trim()
    if (!trimmed) {
      setError(null)
      setPlatform(null)
      onChange(null, null)
      return
    }

    const parsed = parseVideoUrl(trimmed)
    if (!parsed.platform || !parsed.embedUrl) {
      setError('Unsupported or invalid video URL. Use Loom or Google Drive share links.')
      setPlatform(null)
      return
    }

    setError(null)
    setPlatform(parsed.platform)
    onChange(trimmed, parsed.platform)
  }

  const handleChange = (nextValue: string) => {
    setDraft(nextValue)
    if (error) setError(null)
    const parsed = parseVideoUrl(nextValue)
    setPlatform(parsed.platform)
  }

  const platformLabel = getPlatformLabel(platform)

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        >
          {platform === 'loom' ? (
            <LoomIcon className="h-4 w-4" />
          ) : platform === 'gdrive' ? (
            <DriveIcon className="h-4 w-4" />
          ) : (
            <Link className="h-4 w-4" />
          )}
        </div>
        <input
          type="url"
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => commitValue(draft)}
          onPaste={(e) => {
            const text = e.clipboardData.getData('text')
            if (!text) return
            e.preventDefault()
            setDraft(text)
            commitValue(text)
          }}
          placeholder={placeholder}
          className="w-full px-10 py-2 rounded-lg border text-sm"
          style={{
            borderColor: 'var(--stone)',
            background: 'var(--white)',
            color: 'var(--text-primary)',
          }}
        />
        {draft && (
          <button
            type="button"
            onClick={() => {
              setDraft('')
              setError(null)
              setPlatform(null)
              onChange(null, null)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-red-100"
            aria-label="Clear video URL"
          >
            <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {platformLabel && !error && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Detected platform: {platformLabel}
        </p>
      )}
      {error ? (
        <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>
      ) : helperText ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{helperText}</p>
      ) : null}
    </div>
  )
}
