'use client'

import { useOpsMapStore } from '@/store'
import Link from 'next/link'
import { 
  LayoutGrid, 
  GitBranch, 
  Activity, 
  Users, 
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react'
// WelcomeModal is in AppShell - no need to import here

export default function DashboardPage() {
  const {
    company,
    functions,
    subFunctions,
    coreActivities,
    workflows,
    phases,
    steps,
    people,
    roles,
  } = useOpsMapStore()

  // Calculate stats
  const healthActivities = coreActivities.filter((a) => a.status !== 'archived')
  const healthWorkflows = workflows.filter((w) => w.status !== 'archived')
  const activitiesWithOwner = healthActivities.filter((a) => a.ownerId).length
  const activitiesWithRole = healthActivities.filter((a) => a.roleId).length
  const assignedActivities = healthActivities.filter((a) => a.ownerId || a.roleId).length
  const unassignedActivities = healthActivities.length - assignedActivities
  const workflowStatusCounts = {
    active: healthWorkflows.filter((w) => w.status === 'active').length,
    draft: healthWorkflows.filter((w) => w.status === 'draft').length,
    gap: healthWorkflows.filter((w) => w.status === 'gap').length,
  }
  const activityStatusCounts = {
    active: healthActivities.filter((a) => a.status === 'active').length,
    draft: healthActivities.filter((a) => a.status === 'draft').length,
    gap: healthActivities.filter((a) => a.status === 'gap').length,
  }
  
  const completionRate = healthActivities.length > 0 
    ? Math.round((assignedActivities / healthActivities.length) * 100) 
    : 0

  const stats = [
    {
      label: 'Functions',
      value: functions.length,
      subLabel: `${subFunctions.length} sub-functions`,
      icon: LayoutGrid,
      href: '/function-chart',
      color: 'var(--gk-green)',
    },
    {
      label: 'Workflows',
      value: workflows.length,
      subLabel: `${phases.length} phases, ${steps.length} steps`,
      icon: GitBranch,
      href: '/workflows',
      color: '#c4785a',
    },
    {
      label: 'Core Activities',
      value: coreActivities.length,
      subLabel: `${assignedActivities} assigned`,
      icon: Activity,
      href: '/activities',
      color: '#3d4f5f',
    },
    {
      label: 'People',
      value: people.length,
      subLabel: `${roles.length} roles defined`,
      icon: Users,
      href: '/people',
      color: '#8b6b7b',
    },
  ]

  return (
    <div className="min-h-full p-8" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {company?.name || 'OpsMap'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Map your operations, identify gaps, and build clarity
        </p>
      </div>

      {/* Completion Progress */}
      <div 
        className="rounded-xl p-6 mb-8"
        style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Operations Coverage
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {assignedActivities} of {healthActivities.length} core activities have an owner or role assigned
            </p>
          </div>
          <div 
            className="text-3xl font-bold"
            style={{ color: completionRate >= 80 ? 'var(--gk-green)' : completionRate >= 50 ? '#b8956e' : '#c4785a' }}
          >
            {completionRate}%
          </div>
        </div>
        <div 
          className="h-3 rounded-full overflow-hidden"
          style={{ background: 'var(--cream)' }}
        >
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${completionRate}%`,
              background: completionRate >= 80 ? 'var(--gk-green)' : completionRate >= 50 ? '#b8956e' : '#c4785a'
            }}
          />
        </div>
        {unassignedActivities > 0 && (
          <Link 
            href="/gaps"
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium transition-colors"
            style={{ color: 'var(--gk-green)' }}
          >
            <AlertCircle className="h-4 w-4" />
            {unassignedActivities} activities need attention
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div 
        className="rounded-xl p-6 mb-8"
        style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Status Breakdown
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {workflowStatusCounts.active} active workflows, {workflowStatusCounts.draft} in draft, {workflowStatusCounts.gap} gaps identified
            </p>
          </div>
          <Link
            href="/ops-health"
            className="text-sm font-medium"
            style={{ color: 'var(--gk-green)' }}
          >
            View Ops Health
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stone)', background: 'var(--cream-light)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Workflows
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span style={{ color: '#2f855a' }}>{workflowStatusCounts.active} Active</span>
              <span style={{ color: '#b7791f' }}>{workflowStatusCounts.draft} Draft</span>
              <span style={{ color: '#718096' }}>{workflowStatusCounts.gap} Gap</span>
            </div>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--stone)', background: 'var(--cream-light)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Core Activities
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span style={{ color: '#2f855a' }}>{activityStatusCounts.active} Active</span>
              <span style={{ color: '#b7791f' }}>{activityStatusCounts.draft} Draft</span>
              <span style={{ color: '#718096' }}>{activityStatusCounts.gap} Gap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl p-5 transition-all hover:shadow-md"
            style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div 
                className="p-2 rounded-lg"
                style={{ background: `${stat.color}20` }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {stat.label}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {stat.subLabel}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Gap Summary */}
        <div 
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Gap Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {unassignedActivities === 0 ? (
                  <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
                ) : (
                  <XCircle className="h-5 w-5" style={{ color: '#c4785a' }} />
                )}
                <span style={{ color: 'var(--text-secondary)' }}>Activities without owner/role</span>
              </div>
              <span 
                className="font-semibold"
                style={{ color: unassignedActivities === 0 ? 'var(--gk-green)' : '#c4785a' }}
              >
                {unassignedActivities}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {subFunctions.length === 0 ? (
                  <XCircle className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                ) : (
                  <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
                )}
                <span style={{ color: 'var(--text-secondary)' }}>Sub-functions defined</span>
              </div>
              <span 
                className="font-semibold"
                style={{ color: subFunctions.length > 0 ? 'var(--gk-green)' : 'var(--text-muted)' }}
              >
                {subFunctions.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {steps.length === 0 ? (
                  <XCircle className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                ) : (
                  <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
                )}
                <span style={{ color: 'var(--text-secondary)' }}>Workflow steps defined</span>
              </div>
              <span 
                className="font-semibold"
                style={{ color: steps.length > 0 ? 'var(--gk-green)' : 'var(--text-muted)' }}
              >
                {steps.length}
              </span>
            </div>
          </div>
          <Link 
            href="/gaps"
            className="flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-lg font-medium text-white"
            style={{ background: 'var(--gk-green)' }}
          >
            View Gap Analysis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Recent Activity */}
        <div 
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Quick Start
          </h3>
          <div className="space-y-3">
            <Link
              href="/function-chart"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ background: 'var(--cream)' }}
            >
              <div 
                className="p-2 rounded-lg"
                style={{ background: 'var(--mint)' }}
              >
                <LayoutGrid className="h-4 w-4" style={{ color: 'var(--gk-green)' }} />
              </div>
              <div className="flex-1">
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Build Function Chart
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Define your organizational structure
                </div>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </Link>
            <Link
              href="/workflows"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ background: 'var(--cream)' }}
            >
              <div 
                className="p-2 rounded-lg"
                style={{ background: 'var(--sand)' }}
              >
                <GitBranch className="h-4 w-4" style={{ color: '#b8956e' }} />
              </div>
              <div className="flex-1">
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Map Workflows
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Document your key processes
                </div>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </Link>
            <Link
              href="/activities"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ background: 'var(--cream)' }}
            >
              <div 
                className="p-2 rounded-lg"
                style={{ background: 'var(--dusty-blue)' }}
              >
                <Activity className="h-4 w-4" style={{ color: '#3d4f5f' }} />
              </div>
              <div className="flex-1">
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Define Core Activities
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  List activities and assign owners
                </div>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Welcome Modal is rendered in AppShell */}
    </div>
  )
}
