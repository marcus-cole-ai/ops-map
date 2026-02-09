'use client'

import { useState } from 'react'
import { useOpsMapStore } from '@/store'
import { Plus, Search, Edit, Trash2, User, Briefcase, ChevronRight, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { CoreActivity } from '@/types'

export default function ActivitiesPage() {
  const {
    coreActivities,
    addCoreActivity,
    updateCoreActivity,
    deleteCoreActivity,
    people,
    roles,
    checklistItems,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    getChecklistForActivity,
  } = useOpsMapStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'assigned' | 'unassigned'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<CoreActivity | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')

  // Filter activities
  const filteredActivities = coreActivities.filter((activity) => {
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

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim() || !selectedActivity) return
    addChecklistItem(selectedActivity.id, newChecklistItem.trim())
    setNewChecklistItem('')
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

  const assignedCount = coreActivities.filter(a => a.ownerId || a.roleId).length
  const unassignedCount = coreActivities.length - assignedCount

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
          className="flex-shrink-0 px-4 py-3 flex gap-2"
          style={{ background: 'var(--cream-light)', borderBottom: '1px solid var(--stone)' }}
        >
          <button
            onClick={() => setFilterBy('all')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              background: filterBy === 'all' ? 'var(--gk-green)' : 'transparent',
              color: filterBy === 'all' ? 'white' : 'var(--text-secondary)'
            }}
          >
            All ({coreActivities.length})
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

                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className="p-4 rounded-lg cursor-pointer transition-all"
                    style={{ 
                      background: isSelected ? 'var(--mint)' : 'var(--white)',
                      border: `1px solid ${isSelected ? 'var(--gk-green)' : 'var(--stone)'}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-medium truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {activity.name}
                        </h3>
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
            {/* Activity Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedActivity.name}
                  onChange={(e) => handleUpdateActivity({ name: e.target.value })}
                  className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
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

            {/* Description */}
            <div className="mb-6">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Description
              </label>
              <textarea
                value={selectedActivity.description || ''}
                onChange={(e) => handleUpdateActivity({ description: e.target.value })}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border resize-none"
                style={{ 
                  borderColor: 'var(--stone)', 
                  background: 'var(--white)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Owner & Role */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label 
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Owner
                </label>
                <select
                  value={selectedActivity.ownerId || ''}
                  onChange={(e) => handleUpdateActivity({ ownerId: e.target.value || undefined })}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ 
                    borderColor: 'var(--stone)', 
                    background: 'var(--white)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Select owner...</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label 
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Role
                </label>
                <select
                  value={selectedActivity.roleId || ''}
                  onChange={(e) => handleUpdateActivity({ roleId: e.target.value || undefined })}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ 
                    borderColor: 'var(--stone)', 
                    background: 'var(--white)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Select role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
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
                  End State — What does "done" look like?
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
                  {getChecklistForActivity(selectedActivity.id).length >= 10 && (
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: 'var(--sand)', color: '#b8923a' }}
                    >
                      Max 10 items recommended
                    </span>
                  )}
                </div>

                {getChecklistForActivity(selectedActivity.id).length === 0 ? (
                  <p 
                    className="text-sm italic mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No checklist items yet. Keep it to 10 items or fewer.
                  </p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {getChecklistForActivity(selectedActivity.id).map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-lg"
                        style={{ background: 'var(--cream-light)' }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={(e) => updateChecklistItem(item.id, { completed: e.target.checked })}
                            className="h-4 w-4 rounded flex-shrink-0"
                            style={{ accentColor: 'var(--gk-green)' }}
                          />
                          <span 
                            className={`flex-1 text-sm ${item.completed ? 'line-through' : ''}`}
                            style={{ color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}
                          >
                            {item.text}
                          </span>
                          <button
                            onClick={() => deleteChecklistItem(item.id)}
                            className="p-1 rounded hover:bg-red-100 transition-colors flex-shrink-0"
                          >
                            <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                          </button>
                        </div>
                        {/* Video URL */}
                        <div className="mt-2 ml-7">
                          <input
                            type="url"
                            value={item.videoUrl || ''}
                            onChange={(e) => updateChecklistItem(item.id, { videoUrl: e.target.value || undefined })}
                            placeholder="Video URL (optional)"
                            className="w-full px-2 py-1 rounded border text-xs"
                            style={{ 
                              borderColor: 'var(--stone)', 
                              background: 'var(--white)',
                              color: 'var(--text-secondary)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add checklist item */}
                {getChecklistForActivity(selectedActivity.id).length < 10 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add checklist item (plain language, easy to understand)..."
                      className="flex-1 px-3 py-2 rounded-lg border text-sm"
                      style={{ 
                        borderColor: 'var(--stone)', 
                        background: 'var(--cream)',
                        color: 'var(--text-primary)'
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      disabled={!newChecklistItem.trim()}
                      className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
                      style={{ background: 'var(--gk-green)' }}
                    >
                      Add
                    </button>
                  </div>
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
