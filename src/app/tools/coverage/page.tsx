'use client'

import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import { CheckCircle, AlertCircle, XCircle, TrendingUp, Users, Briefcase, Activity, Download } from 'lucide-react'
import Link from 'next/link'

export default function CoveragePage() {
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const workflows = useOpsMapStore((state) => state.workflows)
  const phases = useOpsMapStore((state) => state.phases)
  const steps = useOpsMapStore((state) => state.steps)
  const people = useOpsMapStore((state) => state.people)
  const roles = useOpsMapStore((state) => state.roles)
  const subFunctionActivities = useOpsMapStore((state) => state.subFunctionActivities)
  const getActivitiesForSubFunction = useOpsMapStore((state) => state.getActivitiesForSubFunction)

  // Calculate coverage metrics
  const metrics = {
    // Functions
    totalFunctions: functions.length,
    functionsWithSubs: functions.filter(f => subFunctions.some(sf => sf.functionId === f.id)).length,
    
    // Sub-functions
    totalSubFunctions: subFunctions.length,
    subFunctionsWithActivities: subFunctions.filter(sf => 
      subFunctionActivities.some(sfa => sfa.subFunctionId === sf.id)
    ).length,
    
    // Activities
    totalActivities: coreActivities.length,
    activitiesWithOwner: coreActivities.filter(a => a.ownerId).length,
    activitiesWithRole: coreActivities.filter(a => a.roleId).length,
    activitiesWithDescription: coreActivities.filter(a => a.description).length,
    
    // Workflows
    totalWorkflows: workflows.length,
    totalPhases: phases.length,
    phasesWithSteps: phases.filter(p => steps.some(s => s.phaseId === p.id)).length,
    totalSteps: steps.length,
    
    // People
    totalPeople: people.length,
    peopleWithRole: people.filter(p => p.roleId).length,
    
    // Roles
    totalRoles: roles.length,
    rolesWithPeople: roles.filter(r => people.some(p => p.roleId === r.id)).length,
    rolesWithActivities: roles.filter(r => coreActivities.some(a => a.roleId === r.id)).length,
  }

  // Calculate percentages
  const calcPercent = (part: number, total: number) => total > 0 ? Math.round((part / total) * 100) : 0

  const coverageAreas = [
    {
      title: 'Function Structure',
      items: [
        { label: 'Functions with sub-functions', value: metrics.functionsWithSubs, total: metrics.totalFunctions, href: '/function-chart' },
        { label: 'Sub-functions with activities', value: metrics.subFunctionsWithActivities, total: metrics.totalSubFunctions, href: '/function-chart' },
      ],
    },
    {
      title: 'Activity Assignments',
      items: [
        { label: 'Activities with owner', value: metrics.activitiesWithOwner, total: metrics.totalActivities, href: '/activities' },
        { label: 'Activities with role', value: metrics.activitiesWithRole, total: metrics.totalActivities, href: '/activities' },
        { label: 'Activities with description', value: metrics.activitiesWithDescription, total: metrics.totalActivities, href: '/activities' },
      ],
    },
    {
      title: 'Workflow Completeness',
      items: [
        { label: 'Phases with steps', value: metrics.phasesWithSteps, total: metrics.totalPhases, href: '/workflows' },
      ],
    },
    {
      title: 'Team Coverage',
      items: [
        { label: 'People with assigned role', value: metrics.peopleWithRole, total: metrics.totalPeople, href: '/people' },
        { label: 'Roles with people', value: metrics.rolesWithPeople, total: metrics.totalRoles, href: '/roles' },
        { label: 'Roles with activities', value: metrics.rolesWithActivities, total: metrics.totalRoles, href: '/roles' },
      ],
    },
  ]

  // Calculate overall score
  const totalChecks = coverageAreas.flatMap(a => a.items)
  const totalPossible = totalChecks.reduce((sum, item) => sum + item.total, 0)
  const totalActual = totalChecks.reduce((sum, item) => sum + item.value, 0)
  const overallScore = calcPercent(totalActual, totalPossible)

  const getStatusIcon = (percent: number) => {
    if (percent >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (percent >= 50) return <AlertCircle className="h-5 w-5 text-amber-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500'
    if (percent >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  // Generate report text
  const generateReport = () => {
    let report = `OPSMAP COVERAGE REPORT\n`
    report += `${'='.repeat(50)}\n`
    report += `Generated: ${new Date().toLocaleString()}\n`
    report += `Overall Score: ${overallScore}%\n\n`

    coverageAreas.forEach(area => {
      report += `${area.title.toUpperCase()}\n`
      report += `${'-'.repeat(30)}\n`
      area.items.forEach(item => {
        const percent = calcPercent(item.value, item.total)
        const status = percent >= 80 ? '✓' : percent >= 50 ? '!' : '✗'
        report += `${status} ${item.label}: ${item.value}/${item.total} (${percent}%)\n`
      })
      report += `\n`
    })

    return report
  }

  const handleDownload = () => {
    const report = generateReport()
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coverage-report-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Header
        title="Coverage Report"
        description="See how complete your operations map is"
        extraActions={
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        }
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Overall Score */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <div className="text-5xl font-bold text-slate-900">{overallScore}%</div>
            <div className="text-slate-500 mt-1">Overall Coverage Score</div>
            <div className="mt-4 h-3 bg-slate-100 rounded-full max-w-md mx-auto overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getStatusColor(overallScore)}`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          {/* Coverage Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coverageAreas.map((area) => (
              <div key={area.title} className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">{area.title}</h3>
                <div className="space-y-4">
                  {area.items.map((item, i) => {
                    const percent = calcPercent(item.value, item.total)
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(percent)}
                            <span className="text-sm text-slate-700">{item.label}</span>
                          </div>
                          <Link href={item.href} className="text-sm text-blue-600 hover:underline">
                            {item.value}/{item.total}
                          </Link>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getStatusColor(percent)}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <Activity className="h-6 w-6 mx-auto text-violet-500" />
              <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalActivities}</div>
              <div className="text-xs text-slate-500">Activities</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <Users className="h-6 w-6 mx-auto text-orange-500" />
              <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalPeople}</div>
              <div className="text-xs text-slate-500">People</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <Briefcase className="h-6 w-6 mx-auto text-pink-500" />
              <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalRoles}</div>
              <div className="text-xs text-slate-500">Roles</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto text-green-500" />
              <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalWorkflows}</div>
              <div className="text-xs text-slate-500">Workflows</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
