'use client'
import { TokenizeResult } from '@/types'

interface Props {
  result: TokenizeResult
}

export default function VocabCoverageBar({ result }: Props) {
  const total = result.tokenCount || 1
  const singlePct = (result.singleByteTokenCount / total) * 100
  const multiPct  = (result.multiByteTokenCount  / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Byte Coverage
        </span>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-emerald-400" />
            Single-byte ({singlePct.toFixed(0)}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-violet-500" />
            Multi-byte ({multiPct.toFixed(0)}%)
          </span>
        </div>
      </div>

      <div className="relative h-4 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
        {singlePct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${singlePct}%` }}
            title={`${result.singleByteTokenCount} single-byte tokens`}
          />
        )}
        {multiPct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
            style={{ width: `${multiPct}%` }}
            title={`${result.multiByteTokenCount} multi-byte tokens`}
          />
        )}
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slate-600 leading-relaxed">
        <span className="font-semibold text-slate-500 dark:text-slate-400">Single-byte</span> tokens are ASCII chars — cheap &amp; efficient.{' '}
        <span className="font-semibold text-slate-500 dark:text-slate-400">Multi-byte</span> tokens carry Unicode / multilingual content.
      </p>
    </div>
  )
}
