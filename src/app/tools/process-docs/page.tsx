'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import { FileText, Download, Copy, Check, ChevronDown, GitBranch } from 'lucide-react'
import Link from 'next/link'

export default function ProcessDocsPage() {
  const workflows = useOpsMapStore((state) => state.workflows)
  const phases = useOpsMapStore((state) => state.phases)
  const steps = useOpsMapStore((state) => state.steps)
  const getActivitiesForStep = useOpsMapStore((state) => state.getActivitiesForStep)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const people = useOpsMapStore((state) => state.people)
  const roles = useOpsMapStore((state) => state.roles)
  const company = useOpsMapStore((state) => state.company)

  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [format, setFormat] = useState<'detailed' | 'checklist'>('detailed')

  const workflow = workflows.find(w => w.id === selectedWorkflow)
  const workflowPhases = workflow 
    ? phases.filter(p => p.workflowId === workflow.id).sort((a, b) => a.orderIndex - b.orderIndex)
    : []

  // Generate process documentation
  const generateProcessDoc = () => {
    if (!workflow) return ''

    let doc = `STANDARD OPERATING PROCEDURE\n`
    doc += `${'='.repeat(60)}\n\n`
    doc += `Process: ${workflow.name}\n`
    doc += `Company: ${company?.name || 'Company Name'}\n`
    doc += `Version: 1.0\n`
    doc += `Last Updated: ${new Date().toLocaleDateString()}\n\n`

    if (workflow.description) {
      doc += `PURPOSE\n`
      doc += `${'-'.repeat(40)}\n`
      doc += `${workflow.description}\n\n`
    }

    doc += `PROCESS OVERVIEW\n`
    doc += `${'-'.repeat(40)}\n`
    doc += `This process consists of ${workflowPhases.length} phases:\n`
    workflowPhases.forEach((phase, i) => {
      doc += `  ${i + 1}. ${phase.name}\n`
    })
    doc += `\n`

    if (format === 'detailed') {
      doc += `DETAILED PROCEDURE\n`
      doc += `${'-'.repeat(40)}\n\n`

      workflowPhases.forEach((phase, phaseIndex) => {
        const phaseSteps = steps.filter(s => s.phaseId === phase.id).sort((a, b) => a.orderIndex - b.orderIndex)
        
        doc += `PHASE ${phaseIndex + 1}: ${phase.name.toUpperCase()}\n`
        doc += `${'─'.repeat(30)}\n\n`

        phaseSteps.forEach((step, stepIndex) => {
          const activities = getActivitiesForStep(step.id)
          
          doc += `Step ${phaseIndex + 1}.${stepIndex + 1}: ${step.name}\n`
          
          if (activities.length > 0) {
            doc += `\n  Activities:\n`
            activities.forEach(activity => {
              const owner = activity.ownerId ? people.find(p => p.id === activity.ownerId) : null
              const role = activity.roleId ? roles.find(r => r.id === activity.roleId) : null
              
              doc += `    □ ${activity.name}`
              if (owner || role) {
                doc += ` [${owner?.name || role?.name || ''}]`
              }
              doc += `\n`
              
              if (activity.description) {
                doc += `      ${activity.description}\n`
              }
            })
          }
          doc += `\n`
        })
        doc += `\n`
      })
    } else {
      // Checklist format
      doc += `PROCESS CHECKLIST\n`
      doc += `${'-'.repeat(40)}\n\n`

      workflowPhases.forEach((phase, phaseIndex) => {
        const phaseSteps = steps.filter(s => s.phaseId === phase.id).sort((a, b) => a.orderIndex - b.orderIndex)
        
        doc += `□ PHASE ${phaseIndex + 1}: ${phase.name}\n`

        phaseSteps.forEach((step, stepIndex) => {
          doc += `  □ ${step.name}\n`
          
          const activities = getActivitiesForStep(step.id)
          activities.forEach(activity => {
            doc += `    □ ${activity.name}\n`
          })
        })
        doc += `\n`
      })
    }

    doc += `---\n`
    doc += `Generated from OpsMap - ${new Date().toLocaleDateString()}\n`

    return doc
  }

  const processDoc = generateProcessDoc()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(processDoc)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([processDoc], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sop-${workflow?.name.toLowerCase().replace(/\s+/g, '-') || 'process'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Header
        title="Process Documentation"
        description="Generate SOPs and checklists from your workflows"
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {workflows.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <GitBranch className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No workflows defined</h3>
              <p className="mt-2 text-sm text-slate-500">
                Create workflows with phases and steps to generate process documentation.
              </p>
              <Link
                href="/workflows"
                className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Create Workflow
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workflow Selection */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Select a Workflow</h3>
                
                <div className="relative mb-4">
                  <select
                    value={selectedWorkflow}
                    onChange={(e) => setSelectedWorkflow(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Choose a workflow...</option>
                    {workflows.map(wf => {
                      const phaseCount = phases.filter(p => p.workflowId === wf.id).length
                      return (
                        <option key={wf.id} value={wf.id}>
                          {wf.name} ({phaseCount} phases)
                        </option>
                      )
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>

                {/* Format Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormat('detailed')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        format === 'detailed'
                          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                      }`}
                    >
                      Detailed SOP
                    </button>
                    <button
                      onClick={() => setFormat('checklist')}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        format === 'checklist'
                          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                      }`}
                    >
                      Checklist
                    </button>
                  </div>
                </div>

                {workflow && (
                  <div className="mt-6">
                    <h4 className="font-medium text-slate-700 mb-2">Workflow Summary</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      {workflow.description || 'No description provided.'}
                    </p>

                    <h4 className="font-medium text-slate-700 mb-2">
                      Phases ({workflowPhases.length})
                    </h4>
                    <div className="space-y-2">
                      {workflowPhases.map((phase, i) => {
                        const phaseSteps = steps.filter(s => s.phaseId === phase.id)
                        return (
                          <div key={phase.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-700">
                              {i + 1}. {phase.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {phaseSteps.length} steps
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Generated Output */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Generated Documentation</h3>
                  {selectedWorkflow && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  )}
                </div>

                {!selectedWorkflow ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                    Select a workflow to generate documentation
                  </div>
                ) : (
                  <pre className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap font-mono h-[500px] overflow-y-auto">
                    {processDoc}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
