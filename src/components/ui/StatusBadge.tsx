import type { Status } from '@/types'

const STATUS_STYLES: Record<Status, { label: string; color: string; icon: string }> = {
  gap: { label: 'Gap', color: 'text-gray-400 border-gray-300 bg-gray-50', icon: '○' },
  draft: { label: 'Draft', color: 'text-amber-500 border-amber-400 bg-amber-50', icon: '◐' },
  active: { label: 'Active', color: 'text-green-500 border-green-400 bg-green-50', icon: '●' },
  archived: { label: 'Archived', color: 'text-red-400 border-red-300 bg-red-50', icon: '⊘' },
}

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status]
  const sizeClasses = size === 'md' ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-0.5'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${sizeClasses} ${styles.color}`}
      aria-label={`Status: ${styles.label}`}
    >
      <span aria-hidden="true">{styles.icon}</span>
      <span>{styles.label}</span>
    </span>
  )
}
