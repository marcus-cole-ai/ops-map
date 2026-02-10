'use client'

import { useState } from 'react'
import { useOpsMapStore } from '@/store'
import { Plus, ChevronDown, ChevronRight, Edit, Trash2, Link as LinkIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatusDropdown } from '@/components/ui/StatusDropdown'
import { PublishConfirmModal } from '@/components/modals/PublishConfirmModal'
import type { CoreActivity, Status } from '@/types'

// Function colors following GrowthKits palette
const FUNCTION_COLORS = [
  '#7b9d76', // gk-green
  '#d4a5a5', // dusty-rose
  '#c4785a', // terracotta
  '#3d4f5f', // navy
  '#5a7a55', // gk-green-dark
  '#8b6b7b', // plum
  '#b8956e', // gold
  '#6b7280', // slate
]

export default function FunctionChartPage() {
  const {
    functions,
    subFunctions,
    addFunction,
    updateFunction,
    deleteFunction,
    addSubFunction,
    updateSubFunction,
    deleteSubFunction,
    setFunctionStatus,
    setSubFunctionStatus,
    getActivitiesForSubFunction,
    coreActivities,
    statusFilter,
    setStatusFilter,
    linkActivityToSubFunction,
    unlinkActivityFromSubFunction,
  } = useOpsMapStore()

  const [expandedSubFunctions, setExpandedSubFunctions] = useState<Set<string>>(new Set())
  const [showAddFunction, setShowAddFunction] = useState(false)
  const [showAddSubFunction, setShowAddSubFunction] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editingFunction, setEditingFunction] = useState<string | null>(null)
  const [editingSubFunction, setEditingSubFunction] = useState<string | null>(null)
  const [showActivityDetail, setShowActivityDetail] = useState<CoreActivity | null>(null)
  const [showLinkActivity, setShowLinkActivity] = useState<string | null>(null)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [pendingPublish, setPendingPublish] = useState<{ type: 'function' | 'sub-function'; id: string; name: string } | null>(null)

  const statusFilteredFunctions = functions.filter(f => statusFilter.includes(f.status))
  const sortedFunctions = [...statusFilteredFunctions].sort((a, b) => a.orderIndex - b.orderIndex)

  const toggleSubFunction = (id: string) => {
    const newExpanded = new Set(expandedSubFunctions)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSubFunctions(newExpanded)
  }

  const handleAddFunction = () => {
    if (!newName.trim()) return
    const func = addFunction(newName.trim(), newDescription.trim() || undefined)
    updateFunction(func.id, { color: FUNCTION_COLORS[functions.length % FUNCTION_COLORS.length] })
    setNewName('')
    setNewDescription('')
    setShowAddFunction(false)
  }

  const handleAddSubFunction = (functionId: string) => {
    if (!newName.trim()) return
    addSubFunction(functionId, newName.trim(), newDescription.trim() || undefined)
    setNewName('')
    setNewDescription('')
    setShowAddSubFunction(null)
  }

  const handleUpdateFunction = (id: string) => {
    if (!newName.trim()) return
    updateFunction(id, { name: newName.trim(), description: newDescription.trim() || undefined })
    setNewName('')
    setNewDescription('')
    setEditingFunction(null)
  }

  const handleUpdateSubFunction = (id: string) => {
    if (!newName.trim()) return
    updateSubFunction(id, { name: newName.trim(), description: newDescription.trim() || undefined })
    setNewName('')
    setNewDescription('')
    setEditingSubFunction(null)
  }

  const getSubFunctionsForFunction = (functionId: string) => {
    return subFunctions
      .filter((sf) => sf.functionId === functionId && statusFilter.includes(sf.status))
      .sort((a, b) => a.orderIndex - b.orderIndex)
  }

  const getAllowedTransitions = (status: Status): Status[] => {
    if (status === 'gap') return ['draft', 'archived']
    if (status === 'draft') return ['active', 'archived']
    if (status === 'active') return ['draft', 'archived']
    return ['draft']
  }

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

  const handleFunctionStatusChange = (funcId: string, name: string, status: Status) => {
    if (status === 'active') {
      setPendingPublish({ type: 'function', id: funcId, name })
      setShowPublishConfirm(true)
      return
    }
    setFunctionStatus(funcId, status)
  }

  const handleSubFunctionStatusChange = (subFunctionId: string, name: string, status: Status) => {
    if (status === 'active') {
      setPendingPublish({ type: 'sub-function', id: subFunctionId, name })
      setShowPublishConfirm(true)
      return
    }
    setSubFunctionStatus(subFunctionId, status)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6" style={{ background: 'var(--gk-charcoal)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Function Chart</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--gk-green-light)' }}>
              Your organizational structure • Scroll horizontally to view all functions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedStatusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | Status)}
              className="rounded-lg border px-3 py-2 text-sm font-semibold uppercase tracking-wide"
              style={{ 
                borderColor: 'rgba(255,255,255,0.3)', 
                background: 'rgba(255,255,255,0.1)',
                color: 'white'
              }}
              aria-label="Filter function chart by status"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddFunction(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ background: 'var(--gk-green)' }}
            >
              <Plus className="h-4 w-4" />
              Add Function
            </button>
          </div>
        </div>
        
        {/* Scroll hint */}
        <div className="scroll-hint mt-4">
          <span>Scroll horizontally to view all functions</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>

      {/* Horizontal Columns Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        {sortedFunctions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--mint)' }}
              >
                <Plus className="h-8 w-8" style={{ color: 'var(--gk-green)' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Start Building Your Function Chart
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Functions represent the major areas of your business. Add functions like Sales, Marketing, Production, Finance, etc.
              </p>
              <button
                onClick={() => setShowAddFunction(true)}
                className="px-6 py-3 rounded-lg font-medium text-white"
                style={{ background: 'var(--gk-green)' }}
              >
                Add Your First Function
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-5" style={{ minWidth: 'max-content', height: '100%' }}>
            {sortedFunctions.map((func, index) => {
              const funcSubFunctions = getSubFunctionsForFunction(func.id)
              const color = func.color || FUNCTION_COLORS[index % FUNCTION_COLORS.length]
              const isGap = func.status === 'gap'
              
              return (
                <div 
                  key={func.id} 
                  className="flex flex-col"
                  style={{ width: '300px', height: '100%', flexShrink: 0 }}
                >
                  {/* Function Header */}
                  <div 
                    className="rounded-t-2xl px-5 py-4 text-white"
                    style={{ background: color, border: isGap ? '2px dashed rgba(255,255,255,0.5)' : 'none' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{func.name}</h3>
                        <StatusBadge status={func.status} />
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusDropdown
                          currentStatus={func.status}
                          allowedTransitions={getAllowedTransitions(func.status)}
                          onChange={(status) => handleFunctionStatusChange(func.id, func.name, status)}
                        />
                        <button
                          onClick={() => {
                            setEditingFunction(func.id)
                            setNewName(func.name)
                            setNewDescription(func.description || '')
                          }}
                          className="p-1.5 rounded hover:bg-white/20 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFunction(func.id)}
                          className="p-1.5 rounded hover:bg-white/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm opacity-85">{funcSubFunctions.length} Sub-Functions</p>
                  </div>

                  {/* Sub-Functions List */}
                  <div 
                    className="flex-1 rounded-b-2xl p-3 overflow-y-auto"
                    style={{ 
                      background: 'var(--white)', 
                      border: `1px ${isGap ? 'dashed' : 'solid'} var(--stone)`,
                      borderTop: 'none',
                      minHeight: 0 
                    }}
                  >
                    {funcSubFunctions.map((subFunc, sfIndex) => {
                      const isExpanded = expandedSubFunctions.has(subFunc.id)
                      const activities = getActivitiesForSubFunction(subFunc.id).filter(a => statusFilter.includes(a.status))
                      const isGap = subFunc.status === 'gap'
                      
                      return (
                        <div 
                          key={subFunc.id}
                          className="mb-2 rounded-xl overflow-hidden"
                          style={{ 
                            border: `1px ${isGap ? 'dashed' : 'solid'} var(--stone)`,
                            background: isExpanded ? 'var(--cream-light)' : 'var(--cream)'
                          }}
                        >
                          {/* Sub-Function Header */}
                          <div 
                            className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-opacity-80 transition-colors"
                            style={{ background: 'var(--cream)' }}
                            onClick={() => toggleSubFunction(subFunc.id)}
                          >
                            <span 
                              className="text-xs font-semibold px-2 py-1 rounded text-white"
                              style={{ background: color }}
                            >
                              {sfIndex + 1}
                            </span>
                            <div className="flex-1 flex items-center gap-2">
                              <span 
                                className="text-sm font-medium"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {subFunc.name}
                              </span>
                              <StatusBadge status={subFunc.status} />
                            </div>
                            <StatusDropdown
                              currentStatus={subFunc.status}
                              allowedTransitions={getAllowedTransitions(subFunc.status)}
                              onChange={(status) => handleSubFunctionStatusChange(subFunc.id, subFunc.name, status)}
                            />
                            <div className="flex items-center gap-1">
                              <span 
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ 
                                  background: activities.length > 0 ? 'var(--mint)' : 'var(--sand)',
                                  color: activities.length > 0 ? 'var(--gk-green-dark)' : 'var(--text-muted)'
                                }}
                              >
                                {activities.length}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                              ) : (
                                <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                              )}
                            </div>
                          </div>

                          {/* Expanded Content - Activities */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2" style={{ background: 'var(--white)' }}>
                              {subFunc.description && (
                                <p 
                                  className="text-sm mb-3 pb-3"
                                  style={{ 
                                    color: 'var(--text-secondary)',
                                    borderBottom: '1px solid var(--stone)'
                                  }}
                                >
                                  {subFunc.description}
                                </p>
                              )}
                              
                              {/* Activities */}
                              <div className="space-y-2">
                                {activities.length === 0 ? (
                                  <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                                    No activities linked yet
                                  </p>
                                ) : (
                                  activities.map((activity) => (
                                    <div
                                      key={activity.id}
                                      className="activity-item cursor-pointer hover:border-l-4 flex items-center justify-between gap-2"
                                      style={{ 
                                        borderLeftColor: color,
                                        borderStyle: activity.status === 'gap' ? 'dashed' : 'solid'
                                      }}
                                      onClick={() => setShowActivityDetail(activity)}
                                    >
                                      <span>{activity.name}</span>
                                      <StatusBadge status={activity.status} />
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--stone)' }}>
                                <button
                                  onClick={() => setShowLinkActivity(subFunc.id)}
                                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                                  style={{ 
                                    background: 'var(--mint)', 
                                    color: 'var(--gk-green-dark)' 
                                  }}
                                >
                                  <LinkIcon className="h-3 w-3" />
                                  Link Activity
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSubFunction(subFunc.id)
                                    setNewName(subFunc.name)
                                    setNewDescription(subFunc.description || '')
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
                                  onClick={() => deleteSubFunction(subFunc.id)}
                                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-red-100"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Add Sub-Function Button */}
                    <button
                      onClick={() => setShowAddSubFunction(func.id)}
                      className="w-full mt-2 px-4 py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                      style={{ 
                        borderColor: 'var(--stone)', 
                        color: 'var(--text-muted)',
                        background: 'transparent'
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Sub-Function
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Add Function Column */}
            <div 
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-colors hover:border-solid"
              style={{ 
                width: '200px', 
                minHeight: '300px',
                borderColor: 'var(--stone)',
                background: 'var(--cream-light)'
              }}
              onClick={() => setShowAddFunction(true)}
            >
              <Plus className="h-8 w-8 mb-2" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Add Function
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Function Modal */}
      <Modal
        isOpen={showAddFunction}
        onClose={() => {
          setShowAddFunction(false)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Function"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Function Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Sales, Marketing, Production"
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
              placeholder="What does this function do?"
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
                setShowAddFunction(false)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddFunction}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Add Function
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Sub-Function Modal */}
      <Modal
        isOpen={!!showAddSubFunction}
        onClose={() => {
          setShowAddSubFunction(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Sub-Function"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Sub-Function Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Lead Generation, Customer Service"
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
              placeholder="What does this sub-function do?"
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
                setShowAddSubFunction(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => showAddSubFunction && handleAddSubFunction(showAddSubFunction)}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Add Sub-Function
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Function Modal */}
      <Modal
        isOpen={!!editingFunction}
        onClose={() => {
          setEditingFunction(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Edit Function"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Function Name
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
                setEditingFunction(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => editingFunction && handleUpdateFunction(editingFunction)}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Sub-Function Modal */}
      <Modal
        isOpen={!!editingSubFunction}
        onClose={() => {
          setEditingSubFunction(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Edit Sub-Function"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Sub-Function Name
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
                setEditingSubFunction(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => editingSubFunction && handleUpdateSubFunction(editingSubFunction)}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Link Activity Modal */}
      <Modal
        isOpen={!!showLinkActivity}
        onClose={() => setShowLinkActivity(null)}
        title="Link Core Activity"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Select a core activity to link to this sub-function.
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {coreActivities.filter(a => statusFilter.includes(a.status)).length === 0 ? (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                No core activities created yet. Create activities from the Core Activities page.
              </p>
            ) : (
              coreActivities.filter(a => statusFilter.includes(a.status)).map((activity) => {
                const isLinked = showLinkActivity
                  ? getActivitiesForSubFunction(showLinkActivity).some((a) => a.id === activity.id)
                  : false
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors"
                    style={{ 
                      borderColor: isLinked ? 'var(--gk-green)' : 'var(--stone)',
                      background: isLinked ? 'var(--mint)' : 'var(--white)'
                    }}
                    onClick={() => {
                      if (showLinkActivity) {
                        if (isLinked) {
                          unlinkActivityFromSubFunction(showLinkActivity, activity.id)
                        } else {
                          linkActivityToSubFunction(showLinkActivity, activity.id)
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--text-primary)' }}>{activity.name}</span>
                      <StatusBadge status={activity.status} />
                    </div>
                    {isLinked && (
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ background: 'var(--gk-green)', color: 'white' }}
                      >
                        Linked
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowLinkActivity(null)}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: 'var(--gk-green)' }}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

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
            {showActivityDetail.notes && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  Notes
                </label>
                <p style={{ color: 'var(--text-secondary)' }}>{showActivityDetail.notes}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
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
        entityType={pendingPublish?.type === 'sub-function' ? 'sub-function' : 'function'}
        entityName={pendingPublish?.name || 'this item'}
        onCancel={() => {
          setShowPublishConfirm(false)
          setPendingPublish(null)
        }}
        onConfirm={() => {
          if (pendingPublish) {
            if (pendingPublish.type === 'function') {
              setFunctionStatus(pendingPublish.id, 'active')
            } else {
              setSubFunctionStatus(pendingPublish.id, 'active')
            }
          }
          setShowPublishConfirm(false)
          setPendingPublish(null)
        }}
      />
    </div>
  )
}
