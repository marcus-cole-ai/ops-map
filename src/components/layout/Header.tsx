'use client'

import { useOpsMapStore } from '@/store'
import { Download, Plus } from 'lucide-react'

interface HeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  showExport?: boolean
  onExport?: () => void
}

export function Header({ title, description, action, showExport, onExport }: HeaderProps) {
  const company = useOpsMapStore((state) => state.company)

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showExport && onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        )}
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
