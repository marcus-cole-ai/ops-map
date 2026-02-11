'use client'

import { useState, use } from 'react'
import { useOpsMapStore } from '@/store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  X
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatusDropdown } from '@/components/ui/StatusDropdown'
import { DraftBanner } from '@/components/ui/DraftBanner'
import { PublishConfirmModal } from '@/components/modals/PublishConfirmModal'
import { ActivitySearchModal } from '@/components/modals/ActivitySearchModal'
import { VideoUrlInput } from '@/components/ui/VideoUrlInput'
import { VideoEmbed } from '@/components/ui/VideoEmbed'
import type { CoreActivity, Status } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function WorkflowDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const {
    workflows,
    phases,
    steps,
    setWorkflowStatus,
    publishWorkflow,
    addPhase,
    updatePhase,
    deletePhase,
    addStep,
    updateStep,
    deleteStep,
    getActivitiesForStep,
    linkActivityToStep,
    unlinkActivityFromStep,
    people,
    roles,
    functions,
    subFunctions,
    subFunctionActivities,
  } = useOpsMapStore()
  const router = useRouter()

  const workflow = workflows.find((w) => w.id === id)
  const workflowPhases = phases
    .filter((p) => p.workflowId === id)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [showAddPhase, setShowAddPhase] = useState(false)
  const [showAddStep, setShowAddStep] = useState<string | null>(null)
  const [editingPhase, setEditingPhase] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [showLinkActivity, setShowLinkActivity] = useState<string | null>(null)
  const [showActivityDetail, setShowActivityDetail] = useState<CoreActivity | null>(null)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: 'var(--cream)' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Workflow not found
          </h2>
          <Link
            href="/workflows"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
            style={{ background: 'var(--gk-green)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workflows
          </Link>
        </div>
      </div>
    )
  }

  const getStepsForPhase = (phaseId: string) => {
    return steps
      .filter((s) => s.phaseId === phaseId)
      .sort((a, b) => a.orderIndex - b.orderIndex)
  }

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const handleAddPhase = () => {
    if (!newName.trim()) return
    addPhase(id, newName.trim())
    setNewName('')
    setShowAddPhase(false)
  }

  const handleAddStep = (phaseId: string) => {
    if (!newName.trim()) return
    addStep(phaseId, newName.trim())
    setNewName('')
    setShowAddStep(null)
  }

  const handleUpdatePhase = (phaseId: string) => {
    if (!newName.trim()) return
    updatePhase(phaseId, { name: newName.trim() })
    setNewName('')
    setEditingPhase(null)
  }

  const handleUpdateStep = (stepId: string) => {
    if (!newName.trim()) return
    updateStep(stepId, { name: newName.trim() })
    setNewName('')
    setEditingStep(null)
  }

  const getAllowedTransitions = (status: Status): Status[] => {
    if (status === 'gap') return ['draft', 'archived']
    if (status === 'draft') return ['active', 'archived']
    if (status === 'active') return ['draft', 'archived']
    return ['draft']
  }

  const resolveActivityBreadcrumb = (activityId: string) => {
    const links = subFunctionActivities.filter(link => link.coreActivityId === activityId)
    if (links.length === 0) return 'No function linkage yet'

    const first = links[0]
    const subFunction = subFunctions.find(sf => sf.id === first.subFunctionId)
    if (!subFunction) return 'No function linkage yet'

    const fn = functions.find(item => item.id === subFunction.functionId)
    if (!fn) return subFunction.name

    return `${fn.name} > ${subFunction.name}`
  }

  const handleStatusChange = (status: Status) => {
    if (status === 'active') {
      setPendingStatus('active')
      setShowPublishConfirm(true)
      return
    }
    setWorkflowStatus(workflow.id, status)
  }

  return (
    <div className="flex flex-col min-h-full" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6" style={{ background: 'var(--gk-charcoal)' }}>
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/workflows"
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{workflow.name}</h1>
              <StatusBadge status={workflow.status} size="md" />
            </div>
            {workflow.description && (
              <p className="text-sm mt-1" style={{ color: 'var(--gk-green-light)' }}>
                {workflow.description}
              </p>
            )}
          </div>
          <StatusDropdown
            currentStatus={workflow.status}
            allowedTransitions={getAllowedTransitions(workflow.status)}
            onChange={handleStatusChange}
          />
          <button
            onClick={() => setShowAddPhase(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors"
            style={{ background: 'var(--gk-green)' }}
          >
            <Plus className="h-4 w-4" />
            Add Phase
          </button>
        </div>
      </div>

      {/* Workflow Content - Vertical Phases */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        {workflow.status === 'draft' && (
          <div className="mb-6">
            <DraftBanner onPublish={() => {
              setPendingStatus('active')
              setShowPublishConfirm(true)
            }} />
          </div>
        )}
        {workflowPhases.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--mint)' }}
              >
                <Plus className="h-8 w-8" style={{ color: 'var(--gk-green)' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Start Building Your Workflow
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Phases represent major stages in your workflow. Add phases like Discovery, Proposal, Production, etc.
              </p>
              <button
                onClick={() => setShowAddPhase(true)}
                className="px-6 py-3 rounded-lg font-medium text-white"
                style={{ background: 'var(--gk-green)' }}
              >
                Add Your First Phase
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {workflowPhases.map((phase, phaseIndex) => {
              const phaseSteps = getStepsForPhase(phase.id)
              const isLastPhase = phaseIndex === workflowPhases.length - 1

              return (
                <div key={phase.id}>
                  {/* Phase Card */}
                  <div 
                    className="rounded-lg overflow-hidden"
                    style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
                  >
                    {/* Phase Header */}
                    <div 
                      className="px-6 py-4 flex items-center gap-4"
                      style={{ background: 'var(--gk-charcoal)' }}
                    >
                      <span 
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--gk-green)' }}
                      >
                        Phase {phaseIndex + 1}
                      </span>
                      <h3 className="flex-1 text-lg font-semibold text-white">
                        {phase.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingPhase(phase.id)
                            setNewName(phase.name)
                          }}
                          className="p-2 rounded hover:bg-white/10 transition-colors"
                        >
                          <Edit className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() => deletePhase(phase.id)}
                          className="p-2 rounded hover:bg-white/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Phase Body - Steps */}
                    <div className="p-6">
                      {phaseSteps.length === 0 ? (
                        <p className="text-sm italic mb-4" style={{ color: 'var(--text-muted)' }}>
                          No steps in this phase yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {phaseSteps.map((step, stepIndex) => {
                            const isExpanded = expandedSteps.has(step.id)
                            const stepActivities = getActivitiesForStep(step.id)
                            const isLastStep = stepIndex === phaseSteps.length - 1

                            return (
                              <div key={step.id}>
                                {/* Step Header */}
                                <div 
                                  className="flex items-center gap-3 mb-2 cursor-pointer"
                                  onClick={() => toggleStep(step.id)}
                                >
                                  <span 
                                    className="text-xs font-semibold px-2 py-1 rounded"
                                    style={{ 
                                      background: 'var(--mint)', 
                                      color: 'var(--gk-green-dark)' 
                                    }}
                                  >
                                    {phaseIndex + 1}.{stepIndex + 1}
                                  </span>
                                  <span 
                                    className="flex-1 font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {step.name}
                                  </span>
                                  <span 
                                    className="text-xs px-2 py-1 rounded"
                                    style={{ 
                                      background: stepActivities.length > 0 ? 'var(--mint)' : 'var(--sand)',
                                      color: stepActivities.length > 0 ? 'var(--gk-green-dark)' : 'var(--text-muted)'
                                    }}
                                  >
                                    {stepActivities.length} activities
                                  </span>
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                  )}
                                </div>

                                {/* Step Content - Activities */}
                                {isExpanded && (
                                  <div 
                                    className="ml-8 mb-4 p-4 rounded-lg"
                                    style={{ background: 'var(--cream-light)' }}
                                  >
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                                        Linked Activities
                                      </p>
                                      {stepActivities.length === 0 ? (
                                        <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                                          No activities linked to this step
                                        </p>
                                      ) : (
                                        <div className="space-y-2">
                                          {stepActivities.map((activity) => (
                                            <div
                                              key={activity.id}
                                              role="button"
                                              tabIndex={0}
                                              onClick={() => setShowActivityDetail(activity)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                  e.preventDefault()
                                                  setShowActivityDetail(activity)
                                                }
                                              }}
                                              className="w-full text-left px-3 py-2 rounded-lg border flex items-center gap-3 transition-colors hover:bg-white cursor-pointer"
                                              style={{ borderColor: 'var(--stone)', background: 'var(--white)' }}
                                            >
                                              <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                                    {activity.name}
                                                  </span>
                                                  <StatusBadge status={activity.status} />
                                                </div>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                  {resolveActivityBreadcrumb(activity.id)}
                                                </p>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  unlinkActivityFromStep(step.id, activity.id)
                                                }}
                                                className="p-1.5 rounded-md transition-colors hover:bg-red-100"
                                                aria-label="Unlink activity"
                                                title="Unlink activity"
                                              >
                                                <X className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* SOP Video */}
                                    <div 
                                      className="mt-3 pt-3"
                                      style={{ borderTop: '1px solid var(--stone)' }}
                                      data-export-exclude="video"
                                    >
                                      <label 
                                        className="block text-xs font-medium mb-1"
                                        style={{ color: 'var(--text-muted)' }}
                                      >
                                        Training Video
                                      </label>
                                      <VideoUrlInput
                                        value={step.sopVideoUrl}
                                        onChange={(url, platform) => {
                                          updateStep(step.id, {
                                            sopVideoUrl: url || undefined,
                                            sopVideoType: platform || undefined,
                                          })
                                        }}
                                        helperText="Paste a Loom or Google Drive video link"
                                      />
                                      <div className="mt-3">
                                        <VideoEmbed url={step.sopVideoUrl} videoType={step.sopVideoType} />
                                      </div>
                                    </div>

                                    {/* Step Actions */}
                                    <div 
                                      className="flex items-center gap-2 mt-3 pt-3"
                                      style={{ borderTop: '1px solid var(--stone)' }}
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setShowLinkActivity(step.id)
                                        }}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                                        style={{ 
                                          background: 'var(--mint)', 
                                          color: 'var(--gk-green-dark)' 
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                        + Link Activity
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          router.push('/activities')
                                        }}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                                        style={{ 
                                          background: 'var(--white)', 
                                          color: 'var(--text-secondary)',
                                          border: '1px solid var(--stone)'
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                        + Create Activity
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setEditingStep(step.id)
                                          setNewName(step.name)
                                        }}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                                        style={{ 
                                          background: 'var(--cream)', 
                                          color: 'var(--text-secondary)' 
                                        }}
                                      >
                                        <Edit className="h-3 w-3" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          deleteStep(step.id)
                                        }}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-red-100"
                                        style={{ color: 'var(--text-muted)' }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Step Arrow (if not last step) */}
                                {!isLastStep && !isExpanded && (
                                  <div className="flex justify-center py-2">
                                    <div className="w-0.5 h-4 rounded" style={{ background: 'var(--stone)' }} />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Add Step Button */}
                      <button
                        onClick={() => setShowAddStep(phase.id)}
                        className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                        style={{ 
                          borderColor: 'var(--stone)', 
                          color: 'var(--text-muted)',
                          background: 'transparent'
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Step
                      </button>
                    </div>
                  </div>

                  {/* Phase Arrow (if not last phase) */}
                  {!isLastPhase && (
                    <div className="phase-arrow">
                      <div className="phase-arrow-line" />
                      <div className="phase-arrow-head" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add Phase at End */}
            <div className="mt-8">
              <button
                onClick={() => setShowAddPhase(true)}
                className="w-full px-6 py-4 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 font-medium transition-colors"
                style={{ 
                  borderColor: 'var(--stone)', 
                  color: 'var(--text-muted)',
                  background: 'var(--cream-light)'
                }}
              >
                <Plus className="h-5 w-5" />
                Add Phase
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Phase Modal */}
      <Modal
        isOpen={showAddPhase}
        onClose={() => {
          setShowAddPhase(false)
          setNewName('')
        }}
        title="Add Phase"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Phase Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Discovery, Proposal, Production"
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--white)',
                color: 'var(--text-primary)'
              }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowAddPhase(false)
                setNewName('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddPhase}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Add Phase
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Step Modal */}
      <Modal
        isOpen={!!showAddStep}
        onClose={() => {
          setShowAddStep(null)
          setNewName('')
        }}
        title="Add Step"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Step Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Schedule call, Send proposal"
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--white)',
                color: 'var(--text-primary)'
              }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && showAddStep && handleAddStep(showAddStep)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowAddStep(null)
                setNewName('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => showAddStep && handleAddStep(showAddStep)}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Add Step
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Phase Modal */}
      <Modal
        isOpen={!!editingPhase}
        onClose={() => {
          setEditingPhase(null)
          setNewName('')
        }}
        title="Edit Phase"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Phase Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--white)',
                color: 'var(--text-primary)'
              }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && editingPhase && handleUpdatePhase(editingPhase)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setEditingPhase(null)
                setNewName('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => editingPhase && handleUpdatePhase(editingPhase)}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Step Modal */}
      <Modal
        isOpen={!!editingStep}
        onClose={() => {
          setEditingStep(null)
          setNewName('')
        }}
        title="Edit Step"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Step Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--white)',
                color: 'var(--text-primary)'
              }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && editingStep && handleUpdateStep(editingStep)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setEditingStep(null)
                setNewName('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => editingStep && handleUpdateStep(editingStep)}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      <ActivitySearchModal
        isOpen={!!showLinkActivity}
        onClose={() => setShowLinkActivity(null)}
        linkedActivityIds={showLinkActivity ? getActivitiesForStep(showLinkActivity).map(a => a.id) : []}
        onLinkActivity={(activity) => {
          if (!showLinkActivity) return
          const isLinked = getActivitiesForStep(showLinkActivity).some(a => a.id === activity.id)
          if (isLinked) {
            unlinkActivityFromStep(showLinkActivity, activity.id)
            return
          }
          linkActivityToStep(showLinkActivity, activity.id)
        }}
        onCreateNewActivity={() => {
          setShowLinkActivity(null)
          router.push('/activities')
        }}
      />

      {/* Activity Detail Modal */}
      <Modal
        isOpen={!!showActivityDetail}
        onClose={() => setShowActivityDetail(null)}
        title={showActivityDetail?.name || 'Activity Detail'}
      >
        {showActivityDetail && (
          <div className="space-y-4">
            {showActivityDetail.description && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  Description
                </label>
                <p style={{ color: 'var(--text-secondary)' }}>{showActivityDetail.description}</p>
              </div>
            )}
            
            {/* Owner */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Owner
              </label>
              {showActivityDetail.ownerId ? (
                <p style={{ color: 'var(--text-primary)' }}>
                  {people.find(p => p.id === showActivityDetail.ownerId)?.name || 'Unknown'}
                </p>
              ) : (
                <p className="italic" style={{ color: 'var(--text-muted)' }}>Not assigned</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Role
              </label>
              {showActivityDetail.roleId ? (
                <p style={{ color: 'var(--text-primary)' }}>
                  {roles.find(r => r.id === showActivityDetail.roleId)?.name || 'Unknown'}
                </p>
              ) : (
                <p className="italic" style={{ color: 'var(--text-muted)' }}>Not assigned</p>
              )}
            </div>

            {showActivityDetail.notes && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  Notes
                </label>
                <p style={{ color: 'var(--text-secondary)' }}>{showActivityDetail.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-2">
              <Link
                href={`/activities?id=${showActivityDetail.id}`}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--cream)', color: 'var(--text-secondary)' }}
              >
                Edit Activity
              </Link>
              <button
                onClick={() => setShowActivityDetail(null)}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{ background: 'var(--gk-green)' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <PublishConfirmModal
        isOpen={showPublishConfirm}
        entityType="workflow"
        entityName={workflow.name}
        onCancel={() => {
          setShowPublishConfirm(false)
          setPendingStatus(null)
        }}
        onConfirm={() => {
          if (pendingStatus === 'active') {
            publishWorkflow(workflow.id)
          }
          setShowPublishConfirm(false)
          setPendingStatus(null)
        }}
      />
    </div>
  )
}
