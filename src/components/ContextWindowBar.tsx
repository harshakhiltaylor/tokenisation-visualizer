'use client'
import { ModelMeta } from '@/types'

interface Props {
  tokenCount: number
  model: ModelMeta
}

export default function ContextWindowBar({ tokenCount, model }: Props) {
  const pct = Math.min((tokenCount / model.maxContextWindow) * 100, 100)
  const used = tokenCount.toLocaleString()
  const max  = (model.maxContextWindow / 1000).toFixed(0) + 'k'

  let barColor = 'from-emerald-400 to-emerald-500'
  let textColor = 'text-emerald-600 dark:text-emerald-400'
  let label = 'Plenty of room'

  if (pct >= 90) {
    barColor = 'from-rose-500 to-red-600'
    textColor = 'text-rose-600 dark:text-rose-400'
    label = 'Context almost full!'
  } else if (pct >= 70) {
    barColor = 'from-amber-400 to-orange-500'
    textColor = 'text-amber-600 dark:text-amber-400'
    label = 'Context filling up'
  } else if (pct >= 40) {
    barColor = 'from-sky-400 to-blue-500'
    textColor = 'text-sky-600 dark:text-sky-400'
    label = 'Moderate usage'
  }

  return (
    <div className="animate-fade-in space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
            Context Window
          </span>
          <span className={`text-[10px] font-semibold ${textColor}`}>{label}</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {used} <span className="text-slate-300 dark:text-slate-600">/</span> {max} tokens
          <span className="ml-1.5 text-[10px] font-bold">{pct.toFixed(1)}%</span>
        </span>
      </div>

      <div className="relative h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${Math.max(pct, 0.5)}%` }}
        >
          <div className="absolute inset-0 progress-shimmer rounded-full" />
        </div>
      </div>

      <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-600 font-mono">
        <span>0</span>
        <span>{(model.maxContextWindow * 0.25 / 1000).toFixed(0)}k</span>
        <span>{(model.maxContextWindow * 0.5  / 1000).toFixed(0)}k</span>
        <span>{(model.maxContextWindow * 0.75 / 1000).toFixed(0)}k</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
