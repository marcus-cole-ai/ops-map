'use client'

import { useState, useRef, useEffect } from 'react'
import { useOpsMapStore } from '@/store'
import { 
  Building2, 
  Download, 
  Upload, 
  Trash2, 
  Database,
  FileJson,
  AlertTriangle,
  Check,
  Sparkles
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

export default function SettingsPage() {
  const {
    company,
    setCompany,
    clearAllData,
    loadDemoData,
    loadTemplate,
    functions,
    subFunctions,
    coreActivities,
    workflows,
    phases,
    steps,
    people,
    roles,
    software,
    checklistItems,
  } = useOpsMapStore()

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDemoConfirm, setShowDemoConfirm] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [companyName, setCompanyName] = useState(company?.name || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync company name when store changes (e.g., after loading demo data)
  useEffect(() => {
    if (company?.name) {
      setCompanyName(company.name)
    }
  }, [company?.name])

  const handleExport = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company,
      functions,
      subFunctions,
      coreActivities,
      workflows,
      phases,
      steps,
      people,
      roles,
      software,
      checklistItems,
      // Include link tables
      subFunctionActivities: useOpsMapStore.getState().subFunctionActivities,
      stepActivities: useOpsMapStore.getState().stepActivities,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `opsmap-${company?.name?.toLowerCase().replace(/\s+/g, '-') || 'export'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        
        // Validate it has the expected structure
        if (!data.company || !data.version) {
          alert('Invalid OpsMap export file')
          return
        }

        // Clear and reload
        clearAllData()
        
        // Set company
        if (data.company) {
          setCompany(data.company)
        }

        // Reload all data (this is simplified - in production would use proper store methods)
        const store = useOpsMapStore.getState()
        
        // Functions
        data.functions?.forEach((f: any) => {
          const newFunc = store.addFunction(f.name, f.description)
          store.updateFunction(newFunc.id, { color: f.color, orderIndex: f.orderIndex })
        })
        
        // SubFunctions
        const funcMap: Record<string, string> = {}
        store.functions.forEach((f, i) => {
          if (data.functions[i]) {
            funcMap[data.functions[i].id] = f.id
          }
        })
        
        data.subFunctions?.forEach((sf: any) => {
          const newFuncId = funcMap[sf.functionId]
          if (newFuncId) {
            store.addSubFunction(newFuncId, sf.name, sf.description)
          }
        })

        // Roles
        data.roles?.forEach((r: any) => {
          store.addRole(r.name, r.description)
        })

        // People
        data.people?.forEach((p: any) => {
          store.addPerson(p.name, p.email)
        })

        // Software
        data.software?.forEach((s: any) => {
          store.addSoftware(s.name, s.url)
        })

        // Activities
        data.coreActivities?.forEach((a: any) => {
          store.addCoreActivity(a.name, a.description)
        })

        // Workflows
        data.workflows?.forEach((w: any) => {
          store.addWorkflow(w.name, w.description)
        })

        setImportSuccess(true)
        setTimeout(() => setImportSuccess(false), 3000)
        setCompanyName(data.company?.name || '')
      } catch (err) {
        alert('Error reading file. Make sure it\'s a valid OpsMap export.')
      }
    }
    reader.readAsText(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSaveCompanyName = () => {
    if (company && companyName.trim()) {
      setCompany({ ...company, name: companyName.trim() })
    }
  }

  const templates = [
    {
      id: 'residential-remodeler',
      name: 'Residential Remodeler',
      description: 'Kitchen/bath remodel companies',
      icon: '🏠'
    },
    {
      id: 'general-contractor',
      name: 'General Contractor',
      description: 'Commercial/new construction',
      icon: '🏗️'
    },
    {
      id: 'specialty-contractor',
      name: 'Specialty Contractor',
      description: 'Electrical, plumbing, HVAC trades',
      icon: '⚡'
    },
  ]

  return (
    <div className="min-h-full p-8" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your company details and data
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Company Name */}
        <div 
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg"
              style={{ background: 'var(--mint)' }}
            >
              <Building2 className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Company Name
            </h2>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: 'var(--stone)', 
                background: 'var(--cream-light)',
                color: 'var(--text-primary)'
              }}
            />
            <button
              onClick={handleSaveCompanyName}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: 'var(--gk-green)' }}
            >
              Save
            </button>
          </div>
        </div>

        {/* Industry Templates */}
        <div 
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg"
              style={{ background: 'var(--sand)' }}
            >
              <Sparkles className="h-5 w-5" style={{ color: '#b8956e' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Industry Templates
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Start with a pre-built template for your industry. This will replace your current data.
          </p>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
            style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
          >
            <Sparkles className="h-4 w-4" />
            Choose Template
          </button>
        </div>

        {/* Data Management */}
        <div 
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg"
              style={{ background: 'var(--dusty-blue)' }}
            >
              <Database className="h-5 w-5" style={{ color: '#3d4f5f' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Data Management
            </h2>
          </div>
          
          <div className="space-y-3">
            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{ background: 'var(--cream-light)' }}
            >
              <Download className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
              <div className="flex-1 text-left">
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Export Data
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Download your OpsMap data as JSON
                </div>
              </div>
              <FileJson className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </button>

            {/* Import */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                style={{ background: 'var(--cream-light)' }}
              >
                <Upload className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
                <div className="flex-1 text-left">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Import Data
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Restore from a previous export
                  </div>
                </div>
                {importSuccess && (
                  <Check className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
                )}
              </div>
            </div>

            {/* Load Demo */}
            <button
              onClick={() => setShowDemoConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{ background: 'var(--cream-light)' }}
            >
              <Database className="h-5 w-5" style={{ color: '#b8956e' }} />
              <div className="flex-1 text-left">
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Load Demo Data
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Load sample construction company data
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div 
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid #c4785a' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg"
              style={{ background: '#fce8e0' }}
            >
              <AlertTriangle className="h-5 w-5" style={{ color: '#c4785a' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: '#c4785a' }}>
              Danger Zone
            </h2>
          </div>
          
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            style={{ background: '#fce8e0' }}
          >
            <Trash2 className="h-5 w-5" style={{ color: '#c4785a' }} />
            <div className="flex-1 text-left">
              <div className="font-medium" style={{ color: '#c4785a' }}>
                Clear All Data
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Delete everything and start fresh
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Clear Confirm Modal */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All Data?"
      >
        <div className="space-y-4">
          <div 
            className="flex items-center gap-3 p-4 rounded-lg"
            style={{ background: '#fce8e0' }}
          >
            <AlertTriangle className="h-6 w-6" style={{ color: '#c4785a' }} />
            <p style={{ color: 'var(--text-primary)' }}>
              This will permanently delete all your functions, workflows, activities, people, and roles. This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                clearAllData()
                setCompanyName('My Company')
                setShowClearConfirm(false)
              }}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: '#c4785a' }}
            >
              Delete Everything
            </button>
          </div>
        </div>
      </Modal>

      {/* Demo Confirm Modal */}
      <Modal
        isOpen={showDemoConfirm}
        onClose={() => setShowDemoConfirm(false)}
        title="Load Demo Data?"
      >
        <div className="space-y-4">
          <p style={{ color: 'var(--text-secondary)' }}>
            This will replace your current data with sample construction company data (Summit Construction Co.). Your current data will be lost.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDemoConfirm(false)}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                loadDemoData()
                setCompanyName('Summit Construction Co.')
                setShowDemoConfirm(false)
              }}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: 'var(--gk-green)' }}
            >
              Load Demo Data
            </button>
          </div>
        </div>
      </Modal>

      {/* Template Selection Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Choose Industry Template"
        maxWidth="32rem"
      >
        <div className="space-y-4">
          <p style={{ color: 'var(--text-secondary)' }}>
            Select a template that matches your business. This will replace your current data with a pre-built structure.
          </p>
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  loadTemplate(template.id)
                  setCompanyName(template.name + ' Company')
                  setShowTemplateModal(false)
                }}
                className="w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors"
                style={{ 
                  background: 'var(--cream-light)',
                  border: '1px solid var(--stone)'
                }}
              >
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {template.name}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {template.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowTemplateModal(false)}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
