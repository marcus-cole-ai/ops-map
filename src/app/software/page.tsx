'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { useOpsMapStore } from '@/store'
import { Monitor, Plus, MoreHorizontal, Edit2, Trash2, ExternalLink } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export default function SoftwarePage() {
  const software = useOpsMapStore((state) => state.software)
  const addSoftware = useOpsMapStore((state) => state.addSoftware)
  const updateSoftware = useOpsMapStore((state) => state.updateSoftware)
  const deleteSoftware = useOpsMapStore((state) => state.deleteSoftware)

  const [showAddSoftware, setShowAddSoftware] = useState(false)
  const [editingSoftware, setEditingSoftware] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const handleAddSoftware = () => {
    if (newName.trim()) {
      addSoftware(newName.trim(), newUrl.trim() || undefined)
      setNewName('')
      setNewUrl('')
      setShowAddSoftware(false)
    }
  }

  const handleUpdateSoftware = () => {
    if (editingSoftware && newName.trim()) {
      updateSoftware(editingSoftware, {
        name: newName.trim(),
        url: newUrl.trim() || undefined,
      })
      setNewName('')
      setNewUrl('')
      setEditingSoftware(null)
    }
  }

  return (
    <div>
      <Header
        title="Software"
        description="Tools and software used for activities"
        action={{
          label: 'Add Software',
          onClick: () => setShowAddSoftware(true),
        }}
      />

      <div className="p-6">
        {software.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-cyan-100 p-3">
              <Monitor className="h-6 w-6 text-cyan-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No software yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Track the tools and software used for different activities.
            </p>
            <button
              onClick={() => setShowAddSoftware(true)}
              className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
            >
              Add Your First Tool
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {software.map((sw) => (
              <div
                key={sw.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                      <Monitor className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{sw.name}</h3>
                      {sw.url && (
                        <a
                          href={sw.url.startsWith('http') ? sw.url : `https://${sw.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-600 hover:underline flex items-center gap-1"
                        >
                          {sw.url.replace(/^https?:\/\//, '')}
                          <ExternalLink className="h-3 w-3" />
                        </a>
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
                            setNewName(sw.name)
                            setNewUrl(sw.url || '')
                            setEditingSoftware(sw.id)
                          }}
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                          onClick={() => deleteSoftware(sw.id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Software Modal */}
      <Modal
        open={showAddSoftware}
        onClose={() => {
          setShowAddSoftware(false)
          setNewName('')
          setNewUrl('')
        }}
        title="Add Software"
        description="Track tools and software used for activities."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., HubSpot, Slack, Notion"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL (optional)</label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowAddSoftware(false)
                setNewName('')
                setNewUrl('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSoftware}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50"
            >
              Add Software
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Software Modal */}
      <Modal
        open={editingSoftware !== null}
        onClose={() => {
          setEditingSoftware(null)
          setNewName('')
          setNewUrl('')
        }}
        title="Edit Software"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL (optional)</label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditingSoftware(null)
                setNewName('')
                setNewUrl('')
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateSoftware}
              disabled={!newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
