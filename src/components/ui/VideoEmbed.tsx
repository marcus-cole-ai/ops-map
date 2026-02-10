'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { parseVideoUrl, type VideoPlatform } from '@/lib/video'

interface VideoEmbedProps {
  url?: string
  videoType?: VideoPlatform | null
}

const platformLabel = (platform: VideoPlatform | null) => {
  if (platform === 'loom') return 'Loom'
  if (platform === 'gdrive') return 'Google Drive'
  return 'Video'
}

export function VideoEmbed({ url, videoType }: VideoEmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const parsed = useMemo(() => (url ? parseVideoUrl(url) : null), [url])
  const platform = videoType || parsed?.platform || null
  const embedUrl = parsed?.embedUrl || null

  if (!url) {
    return (
      <div className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
        No video added
      </div>
    )
  }

  if (!embedUrl || !platform) {
    return (
      <div className="text-sm" style={{ color: '#b45309' }}>
        Invalid or unsupported video URL
      </div>
    )
  }

  if (failed) {
    return (
      <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stone)', background: 'var(--cream-light)' }}>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Embed failed to load.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm mt-2"
          style={{ color: 'var(--gk-green)' }}
        >
          Watch on {platformLabel(platform)}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: '56.25%' }}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: 'var(--cream-light)' }}
        />
      )}
      <iframe
        title={`${platformLabel(platform)} video`}
        src={embedUrl}
        loading="lazy"
        allow={platform === 'loom' ? 'autoplay; fullscreen' : 'fullscreen'}
        className="absolute inset-0 h-full w-full"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
