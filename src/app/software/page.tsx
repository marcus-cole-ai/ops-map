'use client'

import { useState } from 'react'
import { useOpsMapStore } from '@/store'
import { Plus, Search, Edit, Trash2, Monitor, ExternalLink, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { Software } from '@/types'

export default function SoftwarePage() {
  const {
    software,
    addSoftware,
    updateSoftware,
    deleteSoftware,
  } = useOpsMapStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const filteredSoftware = software.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.url?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddSoftware = () => {
    if (!newName.trim()) return
    const sw = addSoftware(newName.trim(), newUrl.trim() || undefined)
    setNewName('')
    setNewUrl('')
    setShowAddModal(false)
    setSelectedSoftware(sw)
  }

  const handleUpdateSoftware = (updates: Partial<Software>) => {
    if (selectedSoftware) {
      updateSoftware(selectedSoftware.id, updates)
      setSelectedSoftware({ ...selectedSoftware, ...updates })
    }
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
            <h1 className="text-xl font-bold text-white">Software</h1>
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
              placeholder="Search software..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white'
              }}
            />
          </div>
        </div>

        {/* Software List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredSoftware.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-muted)' }}>
                {searchQuery ? 'No software matches your search' : 'No software added yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 rounded-lg font-medium text-white"
                  style={{ background: 'var(--gk-green)' }}
                >
                  Add First Software
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSoftware.map((sw) => {
                const isSelected = selectedSoftware?.id === sw.id

                return (
                  <div
                    key={sw.id}
                    onClick={() => setSelectedSoftware(sw)}
                    className="p-4 rounded-lg cursor-pointer transition-all"
                    style={{ 
                      background: isSelected ? 'var(--mint)' : 'var(--white)',
                      border: `1px solid ${isSelected ? 'var(--gk-green)' : 'var(--stone)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--dusty-blue)' }}
                      >
                        <Monitor className="h-5 w-5" style={{ color: '#3d4f5f' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-medium truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {sw.name}
                        </h3>
                        {sw.url && (
                          <p 
                            className="text-xs truncate mt-0.5"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {sw.url.replace(/^https?:\/\//, '')}
                          </p>
                        )}
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
        {selectedSoftware ? (
          <div className="p-8 max-w-2xl">
            {/* Software Header */}
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--dusty-blue)' }}
              >
                <Monitor className="h-8 w-8" style={{ color: '#3d4f5f' }} />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedSoftware.name}
                  onChange={(e) => handleUpdateSoftware({ name: e.target.value })}
                  className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <button
                onClick={() => {
                  deleteSoftware(selectedSoftware.id)
                  setSelectedSoftware(null)
                }}
                className="p-2 rounded-lg transition-colors hover:bg-red-100"
                style={{ color: 'var(--text-muted)' }}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* URL */}
            <div className="mb-6">
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Website URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={selectedSoftware.url || ''}
                  onChange={(e) => handleUpdateSoftware({ url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-lg border pr-12"
                  style={{ 
                    borderColor: 'var(--stone)', 
                    background: 'var(--white)',
                    color: 'var(--text-primary)'
                  }}
                />
                {selectedSoftware.url && (
                  <a
                    href={selectedSoftware.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                  >
                    <ExternalLink className="h-4 w-4" style={{ color: 'var(--gk-green)' }} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Link */}
            {selectedSoftware.url && (
              <a
                href={selectedSoftware.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
              >
                <ExternalLink className="h-4 w-4" />
                Open {selectedSoftware.name}
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--cream-light)' }}
              >
                <Monitor className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Select Software
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Choose software from the list to view and edit details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Software Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setNewName('')
          setNewUrl('')
        }}
        title="Add Software"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Software Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., HubSpot, QuickBooks, BuilderTrend"
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
              Website URL (optional)
            </label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 rounded-lg border"
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
                setNewUrl('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddSoftware}
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Add Software
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
