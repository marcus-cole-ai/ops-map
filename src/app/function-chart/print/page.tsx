'use client'

import { useOpsMapStore } from '@/store'
import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrintFunctionChartPage() {
  const company = useOpsMapStore((state) => state.company)
  const functions = useOpsMapStore((state) => state.functions)
  const subFunctions = useOpsMapStore((state) => state.subFunctions)
  const getActivitiesForSubFunction = useOpsMapStore((state) => state.getActivitiesForSubFunction)

  const sortedFunctions = [...functions].sort((a, b) => a.orderIndex - b.orderIndex)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      {/* Header - hidden on print */}
      <div className="no-print bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/function-chart" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Print Function Chart</h1>
            <p className="text-sm text-slate-500">Optimized for printing</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      {/* Printable Content */}
      <div className="p-8 max-w-[1100px] mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{company?.name || 'Company'}</h1>
          <h2 className="text-xl text-slate-600 mt-1">Function Chart</h2>
          <p className="text-sm text-slate-400 mt-2">Generated {new Date().toLocaleDateString()}</p>
        </div>

        {/* Functions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-3">
          {sortedFunctions.map((func) => {
            const funcSubFunctions = subFunctions
              .filter((sf) => sf.functionId === func.id)
              .sort((a, b) => a.orderIndex - b.orderIndex)

            return (
              <div
                key={func.id}
                className="border-2 rounded-lg overflow-hidden break-inside-avoid"
                style={{ borderColor: func.color }}
              >
                {/* Function Header */}
                <div
                  className="px-3 py-2 text-white font-semibold text-sm"
                  style={{ backgroundColor: func.color }}
                >
                  {func.name}
                </div>

                {/* Sub-Functions */}
                <div className="p-2 space-y-2">
                  {funcSubFunctions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No sub-functions</p>
                  ) : (
                    funcSubFunctions.map((sub) => {
                      const activities = getActivitiesForSubFunction(sub.id)
                      return (
                        <div key={sub.id} className="border border-slate-200 rounded p-2">
                          <div className="font-medium text-xs text-slate-800 mb-1">
                            {sub.name}
                          </div>
                          {activities.length > 0 && (
                            <ul className="text-[10px] text-slate-600 space-y-0.5">
                              {activities.slice(0, 5).map((activity) => (
                                <li key={activity.id} className="flex items-start gap-1">
                                  <span className="text-slate-400">•</span>
                                  <span className="leading-tight">{activity.name}</span>
                                </li>
                              ))}
                              {activities.length > 5 && (
                                <li className="text-slate-400 italic">
                                  +{activities.length - 5} more
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
          Generated with OpsMap • GrowthKits
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
