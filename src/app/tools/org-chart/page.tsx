'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import { Users, Download, Printer } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function OrgChartPage() {
  const company = useOpsMapStore((state) => state.company)
  const people = useOpsMapStore((state) => state.people)
  const roles = useOpsMapStore((state) => state.roles)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const subFunctionActivities = useOpsMapStore((state) => state.subFunctionActivities)

  const [exporting, setExporting] = useState(false)

  // Group people by role
  const peopleByRole: Record<string, typeof people> = {}
  const unassigned: typeof people = []

  people.forEach(person => {
    if (person.roleId) {
      if (!peopleByRole[person.roleId]) {
        peopleByRole[person.roleId] = []
      }
      peopleByRole[person.roleId].push(person)
    } else {
      unassigned.push(person)
    }
  })

  // Get activities for a role
  const getActivitiesForRole = (roleId: string) => {
    return coreActivities.filter(a => a.roleId === roleId)
  }

  // Get function breakdown for activities
  const getFunctionBreakdown = (activities: typeof coreActivities) => {
    const breakdown: Record<string, number> = {}
    
    activities.forEach(activity => {
      const link = subFunctionActivities.find(sfa => sfa.coreActivityId === activity.id)
      if (link) {
        const subFunc = subFunctions.find(sf => sf.id === link.subFunctionId)
        if (subFunc) {
          const func = functions.find(f => f.id === subFunc.functionId)
          if (func) {
            breakdown[func.name] = (breakdown[func.name] || 0) + 1
          }
        }
      }
    })
    
    return breakdown
  }

  const handleExport = async () => {
    const element = document.getElementById('org-chart-content')
    if (!element) return

    setExporting(true)
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('org-chart.pdf')
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      <Header
        title="Organization Chart"
        description="View your team structure and responsibilities"
        extraActions={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        }
      />

      <div className="p-6">
        {people.length === 0 ? (
          <div className="max-w-md mx-auto rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No team members</h3>
            <p className="mt-2 text-sm text-slate-500">
              Add people and roles to see your organization chart.
            </p>
          </div>
        ) : (
          <div id="org-chart-content" className="max-w-5xl mx-auto bg-white p-8 rounded-xl">
            {/* Company Name */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900">{company?.name || 'Company'}</h1>
              <p className="text-slate-500 text-sm mt-1">Organization Chart</p>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map(role => {
                const rolePeople = peopleByRole[role.id] || []
                const roleActivities = getActivitiesForRole(role.id)
                const functionBreakdown = getFunctionBreakdown(roleActivities)

                return (
                  <div
                    key={role.id}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    {/* Role Header */}
                    <div className="bg-slate-800 text-white px-4 py-3">
                      <h3 className="font-semibold">{role.name}</h3>
                      {role.description && (
                        <p className="text-slate-300 text-xs mt-0.5">{role.description}</p>
                      )}
                    </div>

                    {/* People in Role */}
                    <div className="p-4">
                      {rolePeople.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No one assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {rolePeople.map(person => (
                            <div key={person.id} className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                                {person.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{person.name}</p>
                                {person.email && (
                                  <p className="text-xs text-slate-500">{person.email}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Activity Summary */}
                      {roleActivities.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            Responsibilities ({roleActivities.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(functionBreakdown).map(([funcName, count]) => (
                              <span
                                key={funcName}
                                className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                              >
                                {funcName}: {count}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Unassigned People */}
            {unassigned.length > 0 && (
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-medium text-amber-800 mb-2">Unassigned Team Members</h4>
                <div className="flex flex-wrap gap-2">
                  {unassigned.map(person => (
                    <span key={person.id} className="px-3 py-1 bg-white border border-amber-200 rounded-lg text-sm">
                      {person.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-center gap-8 text-sm text-slate-500">
              <span>{people.length} team members</span>
              <span>{roles.length} roles</span>
              <span>{coreActivities.filter(a => a.roleId).length} assigned activities</span>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  )
}
