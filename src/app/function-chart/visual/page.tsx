'use client'

import { useCallback, useMemo } from 'react'
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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Link from 'next/link'
import { List } from 'lucide-react'

// Custom node for functions
function FunctionNode({ data }: { data: { label: string; color: string; subCount: number } }) {
  return (
    <div
      className="px-4 py-3 rounded-lg shadow-lg border-2 min-w-[150px] text-center"
      style={{ backgroundColor: data.color, borderColor: data.color }}
    >
      <div className="font-semibold text-white">{data.label}</div>
      <div className="text-xs text-white/80 mt-1">{data.subCount} sub-functions</div>
    </div>
  )
}

// Custom node for sub-functions
function SubFunctionNode({ data }: { data: { label: string; activityCount: number; parentColor: string } }) {
  return (
    <div
      className="px-3 py-2 rounded-lg shadow-md bg-white border-2 min-w-[140px] text-center"
      style={{ borderColor: data.parentColor }}
    >
      <div className="font-medium text-slate-800 text-sm">{data.label}</div>
      <div className="text-xs text-slate-500 mt-1">{data.activityCount} activities</div>
    </div>
  )
}

// Custom node for activities
function ActivityNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-2 py-1 rounded bg-slate-100 border border-slate-300 text-xs text-slate-600 max-w-[120px] truncate">
      {data.label}
    </div>
  )
}

const nodeTypes = {
  function: FunctionNode,
  subFunction: SubFunctionNode,
  activity: ActivityNode,
}

export default function VisualFunctionChartPage() {
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const getActivitiesForSubFunction = useOpsMapStore((state) => state.getActivitiesForSubFunction)

  // Build nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    const sortedFunctions = [...functions].sort((a, b) => a.orderIndex - b.orderIndex)

    // Company node at top
    nodes.push({
      id: 'company',
      type: 'input',
      data: { label: 'Company' },
      position: { x: 400, y: 0 },
      style: {
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: 'bold',
      },
    })

    // Position functions in a row
    const functionSpacing = 200
    const startX = -(sortedFunctions.length * functionSpacing) / 2 + 400

    sortedFunctions.forEach((func, funcIndex) => {
      const funcX = startX + funcIndex * functionSpacing
      const funcY = 120

      // Function node
      const funcSubs = subFunctions.filter(sf => sf.functionId === func.id)
      nodes.push({
        id: func.id,
        type: 'function',
        data: { label: func.name, color: func.color, subCount: funcSubs.length },
        position: { x: funcX, y: funcY },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      })

      // Edge from company to function
      edges.push({
        id: `company-${func.id}`,
        source: 'company',
        target: func.id,
        style: { stroke: func.color },
      })

      // Sub-functions below each function
      const subSpacing = 160
      const subStartX = funcX - ((funcSubs.length - 1) * subSpacing) / 2

      funcSubs.sort((a, b) => a.orderIndex - b.orderIndex).forEach((sub, subIndex) => {
        const subX = subStartX + subIndex * subSpacing
        const subY = funcY + 120

        const activities = getActivitiesForSubFunction(sub.id)

        nodes.push({
          id: sub.id,
          type: 'subFunction',
          data: { label: sub.name, activityCount: activities.length, parentColor: func.color },
          position: { x: subX, y: subY },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        })

        edges.push({
          id: `${func.id}-${sub.id}`,
          source: func.id,
          target: sub.id,
          style: { stroke: func.color, strokeWidth: 2 },
        })

        // Activities below sub-functions (limit to 3 for visibility)
        const displayActivities = activities.slice(0, 3)
        displayActivities.forEach((activity, actIndex) => {
          const actX = subX
          const actY = subY + 80 + actIndex * 35

          nodes.push({
            id: activity.id,
            type: 'activity',
            data: { label: activity.name },
            position: { x: actX, y: actY },
            targetPosition: Position.Top,
          })

          edges.push({
            id: `${sub.id}-${activity.id}`,
            source: sub.id,
            target: activity.id,
            style: { stroke: '#cbd5e1', strokeWidth: 1 },
          })
        })

        // Show "+N more" if there are more activities
        if (activities.length > 3) {
          nodes.push({
            id: `${sub.id}-more`,
            type: 'default',
            data: { label: `+${activities.length - 3} more` },
            position: { x: subX, y: subY + 80 + 3 * 35 },
            style: {
              backgroundColor: '#f1f5f9',
              border: 'none',
              fontSize: '10px',
              padding: '4px 8px',
              borderRadius: '4px',
              color: '#64748b',
            },
          })
        }
      })
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [functions, subFunctions, getActivitiesForSubFunction])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="h-screen flex flex-col">
      <Header
        title="Function Chart - Visual View"
        description="Org-chart style visualization of your business functions"
        extraActions={
          <Link
            href="/function-chart"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <List className="h-4 w-4" />
            List View
          </Link>
        }
      />
      
      <div className="flex-1">
        {functions.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <p className="text-slate-500 mb-4">No functions to visualize yet.</p>
              <Link
                href="/function-chart"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Add Functions
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
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={2}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'function') return (node.data as { color: string }).color
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
