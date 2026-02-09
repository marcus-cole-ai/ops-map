'use client'

import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { Keyboard } from 'lucide-react'

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open search' },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar (coming soon)' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['G', 'F'], description: 'Go to Function Chart' },
  { keys: ['G', 'W'], description: 'Go to Workflows' },
  { keys: ['G', 'A'], description: 'Go to Activities' },
  { keys: ['G', 'G'], description: 'Go to Gap Analysis' },
  { keys: ['G', 'H'], description: 'Go to Home' },
]

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let gPressed = false
    let gTimeout: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // ? to open shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen(true)
        return
      }

      // G + letter navigation
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        gPressed = true
        gTimeout = setTimeout(() => { gPressed = false }, 500)
        return
      }

      if (gPressed) {
        gPressed = false
        clearTimeout(gTimeout)
        
        switch (e.key.toLowerCase()) {
          case 'f':
            window.location.href = '/function-chart'
            break
          case 'w':
            window.location.href = '/workflows'
            break
          case 'a':
            window.location.href = '/activities'
            break
          case 'g':
            window.location.href = '/gaps'
            break
          case 'h':
            window.location.href = '/'
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="h-4 w-4" />
        <span className="hidden sm:inline">Shortcuts</span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Keyboard Shortcuts"
        description="Navigate faster with these shortcuts"
      >
        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
            >
              <span className="text-sm text-slate-600">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-1 text-xs font-mono bg-slate-100 border border-slate-200 rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
