'use client'

import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { useOpsMapStore } from '@/store'
import { LayoutGrid, GitBranch, Activity, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { TEMPLATES } from '@/lib/templates'

export function WelcomeModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'intro' | 'templates'>('intro')
  const functions = useOpsMapStore((state) => state.functions)
  const loadDemoData = useOpsMapStore((state) => state.loadDemoData)
  const loadTemplate = useOpsMapStore((state) => state.loadTemplate)

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
    setStep('intro')
  }

  const handleSelectTemplate = (templateId: string) => {
    loadTemplate(templateId)
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 'intro' ? "Welcome to OpsMap! 👋" : "Choose a Template"}
      description={step === 'intro' 
        ? "Map your business operations with function charts and workflows."
        : "Start with an industry template or build from scratch."
      }
      className="max-w-xl"
    >
      {step === 'intro' ? (
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
            <div className="space-y-3">
              <button
                onClick={() => setStep('templates')}
                className="w-full p-4 rounded-lg border-2 border-blue-200 bg-blue-50 text-left hover:border-blue-400 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-blue-800 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Start with a Template
                  </div>
                  <p className="text-sm text-blue-600 mt-1">Choose from industry-specific templates</p>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-400" />
              </button>
              
              <button
                onClick={() => {
                  loadDemoData()
                  handleClose()
                }}
                className="w-full p-4 rounded-lg border-2 border-emerald-200 bg-emerald-50 text-left hover:border-emerald-400 transition-colors"
              >
                <div className="font-medium text-emerald-800">Load Demo Data</div>
                <p className="text-sm text-emerald-600 mt-1">See a fully built example</p>
              </button>
              
              <Link
                href="/function-chart"
                onClick={handleClose}
                className="block w-full p-4 rounded-lg border-2 border-slate-200 bg-white text-left hover:border-slate-400 transition-colors"
              >
                <div className="font-medium text-slate-800">Start from Scratch</div>
                <p className="text-sm text-slate-500 mt-1">Build your own from a blank canvas</p>
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
      ) : (
        <div className="space-y-4">
          {/* Template List */}
          <div className="space-y-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="w-full p-4 rounded-lg border-2 border-slate-200 bg-white text-left hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{template.name}</div>
                    <p className="text-sm text-slate-500 mt-0.5">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{template.data.functions.length} functions</span>
                      <span>{template.data.workflows.length} workflow{template.data.workflows.length !== 1 ? 's' : ''}</span>
                      <span>{template.data.roles.length} roles</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Back button */}
          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep('intro')}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ← Back
            </button>
            <button
              onClick={handleClose}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
