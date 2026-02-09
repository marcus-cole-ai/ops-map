'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { useOpsMapStore } from '@/store'
import { Users, Plus, MoreHorizontal, Edit2, Trash2, Mail, Briefcase } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export default function PeoplePage() {
  const people = useOpsMapStore((state) => state.people)
  const roles = useOpsMapStore((state) => state.roles)
  const addPerson = useOpsMapStore((state) => state.addPerson)
  const updatePerson = useOpsMapStore((state) => state.updatePerson)
  const deletePerson = useOpsMapStore((state) => state.deletePerson)

  const [showAddPerson, setShowAddPerson] = useState(false)
  const [editingPerson, setEditingPerson] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRoleId, setNewRoleId] = useState('')

  const handleAddPerson = () => {
    if (newName.trim()) {
      const person = addPerson(newName.trim(), newEmail.trim() || undefined)
      if (newRoleId) {
        updatePerson(person.id, { roleId: newRoleId })
      }
      setNewName('')
      setNewEmail('')
      setNewRoleId('')
      setShowAddPerson(false)
    }
  }

  const handleUpdatePerson = () => {
    if (editingPerson && newName.trim()) {
      updatePerson(editingPerson, {
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        roleId: newRoleId || undefined,
      })
      setNewName('')
      setNewEmail('')
      setNewRoleId('')
      setEditingPerson(null)
    }
  }

  return (
    <div>
      <Header
        title="People"
        description="Team members who perform activities"
        action={{
          label: 'Add Person',
          onClick: () => setShowAddPerson(true),
        }}
      />

      <div className="p-6">
        {people.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 p-3">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No people yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Add team members to assign them as owners of activities.
            </p>
            <button
              onClick={() => setShowAddPerson(true)}
              className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Add Your First Person
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map((person) => {
              const role = person.roleId ? roles.find(r => r.id === person.roleId) : null
              return (
                <div
                  key={person.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{person.name}</h3>
                        {role && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {role.name}
                          </p>
                        )}
                      </div>
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
                              setNewName(person.name)
                              setNewEmail(person.email || '')
                              setNewRoleId(person.roleId || '')
                              setEditingPerson(person.id)
                            }}
                          >
                            <Edit2 className="h-4 w-4" /> Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                            onClick={() => deletePerson(person.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                  {person.email && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="h-4 w-4" />
                      {person.email}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Person Modal */}
      <Modal
        open={showAddPerson}
        onClose={() => {
          setShowAddPerson(false)
          setNewName('')
          setNewEmail('')
          setNewRoleId('')
        }}
        title="Add Person"
        description="Add a team member to assign activities to."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., John Smith"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="john@company.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role (optional)</label>
            <select
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">No role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowAddPerson(false)
                setNewName('')
                setNewEmail('')
                setNewRoleId('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPerson}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50"
            >
              Add Person
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Person Modal */}
      <Modal
        open={editingPerson !== null}
        onClose={() => {
          setEditingPerson(null)
          setNewName('')
          setNewEmail('')
          setNewRoleId('')
        }}
        title="Edit Person"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role (optional)</label>
            <select
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">No role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditingPerson(null)
                setNewName('')
                setNewEmail('')
                setNewRoleId('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdatePerson}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
