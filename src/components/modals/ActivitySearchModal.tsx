'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useOpsMapStore } from '@/store'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { CoreActivity } from '@/types'

interface ActivitySearchModalProps {
  isOpen: boolean
  onClose: () => void
  linkedActivityIds: string[]
  onLinkActivity: (activity: CoreActivity) => void
  onCreateNewActivity: () => void
}

export function ActivitySearchModal({
  isOpen,
  onClose,
  linkedActivityIds,
  onLinkActivity,
  onCreateNewActivity,
}: ActivitySearchModalProps) {
  const { searchActivities, functions, subFunctions, subFunctionActivities } = useOpsMapStore()

  const [query, setQuery] = useState('')
  const [functionId, setFunctionId] = useState('')
  const [subFunctionId, setSubFunctionId] = useState('')
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setFunctionId('')
      setSubFunctionId('')
      setHoveredActivityId(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!subFunctionId) return
    const selected = subFunctions.find(sf => sf.id === subFunctionId)
    if (!selected) {
      setSubFunctionId('')
      return
    }
    if (functionId && selected.functionId !== functionId) {
      setSubFunctionId('')
    }
  }, [functionId, subFunctionId, subFunctions])

  const filteredSubFunctions = useMemo(
    () => subFunctions.filter(sf => !functionId || sf.functionId === functionId),
    [functionId, subFunctions]
  )

  const results = useMemo(
    () =>
      searchActivities(query, {
        functionId: functionId || undefined,
        subFunctionId: subFunctionId || undefined,
      }),
    [functionId, query, searchActivities, subFunctionId]
  )

  const resolveBreadcrumb = (activityId: string) => {
    const links = subFunctionActivities.filter(link => link.coreActivityId === activityId)
    if (links.length === 0) return 'No function linkage yet'

    const first = links[0]
    const subFunction = subFunctions.find(sf => sf.id === first.subFunctionId)
    if (!subFunction) return 'No function linkage yet'

    const fn = functions.find(item => item.id === subFunction.functionId)
    if (!fn) return subFunction.name

    return `${fn.name} > ${subFunction.name}`
  }

  const preview = useMemo(() => {
    if (hoveredActivityId) {
      return results.find(activity => activity.id === hoveredActivityId) || null
    }
    return results[0] || null
  }, [hoveredActivityId, results])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link Core Activity"
      description="Search and link an existing activity to this step."
      className="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_17rem] gap-4">
        <div className="space-y-3">
          <div className="relative">
            <Search
              className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by activity name"
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
              style={{
                borderColor: 'var(--stone)',
                background: 'var(--white)',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={functionId}
              onChange={(e) => setFunctionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{
                borderColor: 'var(--stone)',
                background: 'var(--white)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">All Functions</option>
              {functions
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((fn) => (
                  <option key={fn.id} value={fn.id}>
                    {fn.name}
                  </option>
                ))}
            </select>

            <select
              value={subFunctionId}
              onChange={(e) => setSubFunctionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{
                borderColor: 'var(--stone)',
                background: 'var(--white)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">All Sub-Functions</option>
              {filteredSubFunctions
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((subFunction) => (
                  <option key={subFunction.id} value={subFunction.id}>
                    {subFunction.name}
                  </option>
                ))}
            </select>
          </div>

          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: 'var(--stone)', background: 'var(--white)' }}
          >
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-sm p-4 italic" style={{ color: 'var(--text-muted)' }}>
                  No activities found.
                </p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--stone)' }}>
                  {results.map((activity) => {
                    const isLinked = linkedActivityIds.includes(activity.id)
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onMouseEnter={() => setHoveredActivityId(activity.id)}
                        onFocus={() => setHoveredActivityId(activity.id)}
                        onClick={() => {
                          if (isLinked) return
                          onLinkActivity(activity)
                          onClose()
                        }}
                        className="w-full px-4 py-3 text-left flex items-center gap-3"
                        style={{
                          background: isLinked ? 'var(--cream-light)' : 'var(--white)',
                          cursor: isLinked ? 'default' : 'pointer',
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              {activity.name}
                            </span>
                            <StatusBadge status={activity.status} />
                            {isLinked && (
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
                              >
                                Linked
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {resolveBreadcrumb(activity.id)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onCreateNewActivity}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium"
            style={{
              borderColor: 'var(--stone)',
              background: 'var(--cream-light)',
              color: 'var(--text-secondary)',
            }}
          >
            <Plus className="h-4 w-4" />
            Create New Activity
          </button>
        </div>

        <div
          className="rounded-lg border p-4 h-fit"
          style={{ borderColor: 'var(--stone)', background: 'var(--white)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
            Preview
          </p>
          {preview ? (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {preview.name}
                </p>
                <StatusBadge status={preview.status} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {preview.description || 'No description yet.'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {resolveBreadcrumb(preview.id)}
              </p>
            </div>
          ) : (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
              Hover an activity result to preview details.
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
