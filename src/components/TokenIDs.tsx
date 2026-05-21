'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Token } from '@/types'
import { getColorClass } from '@/lib/colors'

interface Props { tokens: Token[] }

export default function TokenIDs({ tokens }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const ids = tokens.map(t => t.id).join(', ')
    await navigator.clipboard.writeText(`[${ids}]`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (tokens.length === 0) return null

  return (
    <div className="animate-fade-in space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Token IDs
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg
            bg-slate-100 dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            text-slate-500 dark:text-slate-400
            hover:border-indigo-300 dark:hover:border-indigo-600
            hover:text-indigo-600 dark:hover:text-indigo-400
            transition-all duration-150"
        >
          {copied
            ? <><Check size={11} className="text-emerald-500" />Copied!</>
            : <><Copy size={11} />Copy IDs</>
          }
        </button>
      </div>

      <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto
        p-3 rounded-xl
        bg-white dark:bg-slate-800/40
        border border-slate-200 dark:border-slate-700">
        {tokens.map((t, i) => (
          <span
            key={i}
            title={`"${t.text.replace(/·/g,' ')}"`}
            className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded cursor-default
              ${getColorClass(t.colorIndex)}`}
          >
            {t.id}
          </span>
        ))}
      </div>
    </div>
  )
}
