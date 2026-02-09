'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useOpsMapStore } from '@/store'
import { Search, LayoutGrid, GitBranch, Activity, X, Command } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

interface SearchResult {
  type: 'function' | 'subfunction' | 'activity' | 'workflow' | 'phase'
  id: string
  name: string
  context?: string
  href: string
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const workflows = useOpsMapStore((state) => state.workflows)
  const phases = useOpsMapStore((state) => state.phases)

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery('')
    }
  }, [open])

  // Build search results
  const results: SearchResult[] = []
  const q = query.toLowerCase()

  if (q.length > 0) {
    // Search functions
    functions.filter(f => f.name.toLowerCase().includes(q)).forEach(f => {
      results.push({
        type: 'function',
        id: f.id,
        name: f.name,
        context: 'Function',
        href: '/function-chart',
      })
    })

    // Search sub-functions
    subFunctions.filter(sf => sf.name.toLowerCase().includes(q)).forEach(sf => {
      const func = functions.find(f => f.id === sf.functionId)
      results.push({
        type: 'subfunction',
        id: sf.id,
        name: sf.name,
        context: func ? `${func.name} → Sub-function` : 'Sub-function',
        href: '/function-chart',
      })
    })

    // Search activities
    coreActivities.filter(a => a.name.toLowerCase().includes(q)).forEach(a => {
      results.push({
        type: 'activity',
        id: a.id,
        name: a.name,
        context: 'Activity',
        href: '/activities',
      })
    })

    // Search workflows
    workflows.filter(w => w.name.toLowerCase().includes(q)).forEach(w => {
      results.push({
        type: 'workflow',
        id: w.id,
        name: w.name,
        context: 'Workflow',
        href: `/workflows/${w.id}`,
      })
    })

    // Search phases
    phases.filter(p => p.name.toLowerCase().includes(q)).forEach(p => {
      const workflow = workflows.find(w => w.id === p.workflowId)
      results.push({
        type: 'phase',
        id: p.id,
        name: p.name,
        context: workflow ? `${workflow.name} → Phase` : 'Phase',
        href: `/workflows/${p.workflowId}`,
      })
    })
  }

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'function':
      case 'subfunction':
        return <LayoutGrid className="h-4 w-4 text-blue-500" />
      case 'workflow':
      case 'phase':
        return <GitBranch className="h-4 w-4 text-emerald-500" />
      case 'activity':
        return <Activity className="h-4 w-4 text-violet-500" />
      default:
        return null
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-white rounded border border-slate-200">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Search Dialog */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[20%] translate-x-[-50%] w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            {/* Accessibility: visually hidden title for screen readers */}
            <Dialog.Title className="sr-only">Search</Dialog.Title>
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-200">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search functions, workflows, activities..."
                className="flex-1 text-sm outline-none placeholder:text-slate-400"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-100 rounded">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto">
              {query.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Start typing to search...
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="p-2">
                  {results.slice(0, 10).map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 text-left"
                    >
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{result.name}</p>
                        <p className="text-xs text-slate-500">{result.context}</p>
                      </div>
                    </button>
                  ))}
                  {results.length > 10 && (
                    <p className="p-3 text-xs text-slate-500 text-center">
                      +{results.length - 10} more results
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
