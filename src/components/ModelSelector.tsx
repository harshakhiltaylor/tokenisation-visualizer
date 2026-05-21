'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, CheckCircle2, Cpu } from 'lucide-react'
import { ModelId } from '@/types'
import { MODELS, MODEL_LIST } from '@/lib/models'

interface Props {
  value: ModelId
  onChange: (v: ModelId) => void
  loading: boolean
}

export default function ModelSelector({ value, onChange, loading }: Props) {
  const [open, setOpen] = useState(false)
  const ref  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = MODELS[value]

  return (
    <div ref={ref} className="relative min-w-[220px]">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="
          w-full flex items-center justify-between gap-2
          px-3 py-2 rounded-xl text-sm font-medium
          bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          text-slate-700 dark:text-slate-200
          hover:border-indigo-400 dark:hover:border-indigo-500
          shadow-sm transition-all duration-150
        "
      >
        <div className="flex items-center gap-2 min-w-0">
          <Cpu size={14} className="text-indigo-500 flex-shrink-0" />
          <span className="truncate font-mono text-xs">{current.label}</span>
          {loading && (
            <span className="flex gap-0.5 ml-1">
              <span className="w-1 h-1 rounded-full bg-indigo-400 dot-1" />
              <span className="w-1 h-1 rounded-full bg-indigo-400 dot-2" />
              <span className="w-1 h-1 rounded-full bg-indigo-400 dot-3" />
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="
          absolute top-full left-0 right-0 mt-1.5 z-50
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          rounded-xl shadow-2xl overflow-hidden
          animate-fade-in
        ">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Popular Models
            </span>
          </div>
          {MODEL_LIST.map(id => {
            const m = MODELS[id]
            const isActive = id === value
            return (
              <button
                key={id}
                onClick={() => { onChange(id); setOpen(false) }}
                className={`
                  w-full text-left px-3 py-2.5 flex items-start gap-2.5
                  transition-colors duration-100 group
                  ${isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }
                `}
              >
                <CheckCircle2
                  size={14}
                  className={`mt-0.5 flex-shrink-0 transition-colors ${isActive ? 'text-indigo-500' : 'text-transparent'}`}
                />
                <div>
                  <div className={`font-mono text-xs font-semibold leading-tight
                    ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {m.label}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5 line-clamp-2">
                    {m.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
