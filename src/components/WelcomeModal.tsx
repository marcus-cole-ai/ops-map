'use client'

import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { useOpsMapStore } from '@/store'
import { LayoutGrid, GitBranch, Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function WelcomeModal() {
  const [open, setOpen] = useState(false)
  const functions = useOpsMapStore((state) => state.functions)
  const loadDemoData = useOpsMapStore((state) => state.loadDemoData)

  useEffect(() => {
    // Show welcome modal only on first visit (no data yet)
    const hasSeenWelcome = localStorage.getItem('opsmap-welcome-seen')
    if (!hasSeenWelcome && functions.length === 0) {
      setOpen(true)
    }
  }, [functions.length])

  const handleClose = () => {
    localStorage.setItem('opsmap-welcome-seen', 'true')
    setOpen(false)
  }

  const handleLoadDemo = () => {
    loadDemoData()
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Welcome to OpsMap! 👋"
      description="Map your business operations with function charts and workflows."
      className="max-w-xl"
    >
      <div className="space-y-6">
        {/* What is OpsMap */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
            <LayoutGrid className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-900">Function Chart</h4>
              <p className="text-sm text-slate-600">Define what happens in your business — functions, sub-functions, and core activities.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50">
            <GitBranch className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-900">Workflows</h4>
              <p className="text-sm text-slate-600">Map how work flows through your business — phases, steps, and linked activities.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-50">
            <Activity className="h-5 w-5 text-violet-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-900">Core Activities</h4>
              <p className="text-sm text-slate-600">The bridge between structure and process — assign owners, roles, and checklists.</p>
            </div>
          </div>
        </div>

        {/* Quick Start Options */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-medium text-slate-900 mb-3">How would you like to start?</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleLoadDemo}
              className="p-4 rounded-lg border-2 border-emerald-200 bg-emerald-50 text-left hover:border-emerald-400 transition-colors"
            >
              <div className="font-medium text-emerald-800">Load Demo Data</div>
              <p className="text-sm text-emerald-600 mt-1">See a sample construction company setup</p>
            </button>
            
            <Link
              href="/function-chart"
              onClick={handleClose}
              className="p-4 rounded-lg border-2 border-slate-200 bg-white text-left hover:border-blue-400 transition-colors"
            >
              <div className="font-medium text-slate-800">Start Fresh</div>
              <p className="text-sm text-slate-500 mt-1">Build your own from scratch</p>
            </Link>
          </div>
        </div>

        {/* Skip */}
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Skip for now
          </button>
        </div>
      </div>
    </Modal>
  )
}
