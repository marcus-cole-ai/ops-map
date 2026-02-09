'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { useOpsMapStore } from '@/store'
import Link from 'next/link'
import { GitBranch, Plus, MoreHorizontal, Trash2, Edit2, ArrowRight } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export default function WorkflowsPage() {
  const workflows = useOpsMapStore((state) => state.workflows)
  const addWorkflow = useOpsMapStore((state) => state.addWorkflow)
  const updateWorkflow = useOpsMapStore((state) => state.updateWorkflow)
  const deleteWorkflow = useOpsMapStore((state) => state.deleteWorkflow)
  const phases = useOpsMapStore((state) => state.phases)

  const [showAddWorkflow, setShowAddWorkflow] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const handleAddWorkflow = () => {
    if (newName.trim()) {
      addWorkflow(newName.trim(), newDescription.trim() || undefined)
      setNewName('')
      setNewDescription('')
      setShowAddWorkflow(false)
    }
  }

  const handleUpdateWorkflow = (id: string) => {
    if (newName.trim()) {
      updateWorkflow(id, { name: newName.trim(), description: newDescription.trim() || undefined })
      setNewName('')
      setNewDescription('')
      setEditingWorkflow(null)
    }
  }

  const getPhaseCount = (workflowId: string) => {
    return phases.filter(p => p.workflowId === workflowId).length
  }

  return (
    <div>
      <Header
        title="Workflows"
        description="How work flows through your business — processes and steps"
        action={{
          label: 'Add Workflow',
          onClick: () => setShowAddWorkflow(true),
        }}
      />

      <div className="p-6">
        {workflows.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 p-3">
              <GitBranch className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No workflows yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Create your first workflow to map how work moves through your business.
            </p>
            <button
              onClick={() => setShowAddWorkflow(true)}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Create Your First Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => {
              const phaseCount = getPhaseCount(workflow.id)
              return (
                <div
                  key={workflow.id}
                  className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <GitBranch className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{workflow.name}</h3>
                        <p className="text-xs text-slate-500">{phaseCount} phases</p>
                      </div>
                    </div>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded transition-opacity">
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="min-w-[160px] bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-50">
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none"
                            onClick={() => {
                              setNewName(workflow.name)
                              setNewDescription(workflow.description || '')
                              setEditingWorkflow(workflow.id)
                            }}
                          >
                            <Edit2 className="h-4 w-4" /> Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                            onClick={() => deleteWorkflow(workflow.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                  
                  {workflow.description && (
                    <p className="mt-3 text-sm text-slate-500 line-clamp-2">{workflow.description}</p>
                  )}
                  
                  <Link
                    href={`/workflows/${workflow.id}`}
                    className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Open workflow
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )
            })}
            
            {/* Add Workflow Card */}
            <button
              onClick={() => setShowAddWorkflow(true)}
              className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50"
            >
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Plus className="h-5 w-5 text-slate-500" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">Add Workflow</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Add Workflow Modal */}
      <Modal
        open={showAddWorkflow}
        onClose={() => {
          setShowAddWorkflow(false)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Workflow"
        description="Workflows show how work moves through your business — like Lead to Project or Client Journey."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Client Journey, Project Delivery"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What does this workflow cover?"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowAddWorkflow(false)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWorkflow}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Workflow
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Workflow Modal */}
      <Modal
        open={editingWorkflow !== null}
        onClose={() => {
          setEditingWorkflow(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Edit Workflow"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditingWorkflow(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => editingWorkflow && handleUpdateWorkflow(editingWorkflow)}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
