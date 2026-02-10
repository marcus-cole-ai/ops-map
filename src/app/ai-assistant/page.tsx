'use client'

import { useState, useRef } from 'react'
import { useOpsMapStore } from '@/store'
import {
  Sparkles,
  FileText,
  Upload,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  Wand2,
  MessageSquare,
  LayoutGrid,
  Brain,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { GeneratedWorkflow, GeneratedFunctionChart, GeneratedGap } from '@/lib/ai'

type TabType = 'transcript' | 'meeting' | 'function-chart'

export default function AIAssistantPage() {
  const {
    companyProfile,
    aiSettings,
    workflows,
    phases,
    steps,
    functions,
    subFunctions,
    coreActivities,
    addWorkflow,
    addPhase,
    addStep,
    addFunction,
    addSubFunction,
    addCoreActivity,
    linkActivityToSubFunction,
  } = useOpsMapStore()

  const [activeTab, setActiveTab] = useState<TabType>('transcript')
  const [transcript, setTranscript] = useState('')
  const [meetingNotes, setMeetingNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generated content
  const [generatedWorkflows, setGeneratedWorkflows] = useState<GeneratedWorkflow[] | null>(null)
  const [generatedFunctionChart, setGeneratedFunctionChart] = useState<GeneratedFunctionChart | null>(null)
  const [meetingAnalysis, setMeetingAnalysis] = useState<{
    summary: string
    workflowSuggestions: { workflowName: string; suggestion: string; type: string }[]
    newGaps: GeneratedGap[]
  } | null>(null)

  // Preview state
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<number>>(new Set())
  const [expandedFunctions, setExpandedFunctions] = useState<Set<number>>(new Set())

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (activeTab === 'transcript') {
        setTranscript(content)
      } else if (activeTab === 'meeting') {
        setMeetingNotes(content)
      }
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Generate workflows from transcript
  const handleGenerateWorkflows = async () => {
    if (!transcript.trim()) return

    setIsGenerating(true)
    setError(null)
    setGeneratedWorkflows(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'workflows',
          transcript,
          companyProfile,
          model: aiSettings?.preferredModel || 'gemini-flash',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate workflows')
      }

      const data = await response.json()
      setGeneratedWorkflows(data.workflows)
      // Expand all by default
      setExpandedWorkflows(new Set(data.workflows.map((_: GeneratedWorkflow, i: number) => i)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workflows')
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate function chart from existing workflows
  const handleGenerateFunctionChart = async () => {
    if (workflows.length === 0) {
      setError('Create some workflows first before generating a function chart')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedFunctionChart(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'functionChart',
          workflows,
          phases,
          steps,
          companyProfile,
          model: aiSettings?.preferredModel || 'gemini-flash',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate function chart')
      }

      const data = await response.json()
      setGeneratedFunctionChart(data)
      // Expand all by default
      setExpandedFunctions(new Set(data.functions.map((_: unknown, i: number) => i)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate function chart')
    } finally {
      setIsGenerating(false)
    }
  }

  // Analyze meeting notes
  const handleAnalyzeMeeting = async () => {
    if (!meetingNotes.trim()) return

    setIsGenerating(true)
    setError(null)
    setMeetingAnalysis(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'meetingAnalysis',
          notes: meetingNotes,
          workflows,
          phases,
          steps,
          companyProfile,
          model: aiSettings?.preferredModel || 'gemini-flash',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to analyze meeting')
      }

      const data = await response.json()
      setMeetingAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze meeting')
    } finally {
      setIsGenerating(false)
    }
  }

  // Save generated workflows to store
  const handleSaveWorkflows = () => {
    if (!generatedWorkflows) return

    generatedWorkflows.forEach((wf) => {
      const newWorkflow = addWorkflow(wf.name, wf.description)
      wf.phases.forEach((phase) => {
        const newPhase = addPhase(newWorkflow.id, phase.name)
        phase.steps.forEach((stepName) => {
          addStep(newPhase.id, stepName)
        })
      })
    })

    setGeneratedWorkflows(null)
    setTranscript('')
  }

  // Save generated function chart to store
  const handleSaveFunctionChart = () => {
    if (!generatedFunctionChart) return

    generatedFunctionChart.functions.forEach((func) => {
      const newFunction = addFunction(func.name, func.description)
      // Note: color would need updateFunction call
      
      func.subFunctions.forEach((sub) => {
        const newSubFunction = addSubFunction(newFunction.id, sub.name)
        
        sub.activities.forEach((actName) => {
          const newActivity = addCoreActivity(actName)
          linkActivityToSubFunction(newSubFunction.id, newActivity.id)
        })
      })
    })

    setGeneratedFunctionChart(null)
  }

  const toggleWorkflow = (index: number) => {
    const newExpanded = new Set(expandedWorkflows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedWorkflows(newExpanded)
  }

  const toggleFunction = (index: number) => {
    const newExpanded = new Set(expandedFunctions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedFunctions(newExpanded)
  }

  return (
    <div className="min-h-full p-8" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: 'var(--sand)' }}>
            <Sparkles className="h-6 w-6" style={{ color: '#b8956e' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            AI Assistant
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          Generate workflows, function charts, and get insights using AI
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-muted)' }}>
            Using: {aiSettings?.preferredModel === 'gemini-flash' ? 'Gemini 2.0 Flash' : 'Kimi 2.5'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('transcript')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: activeTab === 'transcript' ? 'var(--gk-green)' : 'var(--white)',
            color: activeTab === 'transcript' ? 'white' : 'var(--text-primary)',
            border: activeTab === 'transcript' ? 'none' : '1px solid var(--stone)',
          }}
        >
          <FileText className="h-4 w-4" />
          Transcript → Workflows
        </button>
        <button
          onClick={() => setActiveTab('meeting')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: activeTab === 'meeting' ? 'var(--gk-green)' : 'var(--white)',
            color: activeTab === 'meeting' ? 'white' : 'var(--text-primary)',
            border: activeTab === 'meeting' ? 'none' : '1px solid var(--stone)',
          }}
        >
          <MessageSquare className="h-4 w-4" />
          Meeting Notes
        </button>
        <button
          onClick={() => setActiveTab('function-chart')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: activeTab === 'function-chart' ? 'var(--gk-green)' : 'var(--white)',
            color: activeTab === 'function-chart' ? 'white' : 'var(--text-primary)',
            border: activeTab === 'function-chart' ? 'none' : '1px solid var(--stone)',
          }}
        >
          <LayoutGrid className="h-4 w-4" />
          Generate Function Chart
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="mb-6 p-4 rounded-lg flex items-center gap-3"
          style={{ background: '#fce8e0', border: '1px solid #c4785a' }}
        >
          <AlertCircle className="h-5 w-5" style={{ color: '#c4785a' }} />
          <p style={{ color: '#c4785a' }}>{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 rounded hover:bg-black/10"
          >
            <X className="h-4 w-4" style={{ color: '#c4785a' }} />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          {activeTab === 'transcript' && (
            <>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Transcript / Brain Dump
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Paste a meeting transcript, brain dump, or description of how your business operates.
                The AI will extract workflows with phases and steps.
              </p>

              <div className="relative mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--stone)', background: 'var(--cream-light)' }}
                >
                  <Upload className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Drop a .txt or .md file, or click to browse
                  </span>
                </div>
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Or type/paste your transcript here...

Example:
'So when a new lead comes in, first Sarah checks if they're in our service area. Then she does a quick phone screen to understand the scope. If it looks like a fit, she schedules a site visit with Tom. Tom goes out, takes measurements, photos, and talks through what they want to accomplish...'

The more detail you provide about your processes, the better the generated workflows will be."
                rows={12}
                className="w-full px-4 py-3 rounded-lg border resize-none"
                style={{
                  borderColor: 'var(--stone)',
                  background: 'var(--cream-light)',
                  color: 'var(--text-primary)',
                }}
              />

              <button
                onClick={handleGenerateWorkflows}
                disabled={!transcript.trim() || isGenerating}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--gk-green)' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Workflows...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    Generate Workflows
                  </>
                )}
              </button>
            </>
          )}

          {activeTab === 'meeting' && (
            <>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Meeting Notes Analysis
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Paste meeting notes to identify process changes, new gaps, and suggested workflow updates.
              </p>

              <div className="relative mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--stone)', background: 'var(--cream-light)' }}
                >
                  <Upload className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Drop a .txt or .md file, or click to browse
                  </span>
                </div>
              </div>

              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Paste your meeting notes here...

Example:
'Team meeting 2/9 - discussed the change order problem. We're losing money because PMs aren't getting sign-off before starting extra work. Need a formal process. Also talked about lead follow-up - too many leads going cold because response time is too slow...'"
                rows={12}
                className="w-full px-4 py-3 rounded-lg border resize-none"
                style={{
                  borderColor: 'var(--stone)',
                  background: 'var(--cream-light)',
                  color: 'var(--text-primary)',
                }}
              />

              <button
                onClick={handleAnalyzeMeeting}
                disabled={!meetingNotes.trim() || isGenerating}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--gk-green)' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Meeting...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    Analyze Meeting Notes
                  </>
                )}
              </button>
            </>
          )}

          {activeTab === 'function-chart' && (
            <>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Generate Function Chart
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Create a function chart based on your existing workflows. The AI will analyze your
                processes and create an organizational structure with functions, sub-functions, and activities.
              </p>

              <div
                className="p-4 rounded-lg mb-4"
                style={{ background: 'var(--cream-light)' }}
              >
                <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Current Workflows
                </h3>
                {workflows.length > 0 ? (
                  <ul className="space-y-1">
                    {workflows.map((wf) => {
                      const wfPhases = phases.filter((p) => p.workflowId === wf.id)
                      return (
                        <li key={wf.id} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4" style={{ color: 'var(--gk-green)' }} />
                          <span style={{ color: 'var(--text-primary)' }}>{wf.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            ({wfPhases.length} phases)
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    No workflows yet. Generate workflows from a transcript first.
                  </p>
                )}
              </div>

              {functions.length > 0 && (
                <div
                  className="p-4 rounded-lg mb-4"
                  style={{ background: '#fce8e0' }}
                >
                  <p className="text-sm" style={{ color: '#c4785a' }}>
                    ⚠️ You already have {functions.length} function(s) defined. Generating a new function
                    chart will add to your existing structure, not replace it.
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerateFunctionChart}
                disabled={workflows.length === 0 || isGenerating}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--gk-green)' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Function Chart...
                  </>
                ) : (
                  <>
                    <LayoutGrid className="h-5 w-5" />
                    Generate Function Chart
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Output Panel */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {activeTab === 'transcript' && 'Generated Workflows'}
            {activeTab === 'meeting' && 'Meeting Analysis'}
            {activeTab === 'function-chart' && 'Generated Function Chart'}
          </h2>

          {/* Transcript Output - Generated Workflows */}
          {activeTab === 'transcript' && (
            <>
              {generatedWorkflows ? (
                <div className="space-y-4">
                  {generatedWorkflows.map((wf, wfIndex) => (
                    <div
                      key={wfIndex}
                      className="rounded-lg overflow-hidden"
                      style={{ border: '1px solid var(--stone)' }}
                    >
                      <button
                        onClick={() => toggleWorkflow(wfIndex)}
                        className="w-full flex items-center gap-3 p-4 text-left"
                        style={{ background: 'var(--cream-light)' }}
                      >
                        {expandedWorkflows.has(wfIndex) ? (
                          <ChevronDown className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                        ) : (
                          <ChevronRight className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                        )}
                        <div className="flex-1">
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {wf.name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {wf.description}
                          </div>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
                        >
                          {wf.phases.length} phases
                        </span>
                      </button>

                      {expandedWorkflows.has(wfIndex) && (
                        <div className="p-4 space-y-3">
                          {wf.phases.map((phase, phaseIndex) => (
                            <div key={phaseIndex}>
                              <div
                                className="font-medium text-sm mb-1"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {phaseIndex + 1}. {phase.name}
                              </div>
                              <ul className="ml-6 space-y-1">
                                {phase.steps.map((step, stepIndex) => (
                                  <li
                                    key={stepIndex}
                                    className="text-sm flex items-center gap-2"
                                  >
                                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleSaveWorkflows}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white"
                    style={{ background: 'var(--gk-green)' }}
                  >
                    <Check className="h-5 w-5" />
                    Save All Workflows to OpsMap
                  </button>
                </div>
              ) : (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Generated workflows will appear here</p>
                </div>
              )}
            </>
          )}

          {/* Meeting Output */}
          {activeTab === 'meeting' && (
            <>
              {meetingAnalysis ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: 'var(--mint)' }}
                  >
                    <h3 className="font-medium mb-2" style={{ color: 'var(--gk-green-dark)' }}>
                      Summary
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--gk-green-dark)' }}>
                      {meetingAnalysis.summary}
                    </p>
                  </div>

                  {/* Workflow Suggestions */}
                  {meetingAnalysis.workflowSuggestions.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Workflow Suggestions
                      </h3>
                      <div className="space-y-2">
                        {meetingAnalysis.workflowSuggestions.map((suggestion, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg"
                            style={{ background: 'var(--cream-light)' }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ background: 'var(--dusty-blue)', color: '#3d4f5f' }}
                              >
                                {suggestion.type}
                              </span>
                              <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                {suggestion.workflowName}
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {suggestion.suggestion}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Gaps */}
                  {meetingAnalysis.newGaps.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Gaps Discovered
                      </h3>
                      <div className="space-y-2">
                        {meetingAnalysis.newGaps.map((gap, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg"
                            style={{ 
                              background: gap.priority === 'critical' ? '#fce8e0' : 'var(--cream-light)',
                              borderLeft: gap.priority === 'critical' ? '3px solid #c4785a' : undefined
                            }}
                          >
                            <div className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                              {gap.title}
                            </div>
                            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                              {gap.description}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--gk-green-dark)' }}>
                              💡 {gap.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Meeting analysis will appear here</p>
                </div>
              )}
            </>
          )}

          {/* Function Chart Output */}
          {activeTab === 'function-chart' && (
            <>
              {generatedFunctionChart ? (
                <div className="space-y-4">
                  {generatedFunctionChart.functions.map((func, funcIndex) => (
                    <div
                      key={funcIndex}
                      className="rounded-lg overflow-hidden"
                      style={{ border: '1px solid var(--stone)' }}
                    >
                      <button
                        onClick={() => toggleFunction(funcIndex)}
                        className="w-full flex items-center gap-3 p-4 text-left"
                        style={{ background: func.color + '20' }}
                      >
                        {expandedFunctions.has(funcIndex) ? (
                          <ChevronDown className="h-5 w-5" style={{ color: func.color }} />
                        ) : (
                          <ChevronRight className="h-5 w-5" style={{ color: func.color }} />
                        )}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: func.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {func.name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {func.description}
                          </div>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ background: func.color + '30', color: func.color }}
                        >
                          {func.subFunctions.length} sub-functions
                        </span>
                      </button>

                      {expandedFunctions.has(funcIndex) && (
                        <div className="p-4 space-y-3">
                          {func.subFunctions.map((sub, subIndex) => (
                            <div key={subIndex}>
                              <div
                                className="font-medium text-sm mb-1"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {sub.name}
                              </div>
                              <ul className="ml-4 space-y-1">
                                {sub.activities.map((act, actIndex) => (
                                  <li
                                    key={actIndex}
                                    className="text-sm flex items-center gap-2"
                                  >
                                    <span style={{ color: func.color }}>•</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleSaveFunctionChart}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white"
                    style={{ background: 'var(--gk-green)' }}
                  >
                    <Check className="h-5 w-5" />
                    Save Function Chart to OpsMap
                  </button>
                </div>
              ) : (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Generated function chart will appear here</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
