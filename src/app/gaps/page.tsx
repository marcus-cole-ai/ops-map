'use client'

import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import { AlertCircle, CheckCircle, ChevronRight, LayoutGrid, GitBranch, Activity, User, Briefcase } from 'lucide-react'
import Link from 'next/link'

interface GapItem {
  type: 'function' | 'subfunction' | 'phase' | 'activity'
  severity: 'warning' | 'info'
  title: string
  description: string
  link: string
  linkText: string
}

export default function GapsPage() {
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const workflows = useOpsMapStore((state) => state.workflows)
  const phases = useOpsMapStore((state) => state.phases)
  const steps = useOpsMapStore((state) => state.steps)
  const subFunctionActivities = useOpsMapStore((state) => state.subFunctionActivities)
  const stepActivities = useOpsMapStore((state) => state.stepActivities)
  const people = useOpsMapStore((state) => state.people)
  const roles = useOpsMapStore((state) => state.roles)

  // Calculate gaps
  const gaps: GapItem[] = []

  // Functions with no sub-functions
  const functionsWithNoSubs = functions.filter(
    f => !subFunctions.some(sf => sf.functionId === f.id)
  )
  functionsWithNoSubs.forEach(f => {
    gaps.push({
      type: 'function',
      severity: 'warning',
      title: `"${f.name}" has no sub-functions`,
      description: 'Add sub-functions to break down this area of your business.',
      link: '/function-chart',
      linkText: 'Go to Function Chart',
    })
  })

  // Sub-functions with no activities
  const subFunctionsWithNoActivities = subFunctions.filter(
    sf => !subFunctionActivities.some(sfa => sfa.subFunctionId === sf.id)
  )
  subFunctionsWithNoActivities.forEach(sf => {
    const func = functions.find(f => f.id === sf.functionId)
    gaps.push({
      type: 'subfunction',
      severity: 'warning',
      title: `"${sf.name}" has no activities`,
      description: `Under ${func?.name || 'Unknown'} — add core activities to define what happens here.`,
      link: '/function-chart',
      linkText: 'Go to Function Chart',
    })
  })

  // Phases with no steps
  const phasesWithNoSteps = phases.filter(
    p => !steps.some(s => s.phaseId === p.id)
  )
  phasesWithNoSteps.forEach(p => {
    const workflow = workflows.find(w => w.id === p.workflowId)
    gaps.push({
      type: 'phase',
      severity: 'warning',
      title: `"${p.name}" phase has no steps`,
      description: `In ${workflow?.name || 'Unknown'} workflow — add steps to define the work in this phase.`,
      link: `/workflows/${p.workflowId}`,
      linkText: 'Go to Workflow',
    })
  })

  // Activities with no owner
  const activitiesWithNoOwner = coreActivities.filter(a => !a.ownerId)
  activitiesWithNoOwner.forEach(a => {
    gaps.push({
      type: 'activity',
      severity: 'info',
      title: `"${a.name}" has no owner`,
      description: 'Assign a person to take responsibility for this activity.',
      link: '/activities',
      linkText: 'Go to Activities',
    })
  })

  // Activities with no role
  const activitiesWithNoRole = coreActivities.filter(a => !a.roleId)
  activitiesWithNoRole.forEach(a => {
    gaps.push({
      type: 'activity',
      severity: 'info',
      title: `"${a.name}" has no role assigned`,
      description: 'Assign a role to clarify who should own this type of work.',
      link: '/activities',
      linkText: 'Go to Activities',
    })
  })

  // Stats
  const warningCount = gaps.filter(g => g.severity === 'warning').length
  const infoCount = gaps.filter(g => g.severity === 'info').length

  const stats = [
    { label: 'Functions', value: functions.length, icon: LayoutGrid, color: 'bg-blue-500' },
    { label: 'Workflows', value: workflows.length, icon: GitBranch, color: 'bg-emerald-500' },
    { label: 'Activities', value: coreActivities.length, icon: Activity, color: 'bg-violet-500' },
    { label: 'People', value: people.length, icon: User, color: 'bg-orange-500' },
    { label: 'Roles', value: roles.length, icon: Briefcase, color: 'bg-pink-500' },
  ]

  return (
    <div>
      <Header
        title="Gap Analysis"
        description="Identify incomplete areas in your operations map"
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex items-center gap-6 mb-6">
          {gaps.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">All complete! No gaps found.</span>
            </div>
          ) : (
            <>
              {warningCount > 0 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{warningCount} structural gaps</span>
                </div>
              )}
              {infoCount > 0 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{infoCount} assignments missing</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Gap List */}
        {gaps.length > 0 && (
          <div className="space-y-3">
            {gaps.map((gap, i) => (
              <div
                key={i}
                className={`rounded-xl border bg-white p-4 ${
                  gap.severity === 'warning' ? 'border-amber-200' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${gap.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{gap.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{gap.description}</p>
                  </div>
                  <Link
                    href={gap.link}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                  >
                    {gap.linkText}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {gaps.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Operations map is complete!</h3>
            <p className="mt-2 text-sm text-slate-500">
              All functions have sub-functions, all sub-functions have activities, and all phases have steps.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
