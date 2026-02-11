'use client'

import { Cloud, CloudOff, Loader2 } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useOpsMapStore } from '@/store'

export function SyncStatusIndicator() {
  const { syncEnabled, syncStatus, lastSyncedAt, syncError } = useOpsMapStore()

  // Don't show if sync is not enabled
  if (!syncEnabled) return null

  const getIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'error':
        return <CloudOff className="h-4 w-4" />
      default: // idle = synced
        return <Cloud className="h-4 w-4" />
    }
  }

  const getColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'var(--gk-green)'
      case 'error':
        return '#ef4444' // red-500
      default:
        return 'var(--stone)'
    }
  }

  const getTooltipContent = () => {
    if (syncStatus === 'error' && syncError) {
      return `Sync error: ${syncError}`
    }
    if (syncStatus === 'syncing') {
      return 'Syncing...'
    }
    if (lastSyncedAt) {
      const timeAgo = formatTimeAgo(lastSyncedAt)
      return `Synced ${timeAgo}`
    }
    return 'Synced'
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            style={{ color: getColor() }}
            aria-label={getTooltipContent()}
          >
            {getIcon()}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md shadow-md"
            sideOffset={5}
          >
            {getTooltipContent()}
            <Tooltip.Arrow className="fill-slate-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `${hours}h ago`
  }
  const days = Math.floor(seconds / 86400)
  return `${days}d ago`
}
