'use client'

import { useState } from 'react'
import { useOpsMapStore } from '@/store'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  Brain,
  Clock,
  ChevronDown,
  ChevronRight,
  Check,
  Lightbulb,
  Target,
  GitBranch,
  LayoutGrid,
  Activity,
  X,
} from 'lucide-react'
import type { AIGap, GapAnalysis } from '@/types'

const PRIORITY_COLORS = {
  critical: { bg: '#fce8e0', border: '#c4785a', text: '#c4785a' },
  important: { bg: 'var(--sand)', border: '#b8956e', text: '#b8956e' },
  'nice-to-have': { bg: 'var(--dusty-blue)', border: '#3d4f5f', text: '#3d4f5f' },
}

const CATEGORY_ICONS = {
  workflow: GitBranch,
  'function-chart': LayoutGrid,
  activity: Activity,
  general: Target,
}

export default function AIGapAnalysisPage() {
  const {
    companyProfile,
    aiSettings,
    workflows,
    phases,
    steps,
    functions,
    subFunctions,
    coreActivities,
    gapAnalysisHistory,
    addGapAnalysis,
    markGapApplied,
    addWorkflow,
    addPhase,
    addStep,
    addFunction,
    addSubFunction,
    addCoreActivity,
  } = useOpsMapStore()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<{ gaps: AIGap[] } | null>(null)
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set())
  const [showHistory, setShowHistory] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentAnalysis(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gapAnalysis',
          workflows,
          phases,
          steps,
          functions,
          subFunctions,
          activities: coreActivities,
          companyProfile,
          model: aiSettings?.preferredModel || 'gemini-flash',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to analyze gaps')
      }

      const data = await response.json()
      
      // Transform to include IDs
      const gapsWithIds: AIGap[] = data.gaps.map((gap: Omit<AIGap, 'id' | 'applied'>, index: number) => ({
        ...gap,
        id: `gap-${Date.now()}-${index}`,
        applied: false,
      }))

      setCurrentAnalysis({ gaps: gapsWithIds })
      
      // Expand critical gaps by default
      const criticalIds = new Set(
        gapsWithIds.filter((g) => g.priority === 'critical').map((g) => g.id)
      )
      setExpandedGaps(criticalIds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze gaps')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveAnalysis = () => {
    if (!currentAnalysis) return

    const analysis: GapAnalysis = {
      id: `analysis-${Date.now()}`,
      createdAt: new Date(),
      gaps: currentAnalysis.gaps,
    }

    addGapAnalysis(analysis)
    setCurrentAnalysis(null)
  }

  const toggleGap = (gapId: string) => {
    const newExpanded = new Set(expandedGaps)
    if (newExpanded.has(gapId)) {
      newExpanded.delete(gapId)
    } else {
      newExpanded.add(gapId)
    }
    setExpandedGaps(newExpanded)
  }

  const gapsToDisplay = currentAnalysis?.gaps || []
  const criticalCount = gapsToDisplay.filter((g) => g.priority === 'critical').length
  const importantCount = gapsToDisplay.filter((g) => g.priority === 'important').length
  const niceToHaveCount = gapsToDisplay.filter((g) => g.priority === 'nice-to-have').length

  return (
    <div className="min-h-full p-8" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: 'var(--sand)' }}>
            <AlertCircle className="h-6 w-6" style={{ color: '#b8956e' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            AI Gap Analysis
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          AI-powered analysis to find gaps in your operations against industry best practices
        </p>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>
              Using: {aiSettings?.preferredModel === 'gemini-flash' ? 'Gemini 2.0 Flash' : 'Kimi 2.5'}
            </span>
          </div>
          {gapAnalysisHistory && gapAnalysisHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm"
              style={{ color: 'var(--gk-green)' }}
            >
              <Clock className="h-4 w-4" />
              {gapAnalysisHistory.length} previous {gapAnalysisHistory.length === 1 ? 'analysis' : 'analyses'}
            </button>
          )}
        </div>
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

      {/* No Profile Warning */}
      {(!companyProfile?.industry && !companyProfile?.companyType) && (
        <div
          className="mb-6 p-4 rounded-lg flex items-center gap-3"
          style={{ background: 'var(--sand)', border: '1px solid #b8956e' }}
        >
          <Lightbulb className="h-5 w-5" style={{ color: '#b8956e' }} />
          <p style={{ color: '#b8956e' }}>
            <strong>Tip:</strong> Complete your{' '}
            <Link href="/settings/profile" style={{ textDecoration: 'underline' }}>
              company profile
            </Link>{' '}
            to get more tailored recommendations.
          </p>
        </div>
      )}

      {/* Analysis Trigger */}
      {!currentAnalysis && (
        <div
          className="rounded-xl p-8 text-center mb-8"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="max-w-md mx-auto">
            <Sparkles className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--gk-green)', opacity: 0.5 }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Analyze Your Operations
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Our AI will review your workflows, function chart, and activities against construction
              industry best practices to identify gaps and improvement opportunities.
            </p>
            <div className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Current data: {workflows.length} workflows, {functions.length} functions, {coreActivities.length} activities
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--gk-green)' }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing Operations...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Run Gap Analysis
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {currentAnalysis && (
        <div className="space-y-6">
          {/* Summary */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Analysis Results
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentAnalysis(null)
                    setExpandedGaps(new Set())
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveAnalysis}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: 'var(--gk-green)' }}
                >
                  <Check className="h-4 w-4" />
                  Save Analysis
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div
                className="p-4 rounded-lg text-center"
                style={{ background: PRIORITY_COLORS.critical.bg }}
              >
                <div className="text-2xl font-bold" style={{ color: PRIORITY_COLORS.critical.text }}>
                  {criticalCount}
                </div>
                <div className="text-sm" style={{ color: PRIORITY_COLORS.critical.text }}>
                  Critical
                </div>
              </div>
              <div
                className="p-4 rounded-lg text-center"
                style={{ background: PRIORITY_COLORS.important.bg }}
              >
                <div className="text-2xl font-bold" style={{ color: PRIORITY_COLORS.important.text }}>
                  {importantCount}
                </div>
                <div className="text-sm" style={{ color: PRIORITY_COLORS.important.text }}>
                  Important
                </div>
              </div>
              <div
                className="p-4 rounded-lg text-center"
                style={{ background: PRIORITY_COLORS['nice-to-have'].bg }}
              >
                <div className="text-2xl font-bold" style={{ color: PRIORITY_COLORS['nice-to-have'].text }}>
                  {niceToHaveCount}
                </div>
                <div className="text-sm" style={{ color: PRIORITY_COLORS['nice-to-have'].text }}>
                  Nice to Have
                </div>
              </div>
            </div>
          </div>

          {/* Gaps List */}
          <div className="space-y-4">
            {gapsToDisplay.map((gap) => {
              const colors = PRIORITY_COLORS[gap.priority]
              const CategoryIcon = CATEGORY_ICONS[gap.category] || Target
              const isExpanded = expandedGaps.has(gap.id)

              return (
                <div
                  key={gap.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'var(--white)',
                    border: `1px solid var(--stone)`,
                    borderLeft: `4px solid ${colors.border}`,
                  }}
                >
                  <button
                    onClick={() => toggleGap(gap.id)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    )}
                    <CategoryIcon className="h-5 w-5 flex-shrink-0" style={{ color: colors.text }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {gap.title}
                      </div>
                      {!isExpanded && (
                        <div className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                          {gap.description}
                        </div>
                      )}
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {gap.priority}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pl-14 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          Description
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {gap.description}
                        </p>
                      </div>

                      <div
                        className="p-4 rounded-lg"
                        style={{ background: 'var(--mint)' }}
                      >
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--gk-green-dark)' }} />
                          <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--gk-green-dark)' }}>
                              Recommendation
                            </h4>
                            <p className="text-sm" style={{ color: 'var(--gk-green-dark)' }}>
                              {gap.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span
                          className="px-2 py-1 rounded"
                          style={{ background: 'var(--cream)' }}
                        >
                          {gap.category}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Run Another Analysis */}
          <div className="text-center">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--cream-light)', color: 'var(--text-secondary)' }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run New Analysis
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* History Section */}
      {showHistory && gapAnalysisHistory && gapAnalysisHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Previous Analyses
          </h2>
          <div className="space-y-4">
            {gapAnalysisHistory
              .slice()
              .reverse()
              .map((analysis) => (
                <div
                  key={analysis.id}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date(analysis.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {analysis.gaps.length} gaps found
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span style={{ color: PRIORITY_COLORS.critical.text }}>
                      {analysis.gaps.filter((g) => g.priority === 'critical').length} critical
                    </span>
                    <span style={{ color: PRIORITY_COLORS.important.text }}>
                      {analysis.gaps.filter((g) => g.priority === 'important').length} important
                    </span>
                    <span style={{ color: PRIORITY_COLORS['nice-to-have'].text }}>
                      {analysis.gaps.filter((g) => g.priority === 'nice-to-have').length} nice-to-have
                    </span>
                  </div>
                  <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {analysis.gaps.filter((g) => g.applied).length} of {analysis.gaps.length} applied
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State for History */}
      {!currentAnalysis && !isAnalyzing && gapAnalysisHistory && gapAnalysisHistory.length === 0 && (
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: 'var(--cream-light)' }}
        >
          <p style={{ color: 'var(--text-muted)' }}>
            No previous analyses. Run your first gap analysis to get AI-powered recommendations.
          </p>
        </div>
      )}
    </div>
  )
}
