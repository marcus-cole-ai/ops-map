'use client'

import { useState } from 'react'
import { useOpsMapStore } from '@/store'
import { Plus, Search, Edit, Trash2, Briefcase, Users, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { Role } from '@/types'

export default function RolesPage() {
  const {
    roles,
    people,
    addRole,
    updateRole,
    deleteRole,
    coreActivities,
  } = useOpsMapStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddRole = () => {
    if (!newName.trim()) return
    const role = addRole(newName.trim(), newDescription.trim() || undefined)
    setNewName('')
    setNewDescription('')
    setShowAddModal(false)
    setSelectedRole(role)
  }

  const handleUpdateRole = (updates: Partial<Role>) => {
    if (selectedRole) {
      updateRole(selectedRole.id, updates)
      setSelectedRole({ ...selectedRole, ...updates })
    }
  }

  const getPeopleCount = (roleId: string) => {
    return people.filter(p => p.roleId === roleId).length
  }

  const getActivityCount = (roleId: string) => {
    return coreActivities.filter(a => a.roleId === roleId).length
  }

  const getPeopleForRole = (roleId: string) => {
    return people.filter(p => p.roleId === roleId)
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
            <h1 className="text-xl font-bold text-white">Roles</h1>
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
              placeholder="Search roles..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white'
              }}
            />
          </div>
        </div>

        {/* Roles List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-muted)' }}>
                {searchQuery ? 'No roles match your search' : 'No roles defined yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 rounded-lg font-medium text-white"
                  style={{ background: 'var(--gk-green)' }}
                >
                  Add First Role
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRoles.map((role) => {
                const peopleCount = getPeopleCount(role.id)
                const activityCount = getActivityCount(role.id)
                const isSelected = selectedRole?.id === role.id

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
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
                          {role.name}
                        </h3>
                        {role.description && (
                          <p 
                            className="text-sm truncate mt-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {role.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span 
                            className="text-xs flex items-center gap-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Users className="h-3 w-3" />
                            {peopleCount} people
                          </span>
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {activityCount} activities
                          </span>
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
        {selectedRole ? (
          <div className="p-8 max-w-2xl">
            {/* Role Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedRole.name}
                  onChange={(e) => handleUpdateRole({ name: e.target.value })}
                  className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <button
                onClick={() => {
                  deleteRole(selectedRole.id)
                  setSelectedRole(null)
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
                value={selectedRole.description || ''}
                onChange={(e) => handleUpdateRole({ description: e.target.value })}
                placeholder="Describe this role's responsibilities..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border resize-none"
                style={{ 
                  borderColor: 'var(--stone)', 
                  background: 'var(--white)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div 
                className="p-4 rounded-lg"
                style={{ background: 'var(--cream-light)', border: '1px solid var(--stone)' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'var(--mint)' }}
                  >
                    <Users className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {getPeopleCount(selectedRole.id)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      People
                    </div>
                  </div>
                </div>
              </div>
              <div 
                className="p-4 rounded-lg"
                style={{ background: 'var(--cream-light)', border: '1px solid var(--stone)' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'var(--dusty-blue)' }}
                  >
                    <Briefcase className="h-5 w-5" style={{ color: '#3d4f5f' }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {getActivityCount(selectedRole.id)}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Activities
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* People in Role */}
            {getPeopleForRole(selectedRole.id).length > 0 && (
              <div>
                <label 
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  People in this Role
                </label>
                <div 
                  className="rounded-lg border overflow-hidden"
                  style={{ borderColor: 'var(--stone)' }}
                >
                  {getPeopleForRole(selectedRole.id).map((person, index) => (
                    <div
                      key={person.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ 
                        background: 'var(--white)',
                        borderTop: index > 0 ? '1px solid var(--stone)' : 'none'
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{ background: 'var(--gk-green)', color: 'white' }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div style={{ color: 'var(--text-primary)' }}>{person.name}</div>
                        {person.email && (
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {person.email}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--cream-light)' }}
              >
                <Briefcase className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Select a Role
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Choose a role from the list to view and edit details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Role Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Role Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Project Manager, Sales Rep"
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
              placeholder="What are this role's responsibilities?"
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
              onClick={handleAddRole}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Add Role
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
