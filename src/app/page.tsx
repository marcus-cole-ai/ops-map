'use client'

import { useOpsMapStore } from '@/store'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import { LayoutGrid, GitBranch, Activity, AlertCircle } from 'lucide-react'

export default function Home() {
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
    {
      name: 'Functions',
      value: functions.length,
      icon: LayoutGrid,
      color: 'bg-blue-500',
      href: '/function-chart',
    },
    {
      name: 'Workflows',
      value: workflows.length,
      icon: GitBranch,
      color: 'bg-emerald-500',
      href: '/workflows',
    },
    {
      name: 'Core Activities',
      value: coreActivities.length,
      icon: Activity,
      color: 'bg-violet-500',
      href: '/activities',
    },
    {
      name: 'Gaps Found',
      value: totalGaps,
      icon: AlertCircle,
      color: totalGaps > 0 ? 'bg-amber-500' : 'bg-slate-400',
      href: '/function-chart',
    },
  ]

  return (
    <div>
      <Header 
        title="Dashboard" 
        description="Overview of your operations map" 
      />
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Start</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href="/function-chart"
              className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Build Your Function Chart</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Define what happens in your business — functions, sub-functions, and core activities.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/workflows"
              className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Map Your Workflows</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Show how work flows through your business — phases, steps, and linked activities.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {functions.length === 0 && workflows.length === 0 && (
          <div className="mt-8 rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <LayoutGrid className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No data yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Start by creating your first function or workflow to map your operations.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/function-chart"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Function Chart
              </Link>
              <Link
                href="/workflows"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Create Workflow
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
