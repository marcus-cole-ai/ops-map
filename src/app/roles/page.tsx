'use client'

import { Header } from '@/components/layout/Header'
import { Briefcase } from 'lucide-react'

export default function RolesPage() {
  return (
    <div>
      <Header title="Roles" description="Roles that should own activities" />
      <div className="p-6">
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Coming in Phase 3</h3>
          <p className="mt-2 text-sm text-slate-500">
            Define roles and assign them to activities.
          </p>
        </div>
      </div>
    </div>
  )
}
