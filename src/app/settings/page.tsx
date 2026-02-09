'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import { Building2 } from 'lucide-react'

export default function SettingsPage() {
  const company = useOpsMapStore((state) => state.company)
  const setCompany = useOpsMapStore((state) => state.setCompany)
  const [companyName, setCompanyName] = useState(company?.name || '')

  const handleSave = () => {
    if (company && companyName.trim()) {
      setCompany({ ...company, name: companyName.trim() })
    }
  }

  return (
    <div>
      <Header title="Settings" description="Configure your OpsMap" />
      <div className="p-6">
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
      </div>
    </div>
  )
}
