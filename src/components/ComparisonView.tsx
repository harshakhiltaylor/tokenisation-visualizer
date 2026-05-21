'use client'
import { useEffect, useState } from 'react'
import { ModelId, TokenizeResult } from '@/types'
import { MODELS, MODEL_LIST } from '@/lib/models'
import { getColorClass } from '@/lib/colors'
import { ChevronDown } from 'lucide-react'

interface PanelProps {
  modelId: ModelId
  setModelId: (id: ModelId) => void
  result: TokenizeResult | null
  loading: boolean
  exclude: ModelId
}

function Panel({ modelId, setModelId, result, loading, exclude }: PanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex-1 min-w-0 space-y-2">
      {/* Model picker */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            text-xs font-mono font-semibold text-slate-700 dark:text-slate-200
            hover:border-indigo-400 dark:hover:border-indigo-500
            transition-all duration-150 shadow-sm"
        >
          <span className="truncate">{MODELS[modelId].label}</span>
          <ChevronDown size={13} className={`flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 z-40
            bg-white dark:bg-slate-900
            border border-slate-200 dark:border-slate-700
            rounded-xl shadow-2xl overflow-hidden animate-fade-in">
            {MODEL_LIST.filter(id => id !== exclude).map(id => (
              <button
                key={id}
                onClick={() => { setModelId(id); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors
                  ${id === modelId
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {MODELS[id].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Token display */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-800/40 p-3 min-h-[100px]">
        {loading && (
          <div className="flex gap-1.5 justify-center py-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dot-1" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dot-2" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dot-3" />
          </div>
        )}
        {!loading && result && (
          <>
            <div className="font-mono text-xs leading-loose break-all whitespace-pre-wrap mb-2">
              {result.tokens.map((t, i) => (
                <span key={i} className={`token-chip ${getColorClass(t.colorIndex)}`}>
                  {t.text}
                </span>
              ))}
            </div>
            <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{result.tokenCount}</span> tokens
              </span>
              <span className="text-[11px] text-slate-500">
                <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{result.avgTokenLength}</span> chars/token
              </span>
              <span className="text-[11px] text-slate-500">
                <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{result.compressionRatio}</span> bytes/token
              </span>
            </div>
          </>
        )}
        {!loading && !result && (
          <p className="text-xs text-slate-400 text-center py-6">Enter text above to compare</p>
        )}
      </div>
    </div>
  )
}

async function fetchTokenize(text: string, modelId: ModelId, showWhitespace: boolean): Promise<TokenizeResult | null> {
  if (!text.trim()) return null
  const res = await fetch('/api/tokenize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, modelId, showWhitespace }),
  })
  if (!res.ok) return null
  return res.json()
}

interface Props {
  text: string
  showWhitespace: boolean
}

export default function ComparisonView({ text, showWhitespace }: Props) {
  const [leftModel, setLeftModel]   = useState<ModelId>('cl100k_base')
  const [rightModel, setRightModel] = useState<ModelId>('o200k_base')
  const [leftResult,  setLeftResult]  = useState<TokenizeResult | null>(null)
  const [rightResult, setRightResult] = useState<TokenizeResult | null>(null)
  const [leftLoading,  setLeftLoading]  = useState(false)
  const [rightLoading, setRightLoading] = useState(false)

  useEffect(() => {
    setLeftLoading(true)
    fetchTokenize(text, leftModel, showWhitespace).then(r => {
      setLeftResult(r)
      setLeftLoading(false)
    })
  }, [text, leftModel, showWhitespace])

  useEffect(() => {
    setRightLoading(true)
    fetchTokenize(text, rightModel, showWhitespace).then(r => {
      setRightResult(r)
      setRightLoading(false)
    })
  }, [text, rightModel, showWhitespace])

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Side-by-side Comparison
        </span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="flex gap-3">
        <Panel
          modelId={leftModel}
          setModelId={setLeftModel}
          result={leftResult}
          loading={leftLoading}
          exclude={rightModel}
        />
        <div className="w-px bg-slate-200 dark:bg-slate-800 self-stretch" />
        <Panel
          modelId={rightModel}
          setModelId={setRightModel}
          result={rightResult}
          loading={rightLoading}
          exclude={leftModel}
        />
      </div>
    </div>
  )
}
