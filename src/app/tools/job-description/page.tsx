'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight,
  Briefcase,
  CheckSquare,
  Square
} from 'lucide-react'

export default function JobDescriptionPage() {
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const coreActivities = useOpsMapStore((state) => state.coreActivities)
  const subFunctionActivities = useOpsMapStore((state) => state.subFunctionActivities)
  const company = useOpsMapStore((state) => state.company)

  const [selectedSubFunctions, setSelectedSubFunctions] = useState<Set<string>>(new Set())
  const [expandedFunctions, setExpandedFunctions] = useState<Set<string>>(new Set())
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [copied, setCopied] = useState(false)

  // Sort functions
  const sortedFunctions = useMemo(() => 
    [...functions].sort((a, b) => a.orderIndex - b.orderIndex),
    [functions]
  )

  // Get sub-functions for a function
  const getSubFunctionsForFunction = (functionId: string) => {
    return subFunctions
      .filter(sf => sf.functionId === functionId)
      .sort((a, b) => a.orderIndex - b.orderIndex)
  }

  // Get activities for a sub-function
  const getActivitiesForSubFunction = (subFunctionId: string) => {
    const links = subFunctionActivities.filter(sfa => sfa.subFunctionId === subFunctionId)
    return links
      .map(link => coreActivities.find(a => a.id === link.coreActivityId))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
      .sort((a, b) => {
        const aIndex = links.find(l => l.coreActivityId === a.id)?.orderIndex || 0
        const bIndex = links.find(l => l.coreActivityId === b.id)?.orderIndex || 0
        return aIndex - bIndex
      })
  }

  // Toggle function expansion
  const toggleFunction = (funcId: string) => {
    const newExpanded = new Set(expandedFunctions)
    if (newExpanded.has(funcId)) {
      newExpanded.delete(funcId)
    } else {
      newExpanded.add(funcId)
    }
    setExpandedFunctions(newExpanded)
  }

  // Toggle sub-function selection
  const toggleSubFunction = (subFuncId: string) => {
    const newSelected = new Set(selectedSubFunctions)
    if (newSelected.has(subFuncId)) {
      newSelected.delete(subFuncId)
    } else {
      newSelected.add(subFuncId)
    }
    setSelectedSubFunctions(newSelected)
  }

  // Select all sub-functions for a function
  const selectAllForFunction = (funcId: string) => {
    const funcSubFunctions = getSubFunctionsForFunction(funcId)
    const newSelected = new Set(selectedSubFunctions)
    const allSelected = funcSubFunctions.every(sf => newSelected.has(sf.id))
    
    if (allSelected) {
      // Deselect all
      funcSubFunctions.forEach(sf => newSelected.delete(sf.id))
    } else {
      // Select all
      funcSubFunctions.forEach(sf => newSelected.add(sf.id))
    }
    setSelectedSubFunctions(newSelected)
  }

  // Check if all sub-functions of a function are selected
  const isAllSelectedForFunction = (funcId: string) => {
    const funcSubFunctions = getSubFunctionsForFunction(funcId)
    return funcSubFunctions.length > 0 && funcSubFunctions.every(sf => selectedSubFunctions.has(sf.id))
  }

  // Check if some (but not all) sub-functions of a function are selected
  const isSomeSelectedForFunction = (funcId: string) => {
    const funcSubFunctions = getSubFunctionsForFunction(funcId)
    const selectedCount = funcSubFunctions.filter(sf => selectedSubFunctions.has(sf.id)).length
    return selectedCount > 0 && selectedCount < funcSubFunctions.length
  }

  // Get all selected activities grouped by function
  const getSelectedActivitiesGrouped = () => {
    const groups: { 
      function: typeof functions[0], 
      subFunctions: { 
        subFunction: typeof subFunctions[0], 
        activities: typeof coreActivities 
      }[] 
    }[] = []

    sortedFunctions.forEach(func => {
      const funcSubFunctions = getSubFunctionsForFunction(func.id)
        .filter(sf => selectedSubFunctions.has(sf.id))
      
      if (funcSubFunctions.length > 0) {
        const subFuncsWithActivities = funcSubFunctions.map(sf => ({
          subFunction: sf,
          activities: getActivitiesForSubFunction(sf.id)
        }))
        groups.push({ function: func, subFunctions: subFuncsWithActivities })
      }
    })

    return groups
  }

  const selectedGroups = getSelectedActivitiesGrouped()
  const totalActivities = selectedGroups.reduce((sum, g) => 
    sum + g.subFunctions.reduce((s, sf) => s + sf.activities.length, 0), 0)

  // Generate job description text
  const generateJobDescription = () => {
    if (selectedSubFunctions.size === 0) return ''

    const title = roleName || 'Role Title'
    let jd = `JOB DESCRIPTION: ${title.toUpperCase()}\n`
    jd += `${'='.repeat(60)}\n\n`
    jd += `Company: ${company?.name || '[Company Name]'}\n`
    jd += `Position: ${title}\n`
    jd += `Reports To: [To be determined]\n\n`

    if (roleDescription) {
      jd += `POSITION SUMMARY\n`
      jd += `${'-'.repeat(40)}\n`
      jd += `${roleDescription}\n\n`
    }

    jd += `KEY RESPONSIBILITIES\n`
    jd += `${'-'.repeat(40)}\n\n`

    selectedGroups.forEach(group => {
      jd += `${group.function.name.toUpperCase()}\n\n`
      
      group.subFunctions.forEach(({ subFunction, activities }) => {
        jd += `  ${subFunction.name}\n`
        if (activities.length > 0) {
          activities.forEach(activity => {
            jd += `    • ${activity.name}\n`
            if (activity.description) {
              jd += `      ${activity.description}\n`
            }
          })
        } else {
          jd += `    • [Activities to be defined]\n`
        }
        jd += `\n`
      })
    })

    jd += `QUALIFICATIONS\n`
    jd += `${'-'.repeat(40)}\n`
    jd += `Required:\n`
    jd += `  • [Add required education/certifications]\n`
    jd += `  • [Add required experience]\n`
    jd += `  • [Add required skills]\n\n`
    jd += `Preferred:\n`
    jd += `  • [Add preferred qualifications]\n\n`

    jd += `COMPENSATION & BENEFITS\n`
    jd += `${'-'.repeat(40)}\n`
    jd += `  • Competitive salary based on experience\n`
    jd += `  • [Add benefits]\n\n`

    jd += `${'─'.repeat(60)}\n`
    jd += `Generated from OpsMap - ${new Date().toLocaleDateString()}\n`
    jd += `Based on: ${selectedSubFunctions.size} sub-functions, ${totalActivities} activities\n`

    return jd
  }

  const jobDescription = generateJobDescription()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jobDescription)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const filename = roleName || 'job-description'
    const blob = new Blob([jobDescription], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--cream)' }}>
      <Header
        title="Job Description Generator"
        description="Select sub-functions from your function chart to build a role"
      />

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full max-w-6xl mx-auto">
          {functions.length === 0 ? (
            <div 
              className="rounded-xl border-2 border-dashed p-12 text-center"
              style={{ borderColor: 'var(--stone)', background: 'var(--white)' }}
            >
              <Briefcase className="mx-auto h-12 w-12" style={{ color: 'var(--text-muted)' }} />
              <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                No functions defined
              </h3>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Build your function chart first, then come back to generate job descriptions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Left: Function/Sub-Function Selection */}
              <div 
                className="rounded-xl border overflow-hidden flex flex-col"
                style={{ borderColor: 'var(--stone)', background: 'var(--white)' }}
              >
                <div className="px-6 py-4 flex-shrink-0" style={{ background: 'var(--gk-charcoal)' }}>
                  <h3 className="font-semibold text-white">Select Sub-Functions</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--gk-green-light)' }}>
                    Choose which responsibilities this role should include
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {sortedFunctions.map(func => {
                      const funcSubFunctions = getSubFunctionsForFunction(func.id)
                      const isExpanded = expandedFunctions.has(func.id)
                      const allSelected = isAllSelectedForFunction(func.id)
                      const someSelected = isSomeSelectedForFunction(func.id)

                      return (
                        <div 
                          key={func.id}
                          className="rounded-lg overflow-hidden"
                          style={{ border: '1px solid var(--stone)' }}
                        >
                          {/* Function Header */}
                          <div
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                            style={{ 
                              background: func.color || 'var(--gk-charcoal)',
                              color: 'white'
                            }}
                            onClick={() => toggleFunction(func.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="flex-1 font-medium">{func.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                selectAllForFunction(func.id)
                              }}
                              className="p-1 rounded hover:bg-white/20 transition-colors"
                              title={allSelected ? 'Deselect all' : 'Select all'}
                            >
                              {allSelected ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : someSelected ? (
                                <div className="relative">
                                  <Square className="h-4 w-4" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-0.5 bg-white rounded" />
                                  </div>
                                </div>
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                            <span className="text-xs opacity-75">
                              {funcSubFunctions.filter(sf => selectedSubFunctions.has(sf.id)).length}/{funcSubFunctions.length}
                            </span>
                          </div>

                          {/* Sub-Functions */}
                          {isExpanded && funcSubFunctions.length > 0 && (
                            <div className="p-2 space-y-1" style={{ background: 'var(--cream-light)' }}>
                              {funcSubFunctions.map(sf => {
                                const activities = getActivitiesForSubFunction(sf.id)
                                const isSelected = selectedSubFunctions.has(sf.id)

                                return (
                                  <div
                                    key={sf.id}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all"
                                    style={{ 
                                      background: isSelected ? 'var(--mint)' : 'var(--white)',
                                      border: `1px solid ${isSelected ? 'var(--gk-green)' : 'var(--stone)'}`
                                    }}
                                    onClick={() => toggleSubFunction(sf.id)}
                                  >
                                    {isSelected ? (
                                      <CheckSquare 
                                        className="h-4 w-4 flex-shrink-0" 
                                        style={{ color: 'var(--gk-green)' }} 
                                      />
                                    ) : (
                                      <Square 
                                        className="h-4 w-4 flex-shrink-0" 
                                        style={{ color: 'var(--text-muted)' }} 
                                      />
                                    )}
                                    <span 
                                      className="flex-1 text-sm"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                      {sf.name}
                                    </span>
                                    <span 
                                      className="text-xs px-2 py-0.5 rounded"
                                      style={{ 
                                        background: activities.length > 0 ? 'var(--sand)' : 'transparent',
                                        color: 'var(--text-muted)'
                                      }}
                                    >
                                      {activities.length} activities
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {isExpanded && funcSubFunctions.length === 0 && (
                            <div className="p-4 text-sm italic" style={{ color: 'var(--text-muted)' }}>
                              No sub-functions defined
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Selection Summary */}
                <div 
                  className="flex-shrink-0 px-4 py-3 border-t"
                  style={{ borderColor: 'var(--stone)', background: 'var(--cream)' }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {selectedSubFunctions.size} sub-functions selected
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {totalActivities} total activities
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Role Details & Output */}
              <div 
                className="rounded-xl border overflow-hidden flex flex-col"
                style={{ borderColor: 'var(--stone)', background: 'var(--white)' }}
              >
                <div className="px-6 py-4 flex-shrink-0" style={{ background: 'var(--gk-charcoal)' }}>
                  <h3 className="font-semibold text-white">Role Details</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--gk-green-light)' }}>
                    Customize the generated job description
                  </p>
                </div>

                <div className="flex-shrink-0 p-4 space-y-4" style={{ borderBottom: '1px solid var(--stone)' }}>
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Role/Position Title
                    </label>
                    <input
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g., Operations Manager, Sales Coordinator"
                      className="w-full px-4 py-2 rounded-lg border text-sm"
                      style={{ 
                        borderColor: 'var(--stone)', 
                        background: 'var(--white)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Position Summary (optional)
                    </label>
                    <textarea
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      placeholder="Brief overview of the role's purpose..."
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border text-sm resize-none"
                      style={{ 
                        borderColor: 'var(--stone)', 
                        background: 'var(--white)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                {/* Generated Output */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div 
                    className="flex items-center justify-between px-4 py-2 flex-shrink-0"
                    style={{ background: 'var(--cream)' }}
                  >
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Generated Job Description
                    </span>
                    {selectedSubFunctions.size > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors"
                          style={{ 
                            background: 'var(--mint)', 
                            color: 'var(--gk-green-dark)' 
                          }}
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={handleDownload}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors"
                          style={{ 
                            background: 'var(--gk-green)', 
                            color: 'white' 
                          }}
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {selectedSubFunctions.size === 0 ? (
                      <div 
                        className="h-full flex items-center justify-center text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <div className="text-center">
                          <FileText className="mx-auto h-10 w-10 mb-2 opacity-50" />
                          <p>Select sub-functions from the left panel</p>
                          <p>to generate a job description</p>
                        </div>
                      </div>
                    ) : (
                      <pre 
                        className="rounded-lg p-4 text-sm whitespace-pre-wrap font-mono"
                        style={{ 
                          background: 'var(--cream-light)', 
                          color: 'var(--text-primary)'
                        }}
                      >
                        {jobDescription}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
