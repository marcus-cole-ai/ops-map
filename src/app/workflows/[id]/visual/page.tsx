'use client'

import { useMemo, use } from 'react'
import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Link from 'next/link'
import { List, ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

// Custom node for phases
function PhaseNode({ data }: { data: { label: string; stepCount: number; index: number } }) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
  const color = colors[data.index % colors.length]
  
  return (
    <div
      className="px-6 py-4 rounded-xl shadow-lg min-w-[180px] text-center"
      style={{ backgroundColor: color }}
    >
      <div className="font-bold text-white text-lg">{data.label}</div>
      <div className="text-sm text-white/80 mt-1">{data.stepCount} steps</div>
    </div>
  )
}

// Custom node for steps
function StepNode({ data }: { data: { label: string; activityCount: number; phaseColor: string } }) {
  return (
    <div
      className="px-4 py-3 rounded-lg shadow-md bg-white border-2 min-w-[160px]"
      style={{ borderColor: data.phaseColor }}
    >
      <div className="font-medium text-slate-800 text-sm">{data.label}</div>
      {data.activityCount > 0 && (
        <div className="text-xs text-slate-500 mt-1">{data.activityCount} activities</div>
      )}
    </div>
  )
}

const nodeTypes = {
  phase: PhaseNode,
  step: StepNode,
}

export default function VisualWorkflowPage({ params }: PageProps) {
  const { id } = use(params)
  
  const workflows = useOpsMapStore((state) => state.workflows)
  const phases = useOpsMapStore((state) => state.phases)
  const steps = useOpsMapStore((state) => state.steps)
  const getActivitiesForStep = useOpsMapStore((state) => state.getActivitiesForStep)

  const workflow = workflows.find(w => w.id === id)
  const workflowPhases = phases.filter(p => p.workflowId === id).sort((a, b) => a.orderIndex - b.orderIndex)

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']

  // Build nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!workflow) return { initialNodes: [], initialEdges: [] }

    const nodes: Node[] = []
    const edges: Edge[] = []

    const phaseSpacing = 300
    const stepSpacing = 80

    workflowPhases.forEach((phase, phaseIndex) => {
      const phaseSteps = steps.filter(s => s.phaseId === phase.id).sort((a, b) => a.orderIndex - b.orderIndex)
      const phaseX = phaseIndex * phaseSpacing
      const phaseColor = colors[phaseIndex % colors.length]

      // Phase node
      nodes.push({
        id: phase.id,
        type: 'phase',
        data: { label: phase.name, stepCount: phaseSteps.length, index: phaseIndex },
        position: { x: phaseX, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })

      // Edge to next phase
      if (phaseIndex < workflowPhases.length - 1) {
        edges.push({
          id: `phase-${phase.id}-${workflowPhases[phaseIndex + 1].id}`,
          source: phase.id,
          target: workflowPhases[phaseIndex + 1].id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        })
      }

      // Steps below phase
      phaseSteps.forEach((step, stepIndex) => {
        const stepX = phaseX
        const stepY = 120 + stepIndex * stepSpacing
        const activities = getActivitiesForStep(step.id)

        nodes.push({
          id: step.id,
          type: 'step',
          data: { label: step.name, activityCount: activities.length, phaseColor },
          position: { x: stepX, y: stepY },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        })

        // Edge from phase to first step, or step to step
        if (stepIndex === 0) {
          edges.push({
            id: `${phase.id}-${step.id}`,
            source: phase.id,
            target: step.id,
            type: 'smoothstep',
            style: { stroke: phaseColor, strokeWidth: 2 },
          })
        } else {
          edges.push({
            id: `${phaseSteps[stepIndex - 1].id}-${step.id}`,
            source: phaseSteps[stepIndex - 1].id,
            target: step.id,
            type: 'smoothstep',
            style: { stroke: phaseColor, strokeWidth: 2 },
          })
        }
      })
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [workflow, workflowPhases, steps, getActivitiesForStep])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  if (!workflow) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Workflow not found</h2>
        <Link href="/workflows" className="mt-2 text-sm text-blue-600 hover:underline">
          Back to workflows
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <Header
        title={`${workflow.name} - Visual View`}
        description={workflow.description || 'Workflow visualization'}
        extraActions={
          <Link
            href={`/workflows/${id}`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <List className="h-4 w-4" />
            Board View
          </Link>
        }
      />
      
      <div className="px-6 py-2">
        <Link
          href="/workflows"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workflows
        </Link>
      </div>

      <div className="flex-1">
        {workflowPhases.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <p className="text-slate-500 mb-4">No phases to visualize yet.</p>
              <Link
                href={`/workflows/${id}`}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              >
                Add Phases
              </Link>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.1}
            maxZoom={2}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'phase') {
                  const index = (node.data as { index: number }).index
                  return colors[index % colors.length]
                }
                return '#e2e8f0'
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          </ReactFlow>
        )}
      </div>
    </div>
  )
}
