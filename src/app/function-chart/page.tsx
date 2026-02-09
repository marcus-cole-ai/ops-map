'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { ExportButton } from '@/components/ExportButton'
import { useOpsMapStore } from '@/store'
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Trash2, Edit2, AlertCircle, LayoutGrid } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function FunctionChartPage() {
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const addFunction = useOpsMapStore((state) => state.addFunction)
  const updateFunction = useOpsMapStore((state) => state.updateFunction)
  const deleteFunction = useOpsMapStore((state) => state.deleteFunction)
  const addSubFunction = useOpsMapStore((state) => state.addSubFunction)
  const updateSubFunction = useOpsMapStore((state) => state.updateSubFunction)
  const deleteSubFunction = useOpsMapStore((state) => state.deleteSubFunction)
  const addCoreActivity = useOpsMapStore((state) => state.addCoreActivity)
  const linkActivityToSubFunction = useOpsMapStore((state) => state.linkActivityToSubFunction)
  const getActivitiesForSubFunction = useOpsMapStore((state) => state.getActivitiesForSubFunction)
  const unlinkActivityFromSubFunction = useOpsMapStore((state) => state.unlinkActivityFromSubFunction)

  const [expandedFunctions, setExpandedFunctions] = useState<Set<string>>(new Set())
  const [expandedSubFunctions, setExpandedSubFunctions] = useState<Set<string>>(new Set())
  
  // Modals
  const [showAddFunction, setShowAddFunction] = useState(false)
  const [showAddSubFunction, setShowAddSubFunction] = useState<string | null>(null)
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null)
  const [editingFunction, setEditingFunction] = useState<string | null>(null)
  const [editingSubFunction, setEditingSubFunction] = useState<string | null>(null)
  
  // Form state
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const toggleFunction = (id: string) => {
    const newSet = new Set(expandedFunctions)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedFunctions(newSet)
  }

  const toggleSubFunction = (id: string) => {
    const newSet = new Set(expandedSubFunctions)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedSubFunctions(newSet)
  }

  const handleAddFunction = () => {
    if (newName.trim()) {
      const func = addFunction(newName.trim(), newDescription.trim() || undefined)
      setExpandedFunctions(new Set([...expandedFunctions, func.id]))
      setNewName('')
      setNewDescription('')
      setShowAddFunction(false)
    }
  }

  const handleAddSubFunction = (functionId: string) => {
    if (newName.trim()) {
      const sub = addSubFunction(functionId, newName.trim(), newDescription.trim() || undefined)
      setExpandedSubFunctions(new Set([...expandedSubFunctions, sub.id]))
      setNewName('')
      setNewDescription('')
      setShowAddSubFunction(null)
    }
  }

  const handleAddActivity = (subFunctionId: string) => {
    if (newName.trim()) {
      const activity = addCoreActivity(newName.trim(), newDescription.trim() || undefined)
      linkActivityToSubFunction(subFunctionId, activity.id)
      setNewName('')
      setNewDescription('')
      setShowAddActivity(null)
    }
  }

  const handleUpdateFunction = (id: string) => {
    if (newName.trim()) {
      updateFunction(id, { name: newName.trim(), description: newDescription.trim() || undefined })
      setNewName('')
      setNewDescription('')
      setEditingFunction(null)
    }
  }

  const handleUpdateSubFunction = (id: string) => {
    if (newName.trim()) {
      updateSubFunction(id, { name: newName.trim(), description: newDescription.trim() || undefined })
      setNewName('')
      setNewDescription('')
      setEditingSubFunction(null)
    }
  }

  const sortedFunctions = [...functions].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div>
      <Header
        title="Function Chart"
        description="What happens in your business — structure and organization"
        extraActions={
          <div className="flex items-center gap-2">
            <Link
              href="/function-chart/visual"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <LayoutGrid className="h-4 w-4" />
              Visual View
            </Link>
            <ExportButton targetId="function-chart-content" filename="function-chart" title="Function Chart" />
          </div>
        }
        action={{
          label: 'Add Function',
          onClick: () => setShowAddFunction(true),
        }}
      />

      <div className="p-6" id="function-chart-content">
        {sortedFunctions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 p-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No functions yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Start by adding your first business function like Marketing, Sales, or Production.
            </p>
            <button
              onClick={() => setShowAddFunction(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Your First Function
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedFunctions.map((func) => {
              const funcSubFunctions = subFunctions
                .filter((sf) => sf.functionId === func.id)
                .sort((a, b) => a.orderIndex - b.orderIndex)
              const isExpanded = expandedFunctions.has(func.id)
              const hasGap = funcSubFunctions.length === 0

              return (
                <div
                  key={func.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                >
                  {/* Function Header */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleFunction(func.id)}
                  >
                    <button className="p-1 hover:bg-slate-200 rounded">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                      )}
                    </button>
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: func.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{func.name}</h3>
                      {func.description && (
                        <p className="text-sm text-slate-500">{func.description}</p>
                      )}
                    </div>
                    {hasGap && (
                      <div className="flex items-center gap-1 text-amber-500" title="No sub-functions">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}
                    <span className="text-sm text-slate-400">
                      {funcSubFunctions.length} sub-functions
                    </span>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-slate-200 rounded"
                        >
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="min-w-[160px] bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-50">
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none"
                            onClick={(e) => {
                              e.stopPropagation()
                              setNewName(func.name)
                              setNewDescription(func.description || '')
                              setEditingFunction(func.id)
                            }}
                          >
                            <Edit2 className="h-4 w-4" /> Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFunction(func.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>

                  {/* Sub-Functions */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50">
                      {funcSubFunctions.map((sub) => {
                        const activities = getActivitiesForSubFunction(sub.id)
                        const isSubExpanded = expandedSubFunctions.has(sub.id)
                        const subHasGap = activities.length === 0

                        return (
                          <div key={sub.id} className="border-b border-slate-100 last:border-b-0">
                            <div
                              className="flex items-center gap-3 p-3 pl-12 cursor-pointer hover:bg-slate-100"
                              onClick={() => toggleSubFunction(sub.id)}
                            >
                              <button className="p-1 hover:bg-slate-200 rounded">
                                {isSubExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-slate-400" />
                                )}
                              </button>
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-800">{sub.name}</h4>
                                {sub.description && (
                                  <p className="text-xs text-slate-500">{sub.description}</p>
                                )}
                              </div>
                              {subHasGap && (
                                <div className="flex items-center gap-1 text-amber-500" title="No activities">
                                  <AlertCircle className="h-4 w-4" />
                                </div>
                              )}
                              <span className="text-xs text-slate-400">
                                {activities.length} activities
                              </span>
                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 hover:bg-slate-200 rounded"
                                  >
                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                  </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content className="min-w-[160px] bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-50">
                                    <DropdownMenu.Item
                                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setNewName(sub.name)
                                        setNewDescription(sub.description || '')
                                        setEditingSubFunction(sub.id)
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4" /> Edit
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteSubFunction(sub.id)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" /> Delete
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            </div>

                            {/* Activities */}
                            {isSubExpanded && (
                              <div className="bg-white border-t border-slate-100">
                                {activities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="flex items-center gap-3 p-2 pl-20 text-sm text-slate-600 hover:bg-slate-50"
                                  >
                                    <div className="h-2 w-2 rounded-full bg-slate-300" />
                                    <span className="flex-1">{activity.name}</span>
                                    <button
                                      onClick={() => unlinkActivityFromSubFunction(sub.id, activity.id)}
                                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => setShowAddActivity(sub.id)}
                                  className="flex items-center gap-2 p-2 pl-20 text-sm text-blue-600 hover:bg-blue-50 w-full"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Activity
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      <button
                        onClick={() => setShowAddSubFunction(func.id)}
                        className="flex items-center gap-2 p-3 pl-12 text-sm text-blue-600 hover:bg-blue-50 w-full"
                      >
                        <Plus className="h-4 w-4" />
                        Add Sub-Function
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Function Modal */}
      <Modal
        open={showAddFunction}
        onClose={() => {
          setShowAddFunction(false)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Function"
        description="Functions are the main areas of your business like Marketing, Sales, or Production."
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
              placeholder="e.g., Marketing, Sales, Production"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              placeholder="Brief description of this function"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowAddFunction(false)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddFunction}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Function
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Sub-Function Modal */}
      <Modal
        open={showAddSubFunction !== null}
        onClose={() => {
          setShowAddSubFunction(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Sub-Function"
        description="Sub-functions break down a function into more specific areas."
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
              placeholder="e.g., Lead Generation, Lead Nurturing"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              placeholder="Brief description"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowAddSubFunction(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => showAddSubFunction && handleAddSubFunction(showAddSubFunction)}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Sub-Function
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal
        open={showAddActivity !== null}
        onClose={() => {
          setShowAddActivity(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Core Activity"
        description="Core activities are specific actions — use verbs like 'Send proposal' or 'Schedule call'."
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
              placeholder="e.g., Send follow-up email, Schedule discovery call"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              placeholder="Brief description"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowAddActivity(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => showAddActivity && handleAddActivity(showAddActivity)}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Activity
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Function Modal */}
      <Modal
        open={editingFunction !== null}
        onClose={() => {
          setEditingFunction(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Edit Function"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditingFunction(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => editingFunction && handleUpdateFunction(editingFunction)}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Sub-Function Modal */}
      <Modal
        open={editingSubFunction !== null}
        onClose={() => {
          setEditingSubFunction(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Edit Sub-Function"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditingSubFunction(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => editingSubFunction && handleUpdateSubFunction(editingSubFunction)}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
