'use client'

import type { Status } from '@/types'

const STATUS_LABELS: Record<Status, string> = {
  gap: 'Gap',
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
}

interface StatusDropdownProps {
  currentStatus: Status
  onChange: (status: Status) => void
  allowedTransitions: Status[]
}

export function StatusDropdown({ currentStatus, onChange, allowedTransitions }: StatusDropdownProps) {
  const options = Array.from(new Set([currentStatus, ...allowedTransitions]))

  return (
    <select
      value={currentStatus}
      onChange={(e) => onChange(e.target.value as Status)}
      className="rounded-lg border px-3 py-1.5 text-sm font-medium"
      style={{
        borderColor: 'var(--stone)',
        background: 'var(--white)',
        color: 'var(--text-primary)',
      }}
      aria-label="Status"
    >
      {options.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  )
}
