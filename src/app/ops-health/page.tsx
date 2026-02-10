'use client'

import { useOpsMapStore } from '@/store'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, ArrowRight, Activity, LayoutGrid, GitBranch, HeartPulse } from 'lucide-react'

export default function OpsHealthPage() {
  const {
    functions,
    subFunctions,
    coreActivities,
    workflows,
    phases,
    steps,
    subFunctionActivities,
    stepActivities,
  } = useOpsMapStore()

  // Activities without owner or role
  const unassignedActivities = coreActivities.filter(
    (a) => !a.ownerId && !a.roleId
  )

  // Sub-functions without activities
  const subFunctionsWithoutActivities = subFunctions.filter((sf) => {
    const links = subFunctionActivities.filter((sfa) => sfa.subFunctionId === sf.id)
    return links.length === 0
  })

  // Steps without activities
  const stepsWithoutActivities = steps.filter((s) => {
    const links = stepActivities.filter((sa) => sa.stepId === s.id)
    return links.length === 0
  })

  // Functions without sub-functions
  const functionsWithoutSubFunctions = functions.filter((f) => {
    return !subFunctions.some((sf) => sf.functionId === f.id)
  })

  // Workflows without phases
  const workflowsWithoutPhases = workflows.filter((w) => {
    return !phases.some((p) => p.workflowId === w.id)
  })

  // Phases without steps
  const phasesWithoutSteps = phases.filter((p) => {
    return !steps.some((s) => s.phaseId === p.id)
  })

  // Calculate completion score
  const totalItems = coreActivities.length + subFunctions.length + steps.length + functions.length + workflows.length + phases.length
  const issues = unassignedActivities.length + subFunctionsWithoutActivities.length + stepsWithoutActivities.length + 
    functionsWithoutSubFunctions.length + workflowsWithoutPhases.length + phasesWithoutSteps.length
  const completionScore = totalItems > 0 ? Math.round(((totalItems - issues) / totalItems) * 100) : 100

  const getParentName = (subFunctionId: string) => {
    const sf = subFunctions.find(s => s.id === subFunctionId)
    if (!sf) return ''
    const func = functions.find(f => f.id === sf.functionId)
    return func?.name || ''
  }

  return (
    <div className="min-h-full p-8" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: 'var(--mint)' }}>
            <HeartPulse className="h-6 w-6" style={{ color: 'var(--gk-green)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Ops Health
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          Check how well you're filling in your OpsMap — completeness metrics and coverage stats
        </p>
      </div>

      {/* Score Card */}
      <div 
        className="rounded-xl p-6 mb-8"
        style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              OpsMap Completeness
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {issues === 0 ? 'All items are properly configured!' : `${issues} items need attention`}
            </p>
          </div>
          <div 
            className="text-4xl font-bold"
            style={{ 
              color: completionScore >= 80 ? 'var(--gk-green)' : completionScore >= 50 ? '#b8956e' : '#c4785a'
            }}
          >
            {completionScore}%
          </div>
        </div>
        <div 
          className="h-4 rounded-full overflow-hidden"
          style={{ background: 'var(--cream)' }}
        >
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${completionScore}%`,
              background: completionScore >= 80 ? 'var(--gk-green)' : completionScore >= 50 ? '#b8956e' : '#c4785a'
            }}
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg p-4" style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{workflows.length}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Workflows</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{functions.length}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Functions</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{coreActivities.length}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Activities</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{steps.length}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Steps</div>
        </div>
      </div>

      {/* Gap Sections */}
      <div className="space-y-6">
        {/* Unassigned Activities */}
        <div 
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div 
            className="px-6 py-4 flex items-center justify-between"
            style={{ background: unassignedActivities.length > 0 ? '#c4785a' : 'var(--gk-green)' }}
          >
            <div className="flex items-center gap-3">
              {unassignedActivities.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-white" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-white" />
              )}
              <h3 className="font-semibold text-white">
                Activities Without Owner/Role
              </h3>
            </div>
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              {unassignedActivities.length}
            </span>
          </div>
          
          {unassignedActivities.length > 0 && (
            <div className="p-6">
              <div className="space-y-2">
                {unassignedActivities.slice(0, 10).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'var(--cream-light)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-primary)' }}>{activity.name}</span>
                    </div>
                    <Link
                      href={`/activities?id=${activity.id}`}
                      className="text-sm font-medium flex items-center gap-1"
                      style={{ color: 'var(--gk-green)' }}
                    >
                      Assign
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
                {unassignedActivities.length > 10 && (
                  <p className="text-sm text-center pt-2" style={{ color: 'var(--text-muted)' }}>
                    +{unassignedActivities.length - 10} more
                  </p>
                )}
              </div>
              <Link
                href="/activities"
                className="flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
              >
                View All Core Activities
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Sub-Functions Without Activities */}
        <div 
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div 
            className="px-6 py-4 flex items-center justify-between"
            style={{ background: subFunctionsWithoutActivities.length > 0 ? '#b8956e' : 'var(--gk-green)' }}
          >
            <div className="flex items-center gap-3">
              {subFunctionsWithoutActivities.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-white" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-white" />
              )}
              <h3 className="font-semibold text-white">
                Sub-Functions Without Activities
              </h3>
            </div>
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              {subFunctionsWithoutActivities.length}
            </span>
          </div>
          
          {subFunctionsWithoutActivities.length > 0 && (
            <div className="p-6">
              <div className="space-y-2">
                {subFunctionsWithoutActivities.slice(0, 10).map((sf) => (
                  <div
                    key={sf.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'var(--cream-light)' }}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                      <div>
                        <span style={{ color: 'var(--text-primary)' }}>{sf.name}</span>
                        <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                          in {getParentName(sf.id)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/function-chart"
                className="flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
              >
                View Function Chart
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Steps Without Activities */}
        <div 
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div 
            className="px-6 py-4 flex items-center justify-between"
            style={{ background: stepsWithoutActivities.length > 0 ? '#b8956e' : 'var(--gk-green)' }}
          >
            <div className="flex items-center gap-3">
              {stepsWithoutActivities.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-white" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-white" />
              )}
              <h3 className="font-semibold text-white">
                Workflow Steps Without Activities
              </h3>
            </div>
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              {stepsWithoutActivities.length}
            </span>
          </div>
          
          {stepsWithoutActivities.length > 0 && (
            <div className="p-6">
              <div className="space-y-2">
                {stepsWithoutActivities.slice(0, 10).map((step) => {
                  const phase = phases.find(p => p.id === step.phaseId)
                  const workflow = phase ? workflows.find(w => w.id === phase.workflowId) : null
                  return (
                    <div
                      key={step.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ background: 'var(--cream-light)' }}
                    >
                      <div className="flex items-center gap-3">
                        <GitBranch className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                        <div>
                          <span style={{ color: 'var(--text-primary)' }}>{step.name}</span>
                          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                            {workflow?.name} → {phase?.name}
                          </span>
                        </div>
                      </div>
                      {workflow && (
                        <Link
                          href={`/workflows/${workflow.id}`}
                          className="text-sm font-medium flex items-center gap-1"
                          style={{ color: 'var(--gk-green)' }}
                        >
                          View
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
              <Link
                href="/workflows"
                className="flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
              >
                View Workflows
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Empty Structures */}
        {(functionsWithoutSubFunctions.length > 0 || workflowsWithoutPhases.length > 0 || phasesWithoutSteps.length > 0) && (
          <div 
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
          >
            <div 
              className="px-6 py-4 flex items-center gap-3"
              style={{ background: 'var(--dusty-blue)' }}
            >
              <AlertCircle className="h-5 w-5" style={{ color: '#3d4f5f' }} />
              <h3 className="font-semibold" style={{ color: '#3d4f5f' }}>
                Empty Structures
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {functionsWithoutSubFunctions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Functions without sub-functions ({functionsWithoutSubFunctions.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {functionsWithoutSubFunctions.map((f) => (
                      <span 
                        key={f.id}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ background: 'var(--cream)', color: 'var(--text-secondary)' }}
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {workflowsWithoutPhases.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Workflows without phases ({workflowsWithoutPhases.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {workflowsWithoutPhases.map((w) => (
                      <span 
                        key={w.id}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ background: 'var(--cream)', color: 'var(--text-secondary)' }}
                      >
                        {w.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {phasesWithoutSteps.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Phases without steps ({phasesWithoutSteps.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {phasesWithoutSteps.map((p) => {
                      const workflow = workflows.find(w => w.id === p.workflowId)
                      return (
                        <span 
                          key={p.id}
                          className="px-3 py-1 rounded-full text-sm"
                          style={{ background: 'var(--cream)', color: 'var(--text-secondary)' }}
                        >
                          {workflow?.name} → {p.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Clear */}
        {issues === 0 && (
          <div 
            className="rounded-xl p-8 text-center"
            style={{ background: 'var(--mint)', border: '1px solid var(--gk-green)' }}
          >
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gk-green)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--gk-green-dark)' }}>
              All Clear!
            </h3>
            <p style={{ color: 'var(--gk-green-dark)' }}>
              Your OpsMap is fully configured. Great work!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
