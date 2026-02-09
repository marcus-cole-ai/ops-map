'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { ExportButton } from '@/components/ExportButton'
import { useOpsMapStore } from '@/store'
import { ArrowLeft, Plus, MoreHorizontal, Trash2, Edit2, AlertCircle, Link as LinkIcon } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function WorkflowDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  const workflows = useOpsMapStore((state) => state.workflows)
  const phases = useOpsMapStore((state) => state.phases)
  const steps = useOpsMapStore((state) => state.steps)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  
  const addPhase = useOpsMapStore((state) => state.addPhase)
  const updatePhase = useOpsMapStore((state) => state.updatePhase)
  const deletePhase = useOpsMapStore((state) => state.deletePhase)
  const addStep = useOpsMapStore((state) => state.addStep)
  const updateStep = useOpsMapStore((state) => state.updateStep)
  const deleteStep = useOpsMapStore((state) => state.deleteStep)
  const linkActivityToStep = useOpsMapStore((state) => state.linkActivityToStep)
  const unlinkActivityFromStep = useOpsMapStore((state) => state.unlinkActivityFromStep)
  const getActivitiesForStep = useOpsMapStore((state) => state.getActivitiesForStep)
  const addCoreActivity = useOpsMapStore((state) => state.addCoreActivity)

  const workflow = workflows.find(w => w.id === id)
  const workflowPhases = phases.filter(p => p.workflowId === id).sort((a, b) => a.orderIndex - b.orderIndex)

  // Modal states
  const [showAddPhase, setShowAddPhase] = useState(false)
  const [showAddStep, setShowAddStep] = useState<string | null>(null)
  const [showLinkActivity, setShowLinkActivity] = useState<string | null>(null)
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null)
  const [editingPhase, setEditingPhase] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<string | null>(null)
  
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  if (!workflow) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">Workflow not found</h2>
          <Link href="/workflows" className="mt-2 text-sm text-blue-600 hover:underline">
            Back to workflows
          </Link>
        </div>
      </div>
    )
  }

  const handleAddPhase = () => {
    if (newName.trim()) {
      addPhase(id, newName.trim())
      setNewName('')
      setShowAddPhase(false)
    }
  }

  const handleAddStep = (phaseId: string) => {
    if (newName.trim()) {
      addStep(phaseId, newName.trim())
      setNewName('')
      setShowAddStep(null)
    }
  }

  const handleUpdatePhase = (phaseId: string) => {
    if (newName.trim()) {
      updatePhase(phaseId, { name: newName.trim() })
      setNewName('')
      setEditingPhase(null)
    }
  }

  const handleUpdateStep = (stepId: string) => {
    if (newName.trim()) {
      updateStep(stepId, { name: newName.trim() })
      setNewName('')
      setEditingStep(null)
    }
  }

  const handleAddAndLinkActivity = (stepId: string) => {
    if (newName.trim()) {
      const activity = addCoreActivity(newName.trim(), newDescription.trim() || undefined)
      linkActivityToStep(stepId, activity.id)
      setNewName('')
      setNewDescription('')
      setShowAddActivity(null)
    }
  }

  // Get activities not already linked to this step
  const getUnlinkedActivities = (stepId: string) => {
    const linkedIds = getActivitiesForStep(stepId).map(a => a.id)
    return coreActivities.filter(a => !linkedIds.includes(a.id))
  }

  return (
    <div>
      <Header
        title={workflow.name}
        description={workflow.description || 'Workflow phases and steps'}
        extraActions={<ExportButton targetId="workflow-content" filename={`workflow-${workflow.name.toLowerCase().replace(/\s+/g, '-')}`} title={workflow.name} />}
      />

      <div className="p-6" id="workflow-content">
        {/* Back link */}
        <Link
          href="/workflows"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workflows
        </Link>

        {/* Phases as columns */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {workflowPhases.map((phase) => {
            const phaseSteps = steps.filter(s => s.phaseId === phase.id).sort((a, b) => a.orderIndex - b.orderIndex)
            const hasGap = phaseSteps.length === 0

            return (
              <div
                key={phase.id}
                className="flex-shrink-0 w-80 rounded-xl border border-slate-200 bg-slate-50"
              >
                {/* Phase Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{phase.name}</h3>
                    {hasGap && (
                      <span title="No steps">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      </span>
                    )}
                  </div>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="p-1 hover:bg-slate-100 rounded">
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="min-w-[140px] bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-50">
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none"
                          onClick={() => {
                            setNewName(phase.name)
                            setEditingPhase(phase.id)
                          }}
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                          onClick={() => deletePhase(phase.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>

                {/* Steps */}
                <div className="p-3 space-y-3">
                  {phaseSteps.map((step) => {
                    const stepActivities = getActivitiesForStep(step.id)
                    
                    return (
                      <div
                        key={step.id}
                        className="rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-slate-800">{step.name}</span>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="p-1 hover:bg-slate-100 rounded">
                                <MoreHorizontal className="h-3 w-3 text-slate-400" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content className="min-w-[140px] bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-50">
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none"
                                  onClick={() => {
                                    setNewName(step.name)
                                    setEditingStep(step.id)
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" /> Edit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                                  onClick={() => deleteStep(step.id)}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                        
                        {/* Activities */}
                        {stepActivities.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {stepActivities.map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded px-2 py-1"
                              >
                                <span className="truncate">{activity.name}</span>
                                <button
                                  onClick={() => unlinkActivityFromStep(step.id, activity.id)}
                                  className="p-0.5 text-slate-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Link activity button */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowLinkActivity(step.id)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs text-emerald-600 hover:bg-emerald-50 rounded py-1"
                          >
                            <LinkIcon className="h-3 w-3" />
                            Link
                          </button>
                          <button
                            onClick={() => setShowAddActivity(step.id)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-600 hover:bg-blue-50 rounded py-1"
                          >
                            <Plus className="h-3 w-3" />
                            New
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Add Step button */}
                  <button
                    onClick={() => setShowAddStep(phase.id)}
                    className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg border-2 border-dashed border-slate-200 hover:border-emerald-300"
                  >
                    <Plus className="h-4 w-4" />
                    Add Step
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add Phase Column */}
          <button
            onClick={() => setShowAddPhase(true)}
            className="flex-shrink-0 w-80 rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-colors min-h-[200px]"
          >
            <Plus className="h-8 w-8" />
            <span className="font-medium">Add Phase</span>
          </button>
        </div>
      </div>

      {/* Add Phase Modal */}
      <Modal
        open={showAddPhase}
        onClose={() => {
          setShowAddPhase(false)
          setNewName('')
        }}
        title="Add Phase"
        description="Phases are major stages in your workflow — like columns in a Kanban board."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Lead, Discovery, Proposal, Production"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowAddPhase(false); setNewName('') }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={handleAddPhase} disabled={!newName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">Add Phase</button>
          </div>
        </div>
      </Modal>

      {/* Add Step Modal */}
      <Modal
        open={showAddStep !== null}
        onClose={() => { setShowAddStep(null); setNewName('') }}
        title="Add Step"
        description="Steps are specific tasks within a phase."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Initial contact, Send proposal"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowAddStep(null); setNewName('') }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => showAddStep && handleAddStep(showAddStep)} disabled={!newName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">Add Step</button>
          </div>
        </div>
      </Modal>

      {/* Edit Phase Modal */}
      <Modal
        open={editingPhase !== null}
        onClose={() => { setEditingPhase(null); setNewName('') }}
        title="Edit Phase"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setEditingPhase(null); setNewName('') }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => editingPhase && handleUpdatePhase(editingPhase)} disabled={!newName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">Save</button>
          </div>
        </div>
      </Modal>

      {/* Edit Step Modal */}
      <Modal
        open={editingStep !== null}
        onClose={() => { setEditingStep(null); setNewName('') }}
        title="Edit Step"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setEditingStep(null); setNewName('') }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => editingStep && handleUpdateStep(editingStep)} disabled={!newName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">Save</button>
          </div>
        </div>
      </Modal>

      {/* Link Activity Modal */}
      <Modal
        open={showLinkActivity !== null}
        onClose={() => setShowLinkActivity(null)}
        title="Link Existing Activity"
        description="Select an activity from your function chart to link to this step."
      >
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {showLinkActivity && getUnlinkedActivities(showLinkActivity).length > 0 ? (
            getUnlinkedActivities(showLinkActivity).map((activity) => (
              <button
                key={activity.id}
                onClick={() => {
                  linkActivityToStep(showLinkActivity, activity.id)
                  setShowLinkActivity(null)
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-100"
              >
                {activity.name}
              </button>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              No activities available to link. Create one first in your Function Chart.
            </p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => setShowLinkActivity(null)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Close</button>
        </div>
      </Modal>

      {/* Add New Activity Modal */}
      <Modal
        open={showAddActivity !== null}
        onClose={() => { setShowAddActivity(null); setNewName(''); setNewDescription('') }}
        title="Create & Link Activity"
        description="Create a new core activity and link it to this step."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Send follow-up email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowAddActivity(null); setNewName(''); setNewDescription('') }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => showAddActivity && handleAddAndLinkActivity(showAddActivity)} disabled={!newName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">Create & Link</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
