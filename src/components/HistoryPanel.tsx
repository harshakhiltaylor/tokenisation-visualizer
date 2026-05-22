'use client'
import { useEffect, useState, useCallback } from 'react'
import { Clock, X, ChevronDown, ChevronUp } from 'lucide-react'
import { ModelId } from '@/types'

const HISTORY_KEY = 'tokenizer-history-v1'
const MAX_HISTORY = 10

export interface HistoryEntry {
  text: string
  modelId: ModelId
  tokenCount: number
  timestamp: number
}

export function saveToHistory(entry: HistoryEntry) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const existing: HistoryEntry[] = raw ? JSON.parse(raw) : []
    // Remove duplicates (same text + model)
    const filtered = existing.filter(e => !(e.text === entry.text && e.modelId === entry.modelId))
    const updated = [entry, ...filtered].slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

interface Props {
  currentModelId: ModelId
  onSelect: (text: string, modelId: ModelId) => void
}

export default function HistoryPanel({ currentModelId, onSelect }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [open, setOpen] = useState(false)

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    load()
  }, [load, open])

  const remove = useCallback((ts: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      const existing: HistoryEntry[] = raw ? JSON.parse(raw) : []
      const updated = existing.filter(e => e.timestamp !== ts)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      setHistory(updated)
    } catch { /* ignore */ }
  }, [])

  const clearAll = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }, [])

  if (history.length === 0 && !open) return null

  const fmt = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' +
           d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => { setOpen(!open); load() }}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest
          text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400
          transition-colors"
      >
        <Clock size={11} />
        History ({history.length})
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-800/50 overflow-hidden animate-fade-in">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No history yet</p>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b
                border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Last {history.length} inputs
                </span>
                <button
                  onClick={clearAll}
                  className="text-[10px] text-rose-400 hover:text-rose-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-60 overflow-y-auto">
                {history.map(entry => (
                  <button
                    key={entry.timestamp}
                    onClick={() => { onSelect(entry.text, entry.modelId); setOpen(false) }}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/40
                      transition-colors group flex items-start justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-mono
                        truncate leading-tight">
                        {entry.text.replace(/\n/g, ' ').slice(0, 80)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {entry.modelId}
                        </span>
                        <span className="text-[10px] text-indigo-500 font-mono font-semibold">
                          {entry.tokenCount} tokens
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">
                          {fmt(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={e => remove(entry.timestamp, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity
                        text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400
                        flex-shrink-0 mt-0.5"
                    >
                      <X size={12} />
                    </button>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
