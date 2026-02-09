'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { useOpsMapStore } from '@/store'
import { Building2, Database, Trash2, Download, Upload } from 'lucide-react'

export default function SettingsPage() {
  const company = useOpsMapStore((state) => state.company)
  const setCompany = useOpsMapStore((state) => state.setCompany)
  const clearAllData = useOpsMapStore((state) => state.clearAllData)
  const loadDemoData = useOpsMapStore((state) => state.loadDemoData)
  
  const functions = useOpsMapStore((state) => state.functions)
  const workflows = useOpsMapStore((state) => state.workflows)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)

  const [companyName, setCompanyName] = useState(company?.name || '')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDemoConfirm, setShowDemoConfirm] = useState(false)

  const handleSave = () => {
    if (company && companyName.trim()) {
      setCompany({ ...company, name: companyName.trim() })
    }
  }

  const handleExportData = () => {
    const state = useOpsMapStore.getState()
    const data = {
      company: state.company,
      functions: state.functions,
      subFunctions: state.subFunctions,
      coreActivities: state.coreActivities,
      subFunctionActivities: state.subFunctionActivities,
      workflows: state.workflows,
      phases: state.phases,
      steps: state.steps,
      stepActivities: state.stepActivities,
      people: state.people,
      roles: state.roles,
      software: state.software,
      checklistItems: state.checklistItems,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `opsmap-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // Validate it has expected structure
        if (data.company && data.functions) {
          useOpsMapStore.setState({
            company: data.company,
            functions: data.functions || [],
            subFunctions: data.subFunctions || [],
            coreActivities: data.coreActivities || [],
            subFunctionActivities: data.subFunctionActivities || [],
            workflows: data.workflows || [],
            phases: data.phases || [],
            steps: data.steps || [],
            stepActivities: data.stepActivities || [],
            people: data.people || [],
            roles: data.roles || [],
            software: data.software || [],
            checklistItems: data.checklistItems || [],
          })
          alert('Data imported successfully!')
        } else {
          alert('Invalid backup file format')
        }
      } catch {
        alert('Failed to parse backup file')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  const hasData = functions.length > 0 || workflows.length > 0 || coreActivities.length > 0

  return (
    <div>
      <Header title="Settings" description="Configure your OpsMap" />
      <div className="p-6 space-y-6">
        {/* Company Settings */}
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Company Settings</h3>
              <p className="text-sm text-slate-500">Basic information about your company</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Database className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Data Management</h3>
              <p className="text-sm text-slate-500">Export, import, or reset your data</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Export */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Export Data</h4>
                <p className="text-sm text-slate-500">Download a backup of all your data</p>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
            </div>

            {/* Import */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Import Data</h4>
                <p className="text-sm text-slate-500">Restore from a backup file</p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                <Upload className="h-4 w-4" />
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            {/* Demo Data */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div>
                <h4 className="font-medium text-slate-900">Load Demo Data</h4>
                <p className="text-sm text-slate-500">Load sample construction company data</p>
              </div>
              <button
                onClick={() => setShowDemoConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              >
                <Database className="h-4 w-4" />
                Load Demo
              </button>
            </div>

            {/* Clear */}
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h4 className="font-medium text-slate-900">Clear All Data</h4>
                <p className="text-sm text-slate-500">Delete everything and start fresh</p>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Current Data</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{functions.length}</p>
              <p className="text-xs text-slate-500">Functions</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{workflows.length}</p>
              <p className="text-xs text-slate-500">Workflows</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{coreActivities.length}</p>
              <p className="text-xs text-slate-500">Activities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirm Modal */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All Data?"
        description="This will permanently delete all your functions, workflows, activities, and other data. This cannot be undone."
      >
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setShowClearConfirm(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              clearAllData()
              setShowClearConfirm(false)
              setCompanyName('My Company')
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Yes, Clear Everything
          </button>
        </div>
      </Modal>

      {/* Demo Confirm Modal */}
      <Modal
        open={showDemoConfirm}
        onClose={() => setShowDemoConfirm(false)}
        title="Load Demo Data?"
        description={hasData 
          ? "This will replace your current data with sample construction company data. Your existing data will be lost."
          : "This will load sample construction company data to help you explore the app."
        }
      >
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setShowDemoConfirm(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              loadDemoData()
              setShowDemoConfirm(false)
              setCompanyName('Summit Construction Co.')
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
          >
            Load Demo Data
          </button>
        </div>
      </Modal>
    </div>
  )
}
