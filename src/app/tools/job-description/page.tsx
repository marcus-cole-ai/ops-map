'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import { FileText, Download, Copy, Check, ChevronDown } from 'lucide-react'

export default function JobDescriptionPage() {
  const roles = useOpsMapStore((state) => state.roles)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const subFunctionActivities = useOpsMapStore((state) => state.subFunctionActivities)
  const company = useOpsMapStore((state) => state.company)

  const [selectedRole, setSelectedRole] = useState<string>('')
  const [copied, setCopied] = useState(false)

  // Get activities assigned to the selected role
  const getActivitiesForRole = (roleId: string) => {
    return coreActivities.filter(a => a.roleId === roleId)
  }

  // Get function context for an activity
  const getActivityContext = (activityId: string) => {
    const link = subFunctionActivities.find(sfa => sfa.coreActivityId === activityId)
    if (!link) return null
    const subFunc = subFunctions.find(sf => sf.id === link.subFunctionId)
    const func = subFunc ? functions.find(f => f.id === subFunc.functionId) : null
    return { function: func, subFunction: subFunc }
  }

  // Group activities by function
  const groupActivitiesByFunction = (activities: typeof coreActivities) => {
    const groups: Record<string, { function: typeof functions[0], activities: typeof coreActivities }> = {}
    
    activities.forEach(activity => {
      const context = getActivityContext(activity.id)
      if (context?.function) {
        const funcId = context.function.id
        if (!groups[funcId]) {
          groups[funcId] = { function: context.function, activities: [] }
        }
        groups[funcId].activities.push(activity)
      }
    })
    
    return Object.values(groups)
  }

  const selectedRoleData = roles.find(r => r.id === selectedRole)
  const roleActivities = selectedRole ? getActivitiesForRole(selectedRole) : []
  const groupedActivities = groupActivitiesByFunction(roleActivities)

  // Generate job description text
  const generateJobDescription = () => {
    if (!selectedRoleData) return ''

    let jd = `JOB DESCRIPTION: ${selectedRoleData.name.toUpperCase()}\n`
    jd += `${'='.repeat(50)}\n\n`
    jd += `Company: ${company?.name || 'Company Name'}\n`
    jd += `Position: ${selectedRoleData.name}\n`
    jd += `Reports To: [To be determined]\n\n`

    if (selectedRoleData.description) {
      jd += `POSITION SUMMARY\n`
      jd += `${'-'.repeat(30)}\n`
      jd += `${selectedRoleData.description}\n\n`
    }

    if (groupedActivities.length > 0) {
      jd += `KEY RESPONSIBILITIES\n`
      jd += `${'-'.repeat(30)}\n\n`

      groupedActivities.forEach(group => {
        jd += `${group.function.name}:\n`
        group.activities.forEach(activity => {
          jd += `  • ${activity.name}\n`
        })
        jd += `\n`
      })
    }

    jd += `QUALIFICATIONS\n`
    jd += `${'-'.repeat(30)}\n`
    jd += `  • [Add required qualifications]\n`
    jd += `  • [Add preferred qualifications]\n\n`

    jd += `COMPENSATION & BENEFITS\n`
    jd += `${'-'.repeat(30)}\n`
    jd += `  • Competitive salary based on experience\n`
    jd += `  • [Add benefits]\n\n`

    jd += `---\n`
    jd += `Generated from OpsMap - ${new Date().toLocaleDateString()}\n`

    return jd
  }

  const jobDescription = generateJobDescription()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jobDescription)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jobDescription], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `job-description-${selectedRoleData?.name.toLowerCase().replace(/\s+/g, '-') || 'role'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Header
        title="Job Description Generator"
        description="Generate job descriptions from your function chart"
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {roles.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No roles defined</h3>
              <p className="mt-2 text-sm text-slate-500">
                Add roles and assign them to activities to generate job descriptions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Role Selection */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Select a Role</h3>
                
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Choose a role...</option>
                    {roles.map(role => {
                      const activityCount = getActivitiesForRole(role.id).length
                      return (
                        <option key={role.id} value={role.id}>
                          {role.name} ({activityCount} activities)
                        </option>
                      )
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>

                {selectedRoleData && (
                  <div className="mt-6">
                    <h4 className="font-medium text-slate-700 mb-2">Role Summary</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      {selectedRoleData.description || 'No description provided.'}
                    </p>

                    <h4 className="font-medium text-slate-700 mb-2">
                      Assigned Activities ({roleActivities.length})
                    </h4>
                    
                    {groupedActivities.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">
                        No activities assigned to this role yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {groupedActivities.map(group => (
                          <div key={group.function.id}>
                            <div 
                              className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1"
                              style={{ color: group.function.color }}
                            >
                              {group.function.name}
                            </div>
                            <ul className="space-y-1">
                              {group.activities.map(activity => (
                                <li key={activity.id} className="text-sm text-slate-600 flex items-start gap-2">
                                  <span className="text-slate-400">•</span>
                                  {activity.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Generated Output */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Generated Job Description</h3>
                  {selectedRole && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  )}
                </div>

                {!selectedRole ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                    Select a role to generate a job description
                  </div>
                ) : (
                  <pre className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap font-mono h-[500px] overflow-y-auto">
                    {jobDescription}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
