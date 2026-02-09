'use client'

import { Header } from '@/components/layout/Header'
import { Monitor } from 'lucide-react'

export default function SoftwarePage() {
  return (
    <div>
      <Header title="Software" description="Tools used for activities" />
      <div className="p-6">
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <Monitor className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Coming in Phase 3</h3>
          <p className="mt-2 text-sm text-slate-500">
            Track what software is used for each activity.
          </p>
        </div>
      </div>
    </div>
  )
}
