"use client";

import MissionSimulator from './MissionSimulator'
import { useEffect, useState } from 'react'
import { useMissions, useActivityTracker } from '@/lib/hooks'

export default function MissionsPage() {
  const [mode, setMode] = useState<'list' | 'simulator'>('list')
  const { data, loading, error, refresh } = useMissions()
  const { track } = useActivityTracker()

  useEffect(() => {
    if (!loading && data) {
      track([{ action: 'view_list', resource: 'missions', metadata: { count: data.length } }])
    }
  }, [loading, data, track])

  if (mode === 'simulator') return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-50">
        <button onClick={() => setMode('list')} className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded shadow text-sm">← Back to Missions</button>
      </div>
      <MissionSimulator />
    </div>
  )

  return (
    <div className="p-6 md:p-10 text-white min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Missions</h1>
          <p className="text-sm text-gray-400 mt-1">Live mission catalog (auto-seeded)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">Refresh</button>
          <button onClick={() => setMode('simulator')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold">Open Simulator</button>
        </div>
      </div>
      {loading && <div className="text-gray-400">Loading missions...</div>}
      {error && <div className="text-red-400 mb-4">Error: {error}</div>}
      {!loading && !error && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {data && data.length === 0 && <div className="text-gray-500">No missions found.</div>}
          {data && data.map(m => {
            const progress = (m as any).completionPercentage ?? 0
            return (
              <div key={m._id} className="group bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-blue-500/60 transition-colors backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-lg leading-tight group-hover:text-blue-300 transition-colors">{m.title}</h2>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-1 bg-gray-800 rounded">{m.difficulty}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3 break-words">Code: {m.code}</p>
                <p className="text-sm text-gray-300 line-clamp-3 mb-4">{m.description || 'No description yet.'}</p>
                <div className="mb-3">
                  <div className="h-2 rounded bg-gray-700 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Progress</span><span>{progress.toFixed(0)}%</span>
                  </div>
                </div>
                {m.objectives?.length > 0 && (
                  <ul className="text-xs text-gray-400 space-y-1 mb-4 max-h-24 overflow-auto pr-1">
                    {m.objectives.slice(0,4).map((o,i)=>(<li key={i} className="flex gap-1"><span className="text-blue-500">•</span><span>{o}</span></li>))}
                    {m.objectives.length > 4 && <li className="italic">+{m.objectives.length - 4} more</li>}
                  </ul>
                )}
                <button onClick={() => track([{ action: 'view_detail', resource: 'mission', metadata: { code: m.code } }])} className="mt-auto text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded w-full font-medium">View Details</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
