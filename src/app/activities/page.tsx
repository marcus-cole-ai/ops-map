'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useOpsMapStore } from '@/store'
import { Plus, Search, Edit, Trash2, User, Briefcase, ChevronRight, PlayCircle, Layers, Monitor, X } from 'lucide-react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatusDropdown } from '@/components/ui/StatusDropdown'
import { DraftBanner } from '@/components/ui/DraftBanner'
import { PublishConfirmModal } from '@/components/modals/PublishConfirmModal'
import { ChecklistPasteInput } from '@/components/ui/ChecklistPasteInput'
import { ChecklistItemRow } from '@/components/ui/ChecklistItemRow'
import { VideoUrlInput } from '@/components/ui/VideoUrlInput'
import { VideoEmbed } from '@/components/ui/VideoEmbed'
import type { CoreActivity, Status } from '@/types'

export default function ActivitiesPage() {
  const {
    addCoreActivity,
    updateCoreActivity,
    updateActivityVideo,
    updateActivityRoles,
    updateActivityPeople,
    updateActivitySoftware,
    deleteCoreActivity,
    setActivityStatus,
    publishActivity,
    statusFilter,
    setStatusFilter,
    filteredActivities: getFilteredActivities,
    functions,
    subFunctions,
    subFunctionActivities,
    people,
    roles,
    software,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    reorderChecklistItems,
    getChecklistForActivity,
    getWorkflowsContainingActivity,
  } = useOpsMapStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'assigned' | 'unassigned'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<CoreActivity | null>(null)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const statusFilteredActivities = getFilteredActivities()

  // Filter activities
  const filteredActivities = statusFilteredActivities.filter((activity) => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (!matchesSearch) return false
    
    if (filterBy === 'assigned') {
      return activity.ownerId || activity.roleId
    }
    if (filterBy === 'unassigned') {
      return !activity.ownerId && !activity.roleId
    }
    return true
  })

  const handleAddActivity = () => {
    if (!newName.trim()) return
    const activity = addCoreActivity(newName.trim(), newDescription.trim() || undefined)
    setNewName('')
    setNewDescription('')
    setShowAddModal(false)
    setSelectedActivity(activity)
  }

  const handleUpdateActivity = (updates: Partial<CoreActivity>) => {
    if (selectedActivity) {
      updateCoreActivity(selectedActivity.id, updates)
      setSelectedActivity({ ...selectedActivity, ...updates })
    }
  }

  const handleAddChecklistItems = (items: string[]) => {
    if (!selectedActivity || items.length === 0) return
    items.forEach((item) => addChecklistItem(selectedActivity.id, item))
  }

  const getOwnerName = (ownerId?: string) => {
    if (!ownerId) return null
    const person = people.find(p => p.id === ownerId)
    return person?.name || null
  }

  const getRoleName = (roleId?: string) => {
    if (!roleId) return null
    const role = roles.find(r => r.id === roleId)
    return role?.name || null
  }

  const getActivityOwnerIds = (activity: CoreActivity) => {
    if (activity.ownerIds && activity.ownerIds.length > 0) return activity.ownerIds
    if (activity.ownerId) return [activity.ownerId]
    return []
  }

  const getActivityRoleIds = (activity: CoreActivity) => {
    if (activity.roleIds && activity.roleIds.length > 0) return activity.roleIds
    if (activity.roleId) return [activity.roleId]
    return []
  }

  const getActivitySoftwareIds = (activity: CoreActivity) => {
    if (activity.softwareIds && activity.softwareIds.length > 0) return activity.softwareIds
    return []
  }

  const updateSelectedActivityRoles = (roleIds: string[]) => {
    if (!selectedActivity) return
    const nextRoleIds = roleIds.length > 0 ? Array.from(new Set(roleIds)) : []
    updateActivityRoles(selectedActivity.id, nextRoleIds)
    setSelectedActivity({
      ...selectedActivity,
      roleIds: nextRoleIds.length > 0 ? nextRoleIds : undefined,
      roleId: nextRoleIds[0] || undefined,
    })
  }

  const updateSelectedActivityPeople = (ownerIds: string[]) => {
    if (!selectedActivity) return
    const nextOwnerIds = ownerIds.length > 0 ? Array.from(new Set(ownerIds)) : []
    updateActivityPeople(selectedActivity.id, nextOwnerIds)
    setSelectedActivity({
      ...selectedActivity,
      ownerIds: nextOwnerIds.length > 0 ? nextOwnerIds : undefined,
      ownerId: nextOwnerIds[0] || undefined,
    })
  }

  const updateSelectedActivitySoftware = (softwareIds: string[]) => {
    if (!selectedActivity) return
    const nextSoftwareIds = softwareIds.length > 0 ? Array.from(new Set(softwareIds)) : []
    updateActivitySoftware(selectedActivity.id, nextSoftwareIds)
    setSelectedActivity({
      ...selectedActivity,
      softwareIds: nextSoftwareIds.length > 0 ? nextSoftwareIds : undefined,
    })
  }

  const assignedCount = statusFilteredActivities.filter(a => a.ownerId || a.roleId).length
  const unassignedCount = statusFilteredActivities.length - assignedCount
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

  const getAllowedTransitions = (status: Status): Status[] => {
    if (status === 'gap') return ['draft', 'archived']
    if (status === 'draft') return ['active', 'archived']
    if (status === 'active') return ['draft', 'archived']
    return ['draft']
  }

  const checklistItems = useMemo(() => {
    if (!selectedActivity) return []
    return getChecklistForActivity(selectedActivity.id)
  }, [getChecklistForActivity, selectedActivity])

  const selectedOwnerIds = selectedActivity ? getActivityOwnerIds(selectedActivity) : []
  const selectedRoleIds = selectedActivity ? getActivityRoleIds(selectedActivity) : []
  const selectedSoftwareIds = selectedActivity ? getActivitySoftwareIds(selectedActivity) : []
  const selectedWorkflows = selectedActivity ? getWorkflowsContainingActivity(selectedActivity.id) : []

  const selectedBreadcrumb = useMemo(() => {
    if (!selectedActivity) return null
    const links = subFunctionActivities.filter(sfa => sfa.coreActivityId === selectedActivity.id)
    if (links.length === 0) return null
    const primaryLink = links[0]
    const subFunction = subFunctions.find(sf => sf.id === primaryLink.subFunctionId)
    if (!subFunction) return null
    const func = functions.find(f => f.id === subFunction.functionId)
    if (!func) return null
    return {
      functionName: func.name,
      subFunctionName: subFunction.name,
      extraCount: links.length - 1,
    }
  }, [functions, subFunctionActivities, subFunctions, selectedActivity])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const handleChecklistDragEnd = (event: DragEndEvent) => {
    if (!selectedActivity || !event.over) return
    if (event.active.id === event.over.id) return
    const ids = checklistItems.map((item) => item.id)
    const oldIndex = ids.indexOf(event.active.id as string)
    const newIndex = ids.indexOf(event.over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(ids, oldIndex, newIndex)
    reorderChecklistItems(selectedActivity.id, newOrder)
  }

  const handleStatusChange = (status: Status) => {
    if (!selectedActivity) return
    if (status === 'active') {
      setPendingStatus('active')
      setShowPublishConfirm(true)
      return
    }
    setActivityStatus(selectedActivity.id, status)
    setSelectedActivity({ ...selectedActivity, status })
  }

  return (
    <div className="flex h-full" style={{ background: 'var(--cream)' }}>
      {/* List Panel */}
      <div 
        className="w-96 flex-shrink-0 flex flex-col h-full"
        style={{ borderRight: '1px solid var(--stone)' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5" style={{ background: 'var(--gk-charcoal)' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Core Activities</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'var(--gk-green)' }}
            >
              <Plus className="h-5 w-5 text-white" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white'
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div 
          className="flex-shrink-0 px-4 py-3 flex items-center justify-between gap-2"
          style={{ background: 'var(--cream-light)', borderBottom: '1px solid var(--stone)' }}
        >
          <div className="flex gap-2">
            <button
              onClick={() => setFilterBy('all')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                background: filterBy === 'all' ? 'var(--gk-green)' : 'transparent',
                color: filterBy === 'all' ? 'white' : 'var(--text-secondary)'
              }}
            >
              All ({statusFilteredActivities.length})
            </button>
            <button
              onClick={() => setFilterBy('assigned')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                background: filterBy === 'assigned' ? 'var(--gk-green)' : 'transparent',
                color: filterBy === 'assigned' ? 'white' : 'var(--text-secondary)'
              }}
            >
              Assigned ({assignedCount})
            </button>
            <button
              onClick={() => setFilterBy('unassigned')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                background: filterBy === 'unassigned' ? '#c4785a' : 'transparent',
                color: filterBy === 'unassigned' ? 'white' : 'var(--text-secondary)'
              }}
            >
              Gaps ({unassignedCount})
            </button>
          </div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | Status)}
            className="rounded-lg border px-2 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{ 
              borderColor: 'var(--stone)', 
              background: 'var(--white)',
              color: 'var(--text-secondary)'
            }}
            aria-label="Filter activities by status"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-muted)' }}>
                {searchQuery ? 'No activities match your search' : 'No activities yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 rounded-lg font-medium text-white"
                  style={{ background: 'var(--gk-green)' }}
                >
                  Add First Activity
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredActivities.map((activity) => {
                const ownerName = getOwnerName(activity.ownerId)
                const roleName = getRoleName(activity.roleId)
                const isSelected = selectedActivity?.id === activity.id
                const hasAssignment = ownerName || roleName
                const isGap = activity.status === 'gap'

                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className="p-4 rounded-lg cursor-pointer transition-all"
                    style={{ 
                      background: isSelected ? 'var(--mint)' : isGap ? 'var(--cream-light)' : 'var(--white)',
                      border: `1px ${isGap ? 'dashed' : 'solid'} ${isSelected ? 'var(--gk-green)' : 'var(--stone)'}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 
                            className="font-medium truncate"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {activity.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {activity.videoUrl && (
                              <span
                                className="inline-flex items-center justify-center h-6 w-6 rounded-full"
                                title="Training video attached"
                                style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
                              >
                                <PlayCircle className="h-4 w-4" />
                              </span>
                            )}
                            <StatusBadge status={activity.status} />
                          </div>
                        </div>
                        {activity.description && (
                          <p 
                            className="text-sm truncate mt-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {activity.description}
                          </p>
                        )}
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {ownerName && (
                            <span 
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                              style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
                            >
                              <User className="h-3 w-3" />
                              {ownerName}
                            </span>
                          )}
                          {roleName && (
                            <span 
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                              style={{ background: 'var(--dusty-blue)', color: '#3d4f5f' }}
                            >
                              <Briefcase className="h-3 w-3" />
                              {roleName}
                            </span>
                          )}
                          {!hasAssignment && (
                            <span className="badge badge-gap">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight 
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 overflow-y-auto">
        {selectedActivity ? (
          <div className="p-8 max-w-2xl">
            {selectedActivity.status === 'draft' && (
              <div className="mb-4">
                <DraftBanner onPublish={() => {
                  setPendingStatus('active')
                  setShowPublishConfirm(true)
                }} />
              </div>
            )}
            {/* Activity Header */}
            <div className="flex items-start justify-between mb-6 gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedActivity.name}
                  onChange={(e) => handleUpdateActivity({ name: e.target.value })}
                  className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                {selectedBreadcrumb ? (
                  <div className="mt-2 text-sm flex flex-wrap items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span>{selectedBreadcrumb.functionName}</span>
                    <span>›</span>
                    <span>{selectedBreadcrumb.subFunctionName}</span>
                    <span>›</span>
                    <span>{selectedActivity.name}</span>
                    {selectedBreadcrumb.extraCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--cream-light)', color: 'var(--text-muted)' }}>
                        +{selectedBreadcrumb.extraCount} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 text-sm italic" style={{ color: 'var(--text-muted)' }}>
                    Not linked to a function yet
                  </div>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <StatusBadge status={selectedActivity.status} size="md" />
                  <StatusDropdown
                    currentStatus={selectedActivity.status}
                    allowedTransitions={getAllowedTransitions(selectedActivity.status)}
                    onChange={handleStatusChange}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  deleteCoreActivity(selectedActivity.id)
                  setSelectedActivity(null)
                }}
                className="p-2 rounded-lg transition-colors hover:bg-red-100"
                style={{ color: 'var(--text-muted)' }}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* Summary Description */}
            <div className="mb-6">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Summary
              </label>
              <textarea
                value={selectedActivity.description || ''}
                onChange={(e) => handleUpdateActivity({ description: e.target.value })}
                placeholder="Short summary of the activity..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg border resize-none"
                style={{ 
                  borderColor: 'var(--stone)', 
                  background: 'var(--white)',
                  color: 'var(--text-primary)'
                }}
              />
              {selectedActivity.description && (
                <div 
                  className="markdown mt-3 rounded-lg border p-4"
                  style={{ borderColor: 'var(--stone)', background: 'var(--cream-light)' }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedActivity.description}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Full Description */}
            <div className="mb-6">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Full Description
              </label>
              <textarea
                value={selectedActivity.fullDescription || ''}
                onChange={(e) => handleUpdateActivity({ fullDescription: e.target.value })}
                placeholder="Detailed activity description (markdown supported)..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border resize-none"
                style={{ 
                  borderColor: 'var(--stone)', 
                  background: 'var(--white)',
                  color: 'var(--text-primary)'
                }}
              />
              {selectedActivity.fullDescription && (
                <div 
                  className="markdown mt-3 rounded-lg border p-4"
                  style={{ borderColor: 'var(--stone)', background: 'var(--cream-light)' }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedActivity.fullDescription}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Roles & People */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label 
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Roles
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedRoleIds.length > 0 ? (
                    selectedRoleIds.map((roleId) => {
                      const role = roles.find(r => r.id === roleId)
                      const isPrimary = roleId === (selectedActivity.roleId || selectedRoleIds[0])
                      return (
                        <span 
                          key={roleId}
                          className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded"
                          style={{ background: 'var(--dusty-blue)', color: '#3d4f5f' }}
                        >
                          <Briefcase className="h-3 w-3" />
                          {role?.name || 'Unknown'}
                          {isPrimary && (
                            <span className="text-[10px] uppercase tracking-wide" style={{ color: '#2d3b47' }}>
                              Primary
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => updateSelectedActivityRoles(selectedRoleIds.filter(id => id !== roleId))}
                            className="ml-1 rounded-full"
                            style={{ color: '#2d3b47' }}
                            aria-label="Remove role"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    })
                  ) : (
                    <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                      No roles assigned
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <select
                    value={selectedActivity.roleId || selectedRoleIds[0] || ''}
                    onChange={(e) => {
                      const nextPrimary = e.target.value
                      if (!nextPrimary) {
                        if (selectedRoleIds.length > 0) {
                          const currentPrimary = selectedActivity.roleId || selectedRoleIds[0]
                          updateSelectedActivityRoles(selectedRoleIds.filter(id => id !== currentPrimary))
                        }
                        return
                      }
                      const nextRoleIds = [nextPrimary, ...selectedRoleIds.filter(id => id !== nextPrimary)]
                      updateSelectedActivityRoles(nextRoleIds)
                    }}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--stone)', 
                      background: 'var(--white)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Primary role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value=""
                    onChange={(e) => {
                      const nextRole = e.target.value
                      if (!nextRole) return
                      updateSelectedActivityRoles([...selectedRoleIds, nextRole])
                    }}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--stone)', 
                      background: 'var(--white)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Add backup role...</option>
                    {roles.filter(role => !selectedRoleIds.includes(role.id)).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label 
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  People
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedOwnerIds.length > 0 ? (
                    selectedOwnerIds.map((ownerId) => {
                      const person = people.find(p => p.id === ownerId)
                      const isPrimary = ownerId === (selectedActivity.ownerId || selectedOwnerIds[0])
                      return (
                        <span 
                          key={ownerId}
                          className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded"
                          style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
                        >
                          <User className="h-3 w-3" />
                          {person?.name || 'Unknown'}
                          {isPrimary && (
                            <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--gk-green-dark)' }}>
                              Primary
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => updateSelectedActivityPeople(selectedOwnerIds.filter(id => id !== ownerId))}
                            className="ml-1 rounded-full"
                            style={{ color: 'var(--gk-green-dark)' }}
                            aria-label="Remove person"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    })
                  ) : (
                    <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                      No people assigned
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <select
                    value={selectedActivity.ownerId || selectedOwnerIds[0] || ''}
                    onChange={(e) => {
                      const nextPrimary = e.target.value
                      if (!nextPrimary) {
                        if (selectedOwnerIds.length > 0) {
                          const currentPrimary = selectedActivity.ownerId || selectedOwnerIds[0]
                          updateSelectedActivityPeople(selectedOwnerIds.filter(id => id !== currentPrimary))
                        }
                        return
                      }
                      const nextOwnerIds = [nextPrimary, ...selectedOwnerIds.filter(id => id !== nextPrimary)]
                      updateSelectedActivityPeople(nextOwnerIds)
                    }}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--stone)', 
                      background: 'var(--white)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Primary person...</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value=""
                    onChange={(e) => {
                      const nextPerson = e.target.value
                      if (!nextPerson) return
                      updateSelectedActivityPeople([...selectedOwnerIds, nextPerson])
                    }}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--stone)', 
                      background: 'var(--white)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Add person...</option>
                    {people.filter(person => !selectedOwnerIds.includes(person.id)).map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Workflows */}
            <div className="mb-6">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Workflows
              </label>
              {selectedWorkflows.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedWorkflows.map((workflow) => (
                    <Link
                      key={workflow.id}
                      href={`/workflows/${workflow.id}`}
                      className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded"
                      style={{ background: 'var(--cream-light)', color: 'var(--text-primary)' }}
                    >
                      <Layers className="h-3 w-3" />
                      {workflow.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                  Not used in any workflows yet
                </p>
              )}
            </div>

            {/* Software */}
            <div className="mb-6">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Software
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSoftwareIds.length > 0 ? (
                  selectedSoftwareIds.map((softwareId) => {
                    const item = software.find(s => s.id === softwareId)
                    if (!item) return null
                    const content = (
                      <>
                        <Monitor className="h-3 w-3" />
                        {item.name}
                      </>
                    )
                    return (
                      <span
                        key={softwareId}
                        className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded"
                        style={{ background: 'var(--sand)', color: '#8b6b1e' }}
                      >
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                        <button
                          type="button"
                          onClick={() => updateSelectedActivitySoftware(selectedSoftwareIds.filter(id => id !== softwareId))}
                          className="ml-1 rounded-full"
                          style={{ color: '#8b6b1e' }}
                          aria-label="Remove software"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })
                ) : (
                  <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                    No software linked
                  </p>
                )}
              </div>
              <select
                value=""
                onChange={(e) => {
                  const nextSoftware = e.target.value
                  if (!nextSoftware) return
                  updateSelectedActivitySoftware([...selectedSoftwareIds, nextSoftware])
                }}
                className="w-full px-4 py-3 rounded-lg border"
                style={{ 
                  borderColor: 'var(--stone)', 
                  background: 'var(--white)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">Link software...</option>
                {software.filter(item => !selectedSoftwareIds.includes(item.id)).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Notes
              </label>
              <textarea
                value={selectedActivity.notes || ''}
                onChange={(e) => handleUpdateActivity({ notes: e.target.value })}
                placeholder="Add notes..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border resize-none"
                style={{ 
                  borderColor: 'var(--stone)', 
                  background: 'var(--white)',
                  color: 'var(--text-primary)'
                }}
              />
              {selectedActivity.notes && (
                <div 
                  className="markdown mt-3 rounded-lg border p-4"
                  style={{ borderColor: 'var(--stone)', background: 'var(--cream-light)' }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedActivity.notes}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Training Video */}
            <div className="mb-6" data-export-exclude="video">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Training Video
              </label>
              <VideoUrlInput
                value={selectedActivity.videoUrl}
                onChange={(url, platform) => {
                  updateActivityVideo(selectedActivity.id, url, platform)
                  setSelectedActivity({
                    ...selectedActivity,
                    videoUrl: url || undefined,
                    videoType: platform || undefined,
                  })
                }}
                helperText="Paste a Loom or Google Drive video link"
              />
              <div className="mt-3">
                <VideoEmbed
                  url={selectedActivity.videoUrl}
                  videoType={selectedActivity.videoType}
                />
              </div>
            </div>

            {/* Checklist Section */}
            <div 
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--stone)', background: 'var(--white)' }}
            >
              <h3 
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Checklist
              </h3>

              {/* Trigger */}
              <div className="mb-4">
                <label 
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Trigger — What causes this checklist to be used?
                </label>
                <input
                  type="text"
                  value={selectedActivity.checklistTrigger || ''}
                  onChange={(e) => handleUpdateActivity({ checklistTrigger: e.target.value })}
                  placeholder="e.g., When a new lead comes in, When project is approved..."
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ 
                    borderColor: 'var(--stone)', 
                    background: 'var(--cream-light)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {/* End State */}
              <div className="mb-4">
                <label 
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  End State — What does done look like?
                </label>
                <input
                  type="text"
                  value={selectedActivity.checklistEndState || ''}
                  onChange={(e) => handleUpdateActivity({ checklistEndState: e.target.value })}
                  placeholder="e.g., Lead is qualified and scheduled, Project kickoff complete..."
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ 
                    borderColor: 'var(--stone)', 
                    background: 'var(--cream-light)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {/* Checklist Items */}
              <div 
                className="pt-4 mt-4"
                style={{ borderTop: '1px solid var(--stone)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <label 
                    className="text-xs font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Checklist Items
                  </label>
                  {checklistItems.length >= 10 && (
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: 'var(--sand)', color: '#b8923a' }}
                    >
                      Max 10 items recommended
                    </span>
                  )}
                </div>

                {checklistItems.length === 0 ? (
                  <p 
                    className="text-sm italic mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No checklist items yet. Keep it to 10 items or fewer.
                  </p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleChecklistDragEnd}
                  >
                    <SortableContext
                      items={checklistItems.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 mb-4">
                        {checklistItems.map((item) => (
                          <ChecklistItemRow
                            key={item.id}
                            id={item.id}
                            text={item.text}
                            completed={item.completed}
                            videoUrl={item.videoUrl}
                            onToggle={(checked) => updateChecklistItem(item.id, { completed: checked })}
                            onDelete={() => deleteChecklistItem(item.id)}
                            onUpdateText={(value) => updateChecklistItem(item.id, { text: value })}
                            onUpdateVideoUrl={(value) => updateChecklistItem(item.id, { videoUrl: value || undefined })}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
                
                {/* Add checklist item */}
                {checklistItems.length < 10 && (
                  <ChecklistPasteInput
                    placeholder="Type or paste checklist items..."
                    onAddItems={handleAddChecklistItems}
                    maxItems={10}
                    currentCount={checklistItems.length}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--cream-light)' }}
              >
                <Edit className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Select an Activity
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Choose an activity from the list to view and edit details
              </p>
            </div>
          </div>
        )}
      </div>

      <PublishConfirmModal
        isOpen={showPublishConfirm}
        entityType="activity"
        entityName={selectedActivity?.name || 'this activity'}
        onCancel={() => {
          setShowPublishConfirm(false)
          setPendingStatus(null)
        }}
        onConfirm={() => {
          if (selectedActivity && pendingStatus === 'active') {
            publishActivity(selectedActivity.id)
            setSelectedActivity({ ...selectedActivity, status: 'active', publishedAt: new Date() })
          }
          setShowPublishConfirm(false)
          setPendingStatus(null)
        }}
      />

      {/* Add Activity Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Core Activity"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Activity Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Send welcome email, Schedule site visit"
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--white)',
                color: 'var(--text-primary)'
              }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Description (optional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What does this activity involve?"
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
              onClick={handleAddActivity}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Add Activity
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
