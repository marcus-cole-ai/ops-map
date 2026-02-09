'use client'

import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import { GitBranch } from 'lucide-react'

export default function WorkflowsPage() {
  const workflows = useOpsMapStore((state) => state.workflows)

  return (
    <div>
      <Header
        title="Workflows"
        description="How work flows through your business — processes and steps"
      />
      <div className="p-6">
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <GitBranch className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Coming in Phase 2</h3>
          <p className="mt-2 text-sm text-slate-500">
            Workflow builder is next. First, build your function chart to define what happens.
          </p>
        </div>
      </div>
    </div>
  )
}
