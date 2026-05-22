'use client'
import { LanguageSegment } from '@/types'

const SCRIPT_COLORS: Record<string, string> = {
  'Latin/ASCII':     'bg-sky-400',
  'CJK':             'bg-rose-400',
  'Korean':          'bg-violet-400',
  'Japanese':        'bg-pink-400',
  'Cyrillic':        'bg-amber-400',
  'Arabic':          'bg-emerald-400',
  'Devanagari':      'bg-orange-400',
  'Emoji':           'bg-yellow-400',
  'Other Unicode':   'bg-teal-400',
}

function getScriptColor(script: string): string {
  return SCRIPT_COLORS[script] ?? 'bg-slate-400'
}

interface Props {
  breakdown: LanguageSegment[]
}

export default function LanguageBreakdown({ breakdown }: Props) {
  if (!breakdown || breakdown.length === 0) return null
  // Only show if there's more than just Latin
  const interesting = breakdown.length > 1 || (breakdown[0]?.script !== 'Latin/ASCII')
  if (!interesting) return null

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        Language / Script Breakdown
      </span>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {breakdown.map(seg => (
          <div
            key={seg.script}
            className={`h-full ${getScriptColor(seg.script)} transition-all duration-500`}
            style={{ width: `${seg.percent}%` }}
            title={`${seg.script}: ${seg.percent}% (${seg.tokenCount} tokens)`}
          />
        ))}
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-1.5">
        {breakdown.map(seg => (
          <div
            key={seg.script}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg
              bg-white dark:bg-slate-800/60
              border border-slate-200 dark:border-slate-700
              text-[10px] text-slate-600 dark:text-slate-300"
          >
            <span className={`w-2 h-2 rounded-full ${getScriptColor(seg.script)}`} />
            <span className="font-medium">{seg.script}</span>
            <span className="font-mono text-slate-400 dark:text-slate-500">
              {seg.percent}% · {seg.tokenCount}t
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
