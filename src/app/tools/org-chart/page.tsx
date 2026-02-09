'use client'

import { useState } from 'react'
import { useOpsMapStore } from '@/store'
import { Users, Download, ChevronDown, ChevronRight, User, Briefcase, AlertCircle } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { Person, PersonWithReports } from '@/types'

export default function OrgChartPage() {
  const company = useOpsMapStore((state) => state.company)
  const people = useOpsMapStore((state) => state.people)
  const roles = useOpsMapStore((state) => state.roles)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const updatePerson = useOpsMapStore((state) => state.updatePerson)

  const [exporting, setExporting] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [editingReportsTo, setEditingReportsTo] = useState<string | null>(null)

  // Build hierarchy tree
  const buildHierarchy = (): PersonWithReports[] => {
    const personMap = new Map<string, PersonWithReports>()
    
    // Initialize all people with empty directReports
    people.forEach(person => {
      personMap.set(person.id, { ...person, directReports: [] })
    })
    
    // Build parent-child relationships
    people.forEach(person => {
      if (person.reportsTo) {
        const manager = personMap.get(person.reportsTo)
        const employee = personMap.get(person.id)
        if (manager && employee) {
          manager.directReports.push(employee)
        }
      }
    })
    
    // Return only top-level people (no reportsTo or reportsTo not found)
    return Array.from(personMap.values()).filter(
      p => !p.reportsTo || !personMap.has(p.reportsTo)
    )
  }

  const hierarchy = buildHierarchy()

  // Get role name
  const getRoleName = (roleId?: string) => {
    if (!roleId) return null
    return roles.find(r => r.id === roleId)?.name || null
  }

  // Get activity count for a person
  const getActivityCount = (personId: string) => {
    return coreActivities.filter(a => a.ownerId === personId).length
  }

  // Count all descendants
  const countDescendants = (person: PersonWithReports): number => {
    let count = person.directReports.length
    person.directReports.forEach(report => {
      count += countDescendants(report)
    })
    return count
  }

  // Toggle expansion
  const toggleExpand = (personId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(personId)) {
      newExpanded.delete(personId)
    } else {
      newExpanded.add(personId)
    }
    setExpandedNodes(newExpanded)
  }

  // Expand all
  const expandAll = () => {
    const allIds = new Set<string>()
    const addAll = (nodes: PersonWithReports[]) => {
      nodes.forEach(node => {
        if (node.directReports.length > 0) {
          allIds.add(node.id)
          addAll(node.directReports)
        }
      })
    }
    addAll(hierarchy)
    setExpandedNodes(allIds)
  }

  // Collapse all
  const collapseAll = () => {
    setExpandedNodes(new Set())
  }

  // Handle setting reportsTo
  const handleSetReportsTo = (personId: string, managerId: string | null) => {
    updatePerson(personId, { reportsTo: managerId || undefined })
    setEditingReportsTo(null)
  }

  // Render a person node
  const renderPersonNode = (person: PersonWithReports, depth: number = 0) => {
    const roleName = getRoleName(person.roleId)
    const activityCount = getActivityCount(person.id)
    const hasReports = person.directReports.length > 0
    const isExpanded = expandedNodes.has(person.id)
    const descendantCount = countDescendants(person)

    return (
      <div key={person.id} style={{ marginLeft: depth > 0 ? '2rem' : 0 }}>
        <div 
          className="flex items-center gap-3 p-4 rounded-lg mb-2 transition-all"
          style={{ 
            background: depth === 0 ? 'var(--gk-charcoal)' : 'var(--white)',
            border: depth === 0 ? 'none' : '1px solid var(--stone)'
          }}
        >
          {/* Expand/collapse button */}
          <div className="w-6 flex justify-center">
            {hasReports ? (
              <button
                onClick={() => toggleExpand(person.id)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" style={{ color: depth === 0 ? 'white' : 'var(--text-muted)' }} />
                ) : (
                  <ChevronRight className="h-4 w-4" style={{ color: depth === 0 ? 'white' : 'var(--text-muted)' }} />
                )}
              </button>
            ) : null}
          </div>

          {/* Avatar */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
            style={{ 
              background: depth === 0 ? 'var(--gk-green)' : 'var(--mint)',
              color: depth === 0 ? 'white' : 'var(--gk-green-dark)'
            }}
          >
            {person.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div 
              className="font-semibold"
              style={{ color: depth === 0 ? 'white' : 'var(--text-primary)' }}
            >
              {person.name}
              {person.title && (
                <span 
                  className="font-normal ml-2"
                  style={{ color: depth === 0 ? 'var(--stone)' : 'var(--text-muted)' }}
                >
                  — {person.title}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              {roleName && (
                <span 
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ 
                    background: depth === 0 ? 'rgba(123, 157, 118, 0.3)' : 'var(--dusty-blue)',
                    color: depth === 0 ? 'var(--gk-green-light)' : '#3d4f5f'
                  }}
                >
                  {roleName}
                </span>
              )}
              {activityCount > 0 && (
                <span 
                  className="text-xs"
                  style={{ color: depth === 0 ? 'var(--stone)' : 'var(--text-muted)' }}
                >
                  {activityCount} activities
                </span>
              )}
              {hasReports && (
                <span 
                  className="text-xs"
                  style={{ color: depth === 0 ? 'var(--stone)' : 'var(--text-muted)' }}
                >
                  {descendantCount} report{descendantCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Edit reports to */}
          {editingReportsTo === person.id ? (
            <select
              value={person.reportsTo || ''}
              onChange={(e) => handleSetReportsTo(person.id, e.target.value || null)}
              onBlur={() => setEditingReportsTo(null)}
              autoFocus
              className="px-2 py-1 rounded text-sm"
              style={{ 
                background: 'var(--cream)',
                border: '1px solid var(--stone)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">No manager</option>
              {people.filter(p => p.id !== person.id).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setEditingReportsTo(person.id)}
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{ 
                background: depth === 0 ? 'rgba(255,255,255,0.1)' : 'var(--cream)',
                color: depth === 0 ? 'var(--stone)' : 'var(--text-muted)'
              }}
            >
              {person.reportsTo ? 'Change' : 'Set'} manager
            </button>
          )}
        </div>

        {/* Children */}
        {hasReports && isExpanded && (
          <div className="relative">
            {/* Vertical line */}
            <div 
              className="absolute left-4 top-0 bottom-4 w-0.5"
              style={{ background: 'var(--stone)' }}
            />
            {person.directReports.map(report => renderPersonNode(report, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const handleExport = async () => {
    const element = document.getElementById('org-chart-content')
    if (!element) return

    setExporting(true)
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#f0ebe0',
        scale: 2,
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${company?.name || 'org-chart'}-org-chart.pdf`)
    } finally {
      setExporting(false)
    }
  }

  // People without a place in hierarchy
  const unassignedPeople = people.filter(p => !p.reportsTo && 
    !hierarchy.find(h => h.id === p.id || 
      h.directReports.some(r => r.id === p.id)
    )
  )

  return (
    <div className="min-h-full" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="px-8 py-6" style={{ background: 'var(--gk-charcoal)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Organization Chart</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--gk-green-light)' }}>
              View your team structure and reporting relationships
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
            >
              Collapse All
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div id="org-chart-content" className="p-8">
        {people.length === 0 ? (
          <div className="text-center py-20">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--cream-light)' }}
            >
              <Users className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Team Members Yet
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Add people from the People page to build your org chart
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Main Hierarchy */}
            {hierarchy.length > 0 && (
              <div className="mb-8">
                {hierarchy.map(person => renderPersonNode(person, 0))}
              </div>
            )}

            {/* Unassigned people */}
            {unassignedPeople.length > 0 && (
              <div 
                className="p-4 rounded-xl"
                style={{ background: 'var(--sand)', border: '1px solid #d4a854' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5" style={{ color: '#b8923a' }} />
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Not Yet Placed ({unassignedPeople.length})
                  </h3>
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  These team members haven't been assigned a manager yet. Click "Set manager" to place them in the hierarchy.
                </p>
                <div className="space-y-2">
                  {unassignedPeople.map(person => (
                    <div
                      key={person.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: 'var(--white)' }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <span style={{ color: 'var(--text-primary)' }}>{person.name}</span>
                        {getRoleName(person.roleId) && (
                          <span 
                            className="text-xs ml-2 px-2 py-0.5 rounded"
                            style={{ background: 'var(--dusty-blue)', color: '#3d4f5f' }}
                          >
                            {getRoleName(person.roleId)}
                          </span>
                        )}
                      </div>
                      {editingReportsTo === person.id ? (
                        <select
                          value={person.reportsTo || ''}
                          onChange={(e) => handleSetReportsTo(person.id, e.target.value || null)}
                          onBlur={() => setEditingReportsTo(null)}
                          autoFocus
                          className="px-2 py-1 rounded text-sm"
                          style={{ 
                            background: 'var(--cream)',
                            border: '1px solid var(--stone)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <option value="">Select manager...</option>
                          {people.filter(p => p.id !== person.id).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingReportsTo(person.id)}
                          className="text-xs px-3 py-1.5 rounded font-medium"
                          style={{ background: 'var(--gk-green)', color: 'white' }}
                        >
                          Set manager
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Footer */}
            <div 
              className="mt-8 pt-6 flex items-center justify-center gap-8 text-sm"
              style={{ borderTop: '1px solid var(--stone)', color: 'var(--text-muted)' }}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {people.length} team member{people.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {roles.length} role{roles.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
