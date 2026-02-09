'use client'

import { useState } from 'react'
import { useOpsMapStore } from '@/store'
import { Plus, Search, Edit, Trash2, User, Mail, Briefcase, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { Person } from '@/types'

export default function PeoplePage() {
  const {
    people,
    roles,
    addPerson,
    updatePerson,
    deletePerson,
    coreActivities,
  } = useOpsMapStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRoleId, setNewRoleId] = useState('')

  const filteredPeople = people.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (person.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddPerson = () => {
    if (!newName.trim()) return
    const person = addPerson(newName.trim(), newEmail.trim() || undefined)
    if (newRoleId) {
      updatePerson(person.id, { roleId: newRoleId })
    }
    setNewName('')
    setNewEmail('')
    setNewRoleId('')
    setShowAddModal(false)
    setSelectedPerson({ ...person, roleId: newRoleId || undefined })
  }

  const handleUpdatePerson = (updates: Partial<Person>) => {
    if (selectedPerson) {
      updatePerson(selectedPerson.id, updates)
      setSelectedPerson({ ...selectedPerson, ...updates })
    }
  }

  const getRoleName = (roleId?: string) => {
    if (!roleId) return null
    const role = roles.find(r => r.id === roleId)
    return role?.name || null
  }

  const getActivityCount = (personId: string) => {
    return coreActivities.filter(a => a.ownerId === personId).length
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
            <h1 className="text-xl font-bold text-white">People</h1>
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
              placeholder="Search people..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white'
              }}
            />
          </div>
        </div>

        {/* People List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPeople.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-muted)' }}>
                {searchQuery ? 'No people match your search' : 'No people added yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 rounded-lg font-medium text-white"
                  style={{ background: 'var(--gk-green)' }}
                >
                  Add First Person
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPeople.map((person) => {
                const roleName = getRoleName(person.roleId)
                const activityCount = getActivityCount(person.id)
                const isSelected = selectedPerson?.id === person.id

                return (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    className="p-4 rounded-lg cursor-pointer transition-all"
                    style={{ 
                      background: isSelected ? 'var(--mint)' : 'var(--white)',
                      border: `1px solid ${isSelected ? 'var(--gk-green)' : 'var(--stone)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--gk-green)', color: 'white' }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-medium truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {person.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {roleName && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded"
                              style={{ background: 'var(--dusty-blue)', color: '#3d4f5f' }}
                            >
                              {roleName}
                            </span>
                          )}
                          {activityCount > 0 && (
                            <span 
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {activityCount} activities
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
        {selectedPerson ? (
          <div className="p-8 max-w-2xl">
            {/* Person Header */}
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: 'var(--gk-green)', color: 'white' }}
              >
                {selectedPerson.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedPerson.name}
                  onChange={(e) => handleUpdatePerson({ name: e.target.value })}
                  className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <button
                onClick={() => {
                  deletePerson(selectedPerson.id)
                  setSelectedPerson(null)
                }}
                className="p-2 rounded-lg transition-colors hover:bg-red-100"
                style={{ color: 'var(--text-muted)' }}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Email
              </label>
              <div className="relative">
                <Mail 
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  value={selectedPerson.email || ''}
                  onChange={(e) => handleUpdatePerson({ email: e.target.value })}
                  placeholder="Add email..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border"
                  style={{ 
                    borderColor: 'var(--stone)', 
                    background: 'var(--white)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Role */}
            <div className="mb-6">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Role
              </label>
              <select
                value={selectedPerson.roleId || ''}
                onChange={(e) => handleUpdatePerson({ roleId: e.target.value || undefined })}
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

            {/* Activity Count */}
            <div 
              className="p-4 rounded-lg"
              style={{ background: 'var(--cream-light)', border: '1px solid var(--stone)' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ background: 'var(--mint)' }}
                >
                  <Briefcase className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {getActivityCount(selectedPerson.id)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Activities owned
                  </div>
                </div>
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
                <User className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Select a Person
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Choose someone from the list to view and edit their details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Person Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setNewName('')
          setNewEmail('')
          setNewRoleId('')
        }}
        title="Add Person"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name"
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
              Email (optional)
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@company.com"
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--white)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Role (optional)
            </label>
            <select
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
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
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowAddModal(false)
                setNewName('')
                setNewEmail('')
                setNewRoleId('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddPerson}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Add Person
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
