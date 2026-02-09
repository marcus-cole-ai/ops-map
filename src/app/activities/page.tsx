'use client'

import { Header } from '@/components/layout/Header'
import { useOpsMapStore } from '@/store'
import { Activity } from 'lucide-react'

export default function ActivitiesPage() {
  const activities = useOpsMapStore((state) => state.coreActivities)

  return (
    <div>
      <Header
        title="Core Activities"
        description="All activities across your function chart and workflows"
      />
      <div className="p-6">
        {activities.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No activities yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Add activities through your Function Chart to see them listed here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{activity.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{activity.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
