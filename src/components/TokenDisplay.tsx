'use client'
import { useState, useCallback } from 'react'
import { Token } from '@/types'
import { getColorClass } from '@/lib/colors'

interface TooltipState { token: Token; x: number; y: number }

function Tooltip({ token, x, y }: TooltipState) {
  const hex = token.bytes.map(b => b.toString(16).padStart(2, '0')).join(' ')
  return (
    <div
      className="fixed z-50 pointer-events-none animate-fade-in"
      style={{ left: x + 14, top: y - 12 }}
    >
      <div className="
        bg-slate-950 dark:bg-slate-950 text-white
        rounded-xl shadow-2xl border border-slate-700/80
        p-3 min-w-[160px] max-w-[240px]
      ">
        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">
          Token Info
        </div>

        <div className="space-y-1.5">
          <Row label="ID"    value={String(token.id)}           color="text-indigo-300" mono />
          <Row label="Bytes" value={String(token.bytes.length)} color="text-emerald-300" mono />
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800">
          <div className="text-[9px] text-slate-500 mb-1">Hex bytes</div>
          <div className="font-mono text-[10px] text-amber-300 break-all leading-relaxed">{hex}</div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800">
          <div className="text-[9px] text-slate-500 mb-1">Decimal bytes</div>
          <div className="font-mono text-[10px] text-sky-300 break-all leading-relaxed">
            [{token.bytes.join(', ')}]
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, color, mono }: { label: string; value: string; color: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className={`text-xs font-semibold ${color} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

interface Props {
  tokens: Token[]
  loading: boolean
  firstLoad: boolean
}

export default function TokenDisplay({ tokens, loading, firstLoad }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const onMove = useCallback((e: React.MouseEvent, token: Token) => {
    setTooltip({ token, x: e.clientX, y: e.clientY })
  }, [])

  if (loading) {
    return (
      <div className="min-h-[140px] flex flex-col items-center justify-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 dot-1" />
          <span className="w-2 h-2 rounded-full bg-indigo-400 dot-2" />
          <span className="w-2 h-2 rounded-full bg-indigo-400 dot-3" />
        </div>
        {firstLoad && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-[220px] leading-relaxed">
            Loading vocab from CDN…<br/>
            <span className="text-slate-300 dark:text-slate-600">This only happens once.</span>
          </p>
        )}
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="min-h-[140px] flex items-center justify-center">
        <p className="text-sm text-slate-300 dark:text-slate-600 text-center">
          Start typing to see tokens appear here…
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="font-mono text-sm leading-loose break-all whitespace-pre-wrap select-text">
        {tokens.map((token, i) => (
          <span
            key={i}
            className={`token-chip ${getColorClass(token.colorIndex)}`}
            onMouseMove={e => onMove(e, token)}
            onMouseLeave={() => setTooltip(null)}
          >
            {token.text}
          </span>
        ))}
      </div>
      {tooltip && <Tooltip {...tooltip} />}
    </div>
  )
}
