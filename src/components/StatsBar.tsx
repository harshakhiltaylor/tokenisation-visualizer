'use client'
import { TokenizeResult } from '@/types'
import { MODELS } from '@/lib/models'

interface Props { result: TokenizeResult }

function Card({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
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
    </div>
  )
}

export default function StatsBar({ result }: Props) {
  const model = MODELS[result.modelId]
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
      </div>
    </div>
  )
}
