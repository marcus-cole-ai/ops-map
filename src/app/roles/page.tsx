'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { useOpsMapStore } from '@/store'
import { Briefcase, Plus, MoreHorizontal, Edit2, Trash2, Users } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export default function RolesPage() {
  const roles = useOpsMapStore((state) => state.roles)
  const people = useOpsMapStore((state) => state.people)
  const addRole = useOpsMapStore((state) => state.addRole)
  const updateRole = useOpsMapStore((state) => state.updateRole)
  const deleteRole = useOpsMapStore((state) => state.deleteRole)

  const [showAddRole, setShowAddRole] = useState(false)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const handleAddRole = () => {
    if (newName.trim()) {
      addRole(newName.trim(), newDescription.trim() || undefined)
      setNewName('')
      setNewDescription('')
      setShowAddRole(false)
    }
  }

  const handleUpdateRole = () => {
    if (editingRole && newName.trim()) {
      updateRole(editingRole, {
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      })
      setNewName('')
      setNewDescription('')
      setEditingRole(null)
    }
  }

  const getPeopleInRole = (roleId: string) => {
    return people.filter(p => p.roleId === roleId)
  }

  return (
    <div>
      <Header
        title="Roles"
        description="Roles define who should own types of work"
        action={{
          label: 'Add Role',
          onClick: () => setShowAddRole(true),
        }}
      />

      <div className="p-6">
        {roles.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-pink-100 p-3">
              <Briefcase className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No roles yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Define roles to clarify who should own different types of activities.
            </p>
            <button
              onClick={() => setShowAddRole(true)}
              className="mt-4 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
            >
              Add Your First Role
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const peopleInRole = getPeopleInRole(role.id)
              return (
                <div
                  key={role.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{role.name}</h3>
                        {peopleInRole.length > 0 && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {peopleInRole.length} {peopleInRole.length === 1 ? 'person' : 'people'}
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
                              setNewName(role.name)
                              setNewDescription(role.description || '')
                              setEditingRole(role.id)
                            }}
                          >
                            <Edit2 className="h-4 w-4" /> Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                            onClick={() => deleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                  {role.description && (
                    <p className="mt-3 text-sm text-slate-500">{role.description}</p>
                  )}
                  {peopleInRole.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {peopleInRole.map(person => (
                        <span
                          key={person.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600"
                        >
                          {person.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Role Modal */}
      <Modal
        open={showAddRole}
        onClose={() => {
          setShowAddRole(false)
          setNewName('')
          setNewDescription('')
        }}
        title="Add Role"
        description="Roles define what type of person should own an activity."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Project Manager, Sales Rep"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What does this role do?"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowAddRole(false)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRole}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg disabled:opacity-50"
            >
              Add Role
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        open={editingRole !== null}
        onClose={() => {
          setEditingRole(null)
          setNewName('')
          setNewDescription('')
        }}
        title="Edit Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditingRole(null)
                setNewName('')
                setNewDescription('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRole}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
