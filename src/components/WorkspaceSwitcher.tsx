'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useOpsMapStore } from '@/store'
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Check, 
  Pencil, 
  Trash2,
  Settings2
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

export function WorkspaceSwitcher() {
  const { 
    workspaces: allWorkspaces, 
    activeWorkspaceId, 
    currentUserId,
    switchWorkspace, 
    addWorkspace,
    renameWorkspace,
    deleteWorkspace,
    getActiveWorkspace,
  } = useOpsMapStore()
  
  // Filter workspaces to only show current user's workspaces
  const workspaces = useMemo(() => {
    if (!currentUserId) return allWorkspaces
    return allWorkspaces.filter(ws => ws.userId === currentUserId)
  }, [allWorkspaces, currentUserId])

  const [isOpen, setIsOpen] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [editingWorkspace, setEditingWorkspace] = useState<{ id: string; name: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeWorkspace = getActiveWorkspace()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitchWorkspace = (id: string) => {
    switchWorkspace(id)
    setIsOpen(false)
  }

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const newWs = addWorkspace(newWorkspaceName.trim())
      switchWorkspace(newWs.id)
      setNewWorkspaceName('')
      setShowNewModal(false)
      setIsOpen(false)
    }
  }

  const handleRenameWorkspace = () => {
    if (editingWorkspace && editingWorkspace.name.trim()) {
      renameWorkspace(editingWorkspace.id, editingWorkspace.name.trim())
      setEditingWorkspace(null)
      setShowRenameModal(false)
    }
  }

  const handleDeleteWorkspace = () => {
    if (editingWorkspace) {
      deleteWorkspace(editingWorkspace.id)
      setEditingWorkspace(null)
      setShowDeleteModal(false)
    }
  }

  const openRenameModal = (ws: { id: string; name: string }) => {
    setEditingWorkspace({ id: ws.id, name: ws.name })
    setShowRenameModal(true)
    setShowManageModal(false)
  }

  const openDeleteModal = (ws: { id: string; name: string }) => {
    setEditingWorkspace({ id: ws.id, name: ws.name })
    setShowDeleteModal(true)
    setShowManageModal(false)
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-white/10"
        >
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: 'var(--gk-green)' }}
          >
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {activeWorkspace?.name || 'My Company'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
            </div>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div 
            className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden shadow-xl z-50"
            style={{ 
              background: 'var(--gk-charcoal-light, #3d4a4f)', 
              border: '1px solid rgba(255,255,255,0.1)' 
            }}
          >
            {/* Workspace List */}
            <div className="max-h-64 overflow-y-auto py-1">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => handleSwitchWorkspace(ws.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/10"
                >
                  <div 
                    className="flex h-7 w-7 items-center justify-center rounded flex-shrink-0"
                    style={{ 
                      background: ws.id === activeWorkspaceId 
                        ? 'var(--gk-green)' 
                        : 'rgba(255,255,255,0.1)' 
                    }}
                  >
                    <Building2 className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="flex-1 text-sm text-white truncate">
                    {ws.name}
                  </span>
                  {ws.id === activeWorkspaceId && (
                    <Check className="h-4 w-4 text-white flex-shrink-0" style={{ color: 'var(--gk-green)' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="border-t border-white/10 py-1">
              <button
                onClick={() => {
                  setShowNewModal(true)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded flex-shrink-0 bg-white/10">
                  <Plus className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm text-white">New Workspace</span>
              </button>
              <button
                onClick={() => {
                  setShowManageModal(true)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded flex-shrink-0 bg-white/10">
                  <Settings2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm text-white">Manage Workspaces</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Workspace Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => {
          setShowNewModal(false)
          setNewWorkspaceName('')
        }}
        title="Create New Workspace"
      >
        <div className="space-y-4">
          <p style={{ color: 'var(--text-secondary)' }}>
            Create a new workspace for a different client or project. Each workspace has its own functions, workflows, and data.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Workspace Name
            </label>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={e => setNewWorkspaceName(e.target.value)}
              placeholder="e.g., Acme Construction"
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--cream-light)',
                color: 'var(--text-primary)'
              }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateWorkspace()}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowNewModal(false)
                setNewWorkspaceName('')
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Create Workspace
            </button>
          </div>
        </div>
      </Modal>

      {/* Manage Workspaces Modal */}
      <Modal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        title="Manage Workspaces"
        maxWidth="28rem"
      >
        <div className="space-y-4">
          <p style={{ color: 'var(--text-secondary)' }}>
            Rename or delete your workspaces. Click on a workspace to switch to it.
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {workspaces.map(ws => (
              <div
                key={ws.id}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ 
                  background: ws.id === activeWorkspaceId 
                    ? 'var(--mint)' 
                    : 'var(--cream-light)',
                  border: `1px solid ${ws.id === activeWorkspaceId ? 'var(--gk-green)' : 'var(--stone)'}`
                }}
              >
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded flex-shrink-0"
                  style={{ 
                    background: ws.id === activeWorkspaceId 
                      ? 'var(--gk-green)' 
                      : 'var(--stone)' 
                  }}
                >
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {ws.name}
                  </div>
                  {ws.id === activeWorkspaceId && (
                    <div className="text-xs" style={{ color: 'var(--gk-green-dark)' }}>
                      Current workspace
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openRenameModal(ws)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/50"
                    title="Rename"
                  >
                    <Pencil className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(ws)}
                    disabled={workspaces.length <= 1}
                    className="p-2 rounded-lg transition-colors hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={workspaces.length <= 1 ? "Can't delete the last workspace" : "Delete"}
                  >
                    <Trash2 className="h-4 w-4" style={{ color: '#c4785a' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowManageModal(false)}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: 'var(--gk-green)' }}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Rename Workspace Modal */}
      <Modal
        isOpen={showRenameModal}
        onClose={() => {
          setShowRenameModal(false)
          setEditingWorkspace(null)
        }}
        title="Rename Workspace"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Workspace Name
            </label>
            <input
              type="text"
              value={editingWorkspace?.name || ''}
              onChange={e => setEditingWorkspace(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--cream-light)',
                color: 'var(--text-primary)'
              }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleRenameWorkspace()}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowRenameModal(false)
                setEditingWorkspace(null)
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleRenameWorkspace}
              disabled={!editingWorkspace?.name.trim()}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Workspace Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setEditingWorkspace(null)
        }}
        title="Delete Workspace?"
      >
        <div className="space-y-4">
          <div 
            className="flex items-center gap-3 p-4 rounded-lg"
            style={{ background: '#fce8e0' }}
          >
            <Trash2 className="h-6 w-6 flex-shrink-0" style={{ color: '#c4785a' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                This will permanently delete "{editingWorkspace?.name}"
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                All functions, workflows, activities, people, and roles in this workspace will be lost. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setEditingWorkspace(null)
              }}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteWorkspace}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: '#c4785a' }}
            >
              Delete Workspace
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
