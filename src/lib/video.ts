export type VideoPlatform = 'loom' | 'gdrive'

export interface ParsedVideoUrl {
  platform: VideoPlatform | null
  embedUrl: string | null
  videoId: string | null
}

const LOOM_SHARE_RE = /loom\.com\/share\/([a-zA-Z0-9]+)/i
const LOOM_EMBED_RE = /loom\.com\/embed\/([a-zA-Z0-9]+)/i
const GDRIVE_SHARE_RE = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(view|preview)/i
const GDRIVE_EMBED_RE = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(preview)/i

export const parseVideoUrl = (url: string): ParsedVideoUrl => {
  if (!url) {
    return { platform: null, embedUrl: null, videoId: null }
  }

  const trimmed = url.trim()
  if (!trimmed) {
    return { platform: null, embedUrl: null, videoId: null }
  }

  const loomMatch = trimmed.match(LOOM_SHARE_RE) || trimmed.match(LOOM_EMBED_RE)
  if (loomMatch) {
    const videoId = loomMatch[1]
    return {
      platform: 'loom',
      embedUrl: `https://www.loom.com/embed/${videoId}`,
      videoId,
    }
  }

  const gdriveMatch = trimmed.match(GDRIVE_SHARE_RE) || trimmed.match(GDRIVE_EMBED_RE)
  if (gdriveMatch) {
    const videoId = gdriveMatch[1]
    return {
      platform: 'gdrive',
      embedUrl: `https://drive.google.com/file/d/${videoId}/preview`,
      videoId,
    }
  }

  return { platform: null, embedUrl: null, videoId: null }
}

export const isValidVideoUrl = (url: string): boolean => {
  const parsed = parseVideoUrl(url)
  return Boolean(parsed.platform && parsed.embedUrl && parsed.videoId)
}
