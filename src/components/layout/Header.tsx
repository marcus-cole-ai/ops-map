'use client'

import { Plus } from 'lucide-react'
import { ReactNode } from 'react'

interface HeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  extraActions?: ReactNode
}

export function Header({ title, description, action, extraActions }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {extraActions}
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {action.label}
          </button>
        )}
      </div>
    </header>
  )
}
