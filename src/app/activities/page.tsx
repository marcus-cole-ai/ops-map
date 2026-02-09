'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { useOpsMapStore } from '@/store'
import { Activity, Search, User, Briefcase, Monitor, CheckSquare, FileText, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export default function ActivitiesPage() {
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const updateCoreActivity = useOpsMapStore((state) => state.updateCoreActivity)
  const deleteCoreActivity = useOpsMapStore((state) => state.deleteCoreActivity)
  const people = useOpsMapStore((state) => state.people)
  const roles = useOpsMapStore((state) => state.roles)
  const software = useOpsMapStore((state) => state.software)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctionActivities = useOpsMapStore((state) => state.subFunctionActivities)
  const workflows = useOpsMapStore((state) => state.workflows)
  const phases = useOpsMapStore((state) => state.phases)
  const steps = useOpsMapStore((state) => state.steps)
  const stepActivities = useOpsMapStore((state) => state.stepActivities)
  const checklistItems = useOpsMapStore((state) => state.checklistItems)
  const addChecklistItem = useOpsMapStore((state) => state.addChecklistItem)
  const updateChecklistItem = useOpsMapStore((state) => state.updateChecklistItem)
  const deleteChecklistItem = useOpsMapStore((state) => state.deleteChecklistItem)
  const addPerson = useOpsMapStore((state) => state.addPerson)
  const addRole = useOpsMapStore((state) => state.addRole)
  const addSoftware = useOpsMapStore((state) => state.addSoftware)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [editingActivity, setEditingActivity] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  
  // Quick add states
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [showAddRole, setShowAddRole] = useState(false)
  const [showAddSoftware, setShowAddSoftware] = useState(false)
  const [quickAddName, setQuickAddName] = useState('')

  const filteredActivities = coreActivities.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectedActivityData = selectedActivity ? coreActivities.find(a => a.id === selectedActivity) : null

  // Get context for selected activity
  const getActivityContext = (activityId: string) => {
    // Where it appears in function chart
    const subFuncLinks = subFunctionActivities.filter(sfa => sfa.coreActivityId === activityId)
    const functionContext = subFuncLinks.map(link => {
      const subFunc = subFunctions.find(sf => sf.id === link.subFunctionId)
      const func = subFunc ? functions.find(f => f.id === subFunc.functionId) : null
      return { function: func, subFunction: subFunc }
    }).filter(c => c.function && c.subFunction)

    // Where it appears in workflows
    const stepLinks = stepActivities.filter(sa => sa.coreActivityId === activityId)
    const workflowContext = stepLinks.map(link => {
      const step = steps.find(s => s.id === link.stepId)
      const phase = step ? phases.find(p => p.id === step.phaseId) : null
      const workflow = phase ? workflows.find(w => w.id === phase.workflowId) : null
      return { workflow, phase, step }
    }).filter(c => c.workflow && c.phase && c.step)

    return { functionContext, workflowContext }
  }

  const handleUpdateActivity = () => {
    if (editingActivity && newName.trim()) {
      updateCoreActivity(editingActivity, { 
        name: newName.trim(), 
        description: newDescription.trim() || undefined 
      })
      setEditingActivity(null)
      setNewName('')
      setNewDescription('')
    }
  }

  const handleAddChecklist = () => {
    if (selectedActivity && newChecklistItem.trim()) {
      addChecklistItem(selectedActivity, newChecklistItem.trim())
      setNewChecklistItem('')
    }
  }

  const activityChecklist = selectedActivity 
    ? checklistItems.filter(ci => ci.coreActivityId === selectedActivity).sort((a, b) => a.orderIndex - b.orderIndex)
    : []

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Activity List */}
      <div className="w-96 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Core Activities</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="p-6 text-center">
              <Activity className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">
                {searchQuery ? 'No matching activities' : 'No activities yet'}
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const owner = activity.ownerId ? people.find(p => p.id === activity.ownerId) : null
              const role = activity.roleId ? roles.find(r => r.id === activity.roleId) : null
              const isSelected = selectedActivity === activity.id

              return (
                <div
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity.id)}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 text-sm">{activity.name}</h3>
                      {activity.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{activity.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {owner && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <User className="h-3 w-3" />
                            {owner.name}
                          </span>
                        )}
                        {role && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Briefcase className="h-3 w-3" />
                            {role.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Activity Detail Panel */}
      <div className="flex-1 bg-slate-50 overflow-y-auto">
        {selectedActivityData ? (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{selectedActivityData.name}</h1>
                {selectedActivityData.description && (
                  <p className="mt-1 text-slate-500">{selectedActivityData.description}</p>
                )}
              </div>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-2 hover:bg-white rounded-lg">
                    <MoreHorizontal className="h-5 w-5 text-slate-500" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="min-w-[140px] bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-50">
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none"
                      onClick={() => {
                        setNewName(selectedActivityData.name)
                        setNewDescription(selectedActivityData.description || '')
                        setEditingActivity(selectedActivityData.id)
                      }}
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                      onClick={() => {
                        deleteCoreActivity(selectedActivityData.id)
                        setSelectedActivity(null)
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            {/* Context - where this activity appears */}
            {(() => {
              const context = getActivityContext(selectedActivityData.id)
              return (context.functionContext.length > 0 || context.workflowContext.length > 0) && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Where this activity appears</h3>
                  
                  {context.functionContext.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-1">Function Chart:</p>
                      {context.functionContext.map((ctx, i) => (
                        <span key={i} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded mr-2 mb-1">
                          {ctx.function?.name} → {ctx.subFunction?.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {context.workflowContext.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Workflows:</p>
                      {context.workflowContext.map((ctx, i) => (
                        <span key={i} className="inline-block bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded mr-2 mb-1">
                          {ctx.workflow?.name} → {ctx.phase?.name} → {ctx.step?.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Assignments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Owner */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-medium text-slate-700">Owner</h3>
                </div>
                <select
                  value={selectedActivityData.ownerId || ''}
                  onChange={(e) => updateCoreActivity(selectedActivityData.id, { ownerId: e.target.value || undefined })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">No owner assigned</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddPerson(true)}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  + Add person
                </button>
              </div>

              {/* Role */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-medium text-slate-700">Role</h3>
                </div>
                <select
                  value={selectedActivityData.roleId || ''}
                  onChange={(e) => updateCoreActivity(selectedActivityData.id, { roleId: e.target.value || undefined })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">No role assigned</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddRole(true)}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  + Add role
                </button>
              </div>

              {/* Software */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-medium text-slate-700">Software</h3>
                </div>
                <p className="text-xs text-slate-500 mb-2">Multi-select coming soon</p>
                <button
                  onClick={() => setShowAddSoftware(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add software
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-700">Checklist</h3>
              </div>
              
              {activityChecklist.length > 0 && (
                <div className="space-y-2 mb-3">
                  {activityChecklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => updateChecklistItem(item.id, { completed: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`flex-1 text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => deleteChecklistItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                  placeholder="Add checklist item..."
                  className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleAddChecklist}
                  disabled={!newChecklistItem.trim()}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-700">Notes</h3>
              </div>
              <textarea
                value={selectedActivityData.notes || ''}
                onChange={(e) => updateCoreActivity(selectedActivityData.id, { notes: e.target.value })}
                placeholder="Add notes about this activity..."
                rows={4}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Activity className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">Select an activity to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Activity Modal */}
      <Modal
        open={editingActivity !== null}
        onClose={() => { setEditingActivity(null); setNewName(''); setNewDescription('') }}
        title="Edit Activity"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setEditingActivity(null); setNewName(''); setNewDescription('') }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={handleUpdateActivity} disabled={!newName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">Save</button>
          </div>
        </div>
      </Modal>

      {/* Quick Add Person Modal */}
      <Modal
        open={showAddPerson}
        onClose={() => { setShowAddPerson(false); setQuickAddName('') }}
        title="Add Person"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={quickAddName}
            onChange={(e) => setQuickAddName(e.target.value)}
            placeholder="Person name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowAddPerson(false); setQuickAddName('') }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button 
              onClick={() => { 
                if (quickAddName.trim()) {
                  addPerson(quickAddName.trim())
                  setShowAddPerson(false)
                  setQuickAddName('')
                }
              }} 
              disabled={!quickAddName.trim()} 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </Modal>

      {/* Quick Add Role Modal */}
      <Modal
        open={showAddRole}
        onClose={() => { setShowAddRole(false); setQuickAddName('') }}
        title="Add Role"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={quickAddName}
            onChange={(e) => setQuickAddName(e.target.value)}
            placeholder="Role name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowAddRole(false); setQuickAddName('') }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button 
              onClick={() => { 
                if (quickAddName.trim()) {
                  addRole(quickAddName.trim())
                  setShowAddRole(false)
                  setQuickAddName('')
                }
              }} 
              disabled={!quickAddName.trim()} 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </Modal>

      {/* Quick Add Software Modal */}
      <Modal
        open={showAddSoftware}
        onClose={() => { setShowAddSoftware(false); setQuickAddName('') }}
        title="Add Software"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={quickAddName}
            onChange={(e) => setQuickAddName(e.target.value)}
            placeholder="Software name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowAddSoftware(false); setQuickAddName('') }} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button 
              onClick={() => { 
                if (quickAddName.trim()) {
                  addSoftware(quickAddName.trim())
                  setShowAddSoftware(false)
                  setQuickAddName('')
                }
              }} 
              disabled={!quickAddName.trim()} 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
