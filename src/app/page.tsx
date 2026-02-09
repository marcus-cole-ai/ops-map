'use client'

import { useOpsMapStore } from '@/store'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import { LayoutGrid, GitBranch, Activity, AlertCircle, Users, Briefcase, Monitor, ArrowRight, Zap } from 'lucide-react'

export default function Home() {
  const company = useOpsMapStore((state) => state.company)
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const workflows = useOpsMapStore((state) => state.workflows)
  const phases = useOpsMapStore((state) => state.phases)
  const steps = useOpsMapStore((state) => state.steps)
  const people = useOpsMapStore((state) => state.people)
  const roles = useOpsMapStore((state) => state.roles)
  const software = useOpsMapStore((state) => state.software)

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
  const activitiesWithNoOwner = coreActivities.filter(a => !a.ownerId)
  const totalGaps = functionsWithNoSubs.length + subFunctionsWithNoActivities.length + phasesWithNoSteps.length

  // Calculate completion percentage
  const totalItems = functions.length + subFunctions.length + phases.length + coreActivities.length
  const incompleteItems = functionsWithNoSubs.length + subFunctionsWithNoActivities.length + phasesWithNoSteps.length + activitiesWithNoOwner.length
  const completionPercent = totalItems > 0 ? Math.round(((totalItems - incompleteItems) / totalItems) * 100) : 0

  const hasData = functions.length > 0 || workflows.length > 0

  const mainStats = [
    { name: 'Functions', value: functions.length, subValue: `${subFunctions.length} sub-functions`, icon: LayoutGrid, color: 'bg-blue-500', href: '/function-chart' },
    { name: 'Workflows', value: workflows.length, subValue: `${phases.length} phases, ${steps.length} steps`, icon: GitBranch, color: 'bg-emerald-500', href: '/workflows' },
    { name: 'Activities', value: coreActivities.length, subValue: `${activitiesWithNoOwner.length} unassigned`, icon: Activity, color: 'bg-violet-500', href: '/activities' },
    { name: 'Gaps', value: totalGaps, subValue: totalGaps > 0 ? 'Need attention' : 'All complete', icon: AlertCircle, color: totalGaps > 0 ? 'bg-amber-500' : 'bg-green-500', href: '/gaps' },
  ]

  const secondaryStats = [
    { name: 'People', value: people.length, icon: Users, href: '/people' },
    { name: 'Roles', value: roles.length, icon: Briefcase, href: '/roles' },
    { name: 'Software', value: software.length, icon: Monitor, href: '/software' },
  ]

  return (
    <div>
      <Header 
        title={`${company?.name || 'My Company'}`} 
        description="Operations mapping dashboard" 
      />
      
      <div className="p-6 space-y-8">
        {/* Completion Progress (only show if there's data) */}
        {hasData && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Operations Map Progress</h2>
                <p className="text-sm text-slate-500">Completeness of your business documentation</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-900">{completionPercent}%</span>
                <p className="text-xs text-slate-500">complete</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainStats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subValue}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions & Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/function-chart"
                className="group p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Function Chart</h3>
                    <p className="text-xs text-slate-500">Define what happens</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/workflows"
                className="group p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Workflows</h3>
                    <p className="text-xs text-slate-500">Map how work flows</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/gaps"
                className="group p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Find Gaps</h3>
                    <p className="text-xs text-slate-500">Identify incomplete areas</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/settings"
                className="group p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Load Demo</h3>
                    <p className="text-xs text-slate-500">Try with sample data</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Resources</h2>
            <div className="space-y-3">
              {secondaryStats.map((stat) => (
                <Link
                  key={stat.name}
                  href={stat.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <stat.icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{stat.name}</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">{stat.value}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!hasData && (
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl border-2 border-dashed border-blue-200 p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-6">
              <LayoutGrid className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Ready to map your operations?</h3>
            <p className="mt-2 text-slate-600 max-w-md mx-auto">
              Start by building your function chart to define what happens in your business, 
              then create workflows to show how work flows through it.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/function-chart"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Build Function Chart
              </Link>
              <Link
                href="/settings"
                className="px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Load Demo Data
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
