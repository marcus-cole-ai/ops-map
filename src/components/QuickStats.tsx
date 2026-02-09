'use client'

import { useOpsMapStore } from '@/store'
import { LayoutGrid, GitBranch, Activity, AlertCircle } from 'lucide-react'

interface QuickStatsProps {
  compact?: boolean
}

export function QuickStats({ compact = false }: QuickStatsProps) {
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const workflows = useOpsMapStore((state) => state.workflows)
  const phases = useOpsMapStore((state) => state.phases)
  const steps = useOpsMapStore((state) => state.steps)

  // Calculate gaps
  const functionsWithNoSubs = functions.filter(
    (f) => !subFunctions.some((sf) => sf.functionId === f.id)
  )
  const subFunctionsWithNoActivities = subFunctions.filter(
    (sf) => !useOpsMapStore.getState().getActivitiesForSubFunction(sf.id).length
  )
  const phasesWithNoSteps = phases.filter(
    (p) => !steps.some((s) => s.phaseId === p.id)
  )
  const totalGaps = functionsWithNoSubs.length + subFunctionsWithNoActivities.length + phasesWithNoSteps.length

  const stats = [
    { icon: LayoutGrid, value: functions.length, label: 'Functions', color: 'text-blue-500' },
    { icon: GitBranch, value: workflows.length, label: 'Workflows', color: 'text-emerald-500' },
    { icon: Activity, value: coreActivities.length, label: 'Activities', color: 'text-violet-500' },
    { icon: AlertCircle, value: totalGaps, label: 'Gaps', color: totalGaps > 0 ? 'text-amber-500' : 'text-green-500' },
  ]

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
            <span className="font-medium text-slate-700">{stat.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg border border-slate-200 p-3 text-center">
          <stat.icon className={`h-5 w-5 mx-auto ${stat.color}`} />
          <p className="text-lg font-bold text-slate-900 mt-1">{stat.value}</p>
          <p className="text-xs text-slate-500">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
