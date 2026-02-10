'use client'

import { useState } from 'react'
import { useOpsMapStore } from '@/store'
import Link from 'next/link'
import { Plus, GitBranch, ArrowRight, Edit, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Status } from '@/types'

export default function WorkflowsPage() {
  const {
    filteredWorkflows: getFilteredWorkflows,
    statusFilter,
    setStatusFilter,
    phases,
    steps,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
  } = useOpsMapStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const statusFilteredWorkflows = getFilteredWorkflows()

  const statusOptions = [
    { label: 'All', value: 'all' as const },
    { label: 'Gap', value: 'gap' as const },
    { label: 'Draft', value: 'draft' as const },
    { label: 'Active', value: 'active' as const },
    { label: 'Archived', value: 'archived' as const },
  ]

  const selectedStatusFilter = statusFilter.length === 1
    ? statusFilter[0]
    : statusFilter.includes('gap') && statusFilter.includes('draft') && statusFilter.includes('active')
      ? 'all'
      : 'all'

  const handleStatusFilterChange = (value: 'all' | Status) => {
    if (value === 'all') {
      setStatusFilter(['gap', 'draft', 'active'])
    } else {
      setStatusFilter([value])
    }
  }

  const handleAddWorkflow = () => {
    if (!newName.trim()) return
    addWorkflow(newName.trim(), newDescription.trim() || undefined)
    setNewName('')
    setNewDescription('')
    setShowAddModal(false)
  }

  const handleUpdateWorkflow = (id: string) => {
    if (!newName.trim()) return
    updateWorkflow(id, { name: newName.trim(), description: newDescription.trim() || undefined })
    setNewName('')
    setNewDescription('')
    setEditingWorkflow(null)
  }

  const getWorkflowStats = (workflowId: string) => {
    const workflowPhases = phases.filter((p) => p.workflowId === workflowId)
    const phaseIds = workflowPhases.map((p) => p.id)
    const workflowSteps = steps.filter((s) => phaseIds.includes(s.phaseId))
    return {
      phases: workflowPhases.length,
      steps: workflowSteps.length,
    }
  }

  return (
    <div className="min-h-full p-8" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Workflows
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Document your key processes and procedures
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedStatusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | Status)}
            className="rounded-lg border px-3 py-2 text-sm font-semibold uppercase tracking-wide"
            style={{ 
              borderColor: 'var(--stone)', 
              background: 'var(--white)',
              color: 'var(--text-secondary)'
            }}
            aria-label="Filter workflows by status"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
            style={{ background: 'var(--gk-green)' }}
          >
            <Plus className="h-4 w-4" />
            Add Workflow
          </button>
        </div>
      </div>

      {/* Workflows Grid */}
      {statusFilteredWorkflows.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--mint)' }}
            >
              <GitBranch className="h-8 w-8" style={{ color: 'var(--gk-green)' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Workflows Yet
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Workflows document how work flows through your organization. Start with your most important process.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-lg font-medium text-white"
              style={{ background: 'var(--gk-green)' }}
            >
              Create Your First Workflow
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statusFilteredWorkflows.map((workflow) => {
            const stats = getWorkflowStats(workflow.id)
            const isGap = workflow.status === 'gap'
            return (
              <div
                key={workflow.id}
                className="rounded-xl overflow-hidden transition-all hover:shadow-md"
                style={{ 
                  background: isGap ? 'var(--cream-light)' : 'var(--white)', 
                  border: `1px ${isGap ? 'dashed' : 'solid'} var(--stone)` 
                }}
              >
                {/* Card Header */}
                <div 
                  className="px-5 py-4 flex items-start justify-between"
                  style={{ background: 'var(--gk-charcoal)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white truncate">
                        {workflow.name}
                      </h3>
                      <StatusBadge status={workflow.status} />
                    </div>
                    {workflow.description && (
                      <p 
                        className="text-sm mt-1 line-clamp-2"
                        style={{ color: 'var(--stone)' }}
                      >
                        {workflow.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingWorkflow(workflow.id)
                        setNewName(workflow.name)
                        setNewDescription(workflow.description || '')
                      }}
                      className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteWorkflow(workflow.id)
                      }}
                      className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {stats.phases}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Phases
                      </div>
                    </div>
                    <div 
                      className="w-px h-10"
                      style={{ background: 'var(--stone)' }}
                    />
                    <div>
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {stats.steps}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Steps
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/workflows/${workflow.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ 
                      background: 'var(--mint)', 
                      color: 'var(--gk-green-dark)' 
                    }}
                  >
                    View Workflow
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Workflow Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Workflow"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Workflow Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Client Journey, Sales Process, Production"
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--white)',
                color: 'var(--text-primary)'
              }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddWorkflow()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Description (optional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What does this workflow cover?"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border resize-none"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--white)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowAddModal(false)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddWorkflow}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Add Workflow
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Workflow Modal */}
      <Modal
        isOpen={!!editingWorkflow}
        onClose={() => {
          setEditingWorkflow(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Edit Workflow"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Workflow Name
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Description (optional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border resize-none"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--white)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setEditingWorkflow(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => editingWorkflow && handleUpdateWorkflow(editingWorkflow)}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
