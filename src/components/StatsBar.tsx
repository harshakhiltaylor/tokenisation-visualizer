'use client'
import { TokenizeResult } from '@/types'
import { MODELS } from '@/lib/models'

interface Props { result: TokenizeResult }

function Card({ label, value, accent, sub }: { label: string; value: string | number; accent?: boolean; sub?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl
      bg-white dark:bg-slate-800/50
      border border-slate-200 dark:border-slate-700/80
      shadow-sm min-w-[88px] flex-1">
      <span className={`text-xl font-bold font-mono leading-tight
        ${accent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
        {value}
      </span>
      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 text-center leading-tight">
        {label}
      </span>
      {sub && (
        <span className="text-[9px] text-slate-300 dark:text-slate-600 mt-0.5">{sub}</span>
      )}
    </div>
  )
}

function RareCard({ rareCount, total }: { rareCount: number; total: number }) {
  const pct = total > 0 ? ((rareCount / total) * 100).toFixed(1) : '0'
  const hasRare = rareCount > 0
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl
      border shadow-sm min-w-[88px] flex-1 transition-colors
      ${hasRare
        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
        : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80'
      }`}>
      <span className={`text-xl font-bold font-mono leading-tight
        ${hasRare ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
        {rareCount}
      </span>
      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 text-center leading-tight">
        Rare tokens
      </span>
      {hasRare && (
        <span className="text-[9px] text-amber-400 dark:text-amber-600 mt-0.5">{pct}% of total</span>
      )}
    </div>
  )
}

export default function StatsBar({ result }: Props) {
  const model = MODELS[result.modelId]
  const singlePct = result.tokenCount > 0
    ? Math.round((result.singleByteTokenCount / result.tokenCount) * 100)
    : 0
  const multiPct  = 100 - singlePct

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Statistics
        </span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500
          bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
          px-2 py-0.5 rounded-full">
          {model?.label}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Card label="Tokens"        value={result.tokenCount}      accent />
        <Card label="Characters"    value={result.charCount} />
        <Card label="Bytes"         value={result.byteCount} />
        <Card label="Chars / token" value={result.avgTokenLength} />
        <Card label="Bytes / token" value={result.compressionRatio} />
        <Card
          label="Single-byte"
          value={`${singlePct}%`}
          sub={`${result.singleByteTokenCount} tokens`}
        />
        <Card
          label="Multi-byte"
          value={`${multiPct}%`}
          sub={`${result.multiByteTokenCount} tokens`}
        />
        <RareCard rareCount={result.rareTokenCount} total={result.tokenCount} />
      </div>
    </div>
  )
}
