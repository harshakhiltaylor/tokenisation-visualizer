'use client'
import { useEffect, useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Token } from '@/types'
import { getColorClass } from '@/lib/colors'

interface Props {
  tokens: Token[]
  selectedIndex?: number | null
  onIdClick?: (index: number) => void
}

export default function TokenIDs({ tokens, selectedIndex = null, onIdClick }: Props) {
  const [copied, setCopied] = useState(false)
  const selectedRef = useRef<HTMLButtonElement | null>(null)

  const copy = async () => {
    const ids = tokens.map(t => t.id).join(', ')
    await navigator.clipboard.writeText(`[${ids}]`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Scroll highlighted ID into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

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
        {tokens.map((t, i) => {
          const isSelected = selectedIndex === i
          return (
            <button
              key={i}
              ref={isSelected ? selectedRef : undefined}
              onClick={() => onIdClick?.(i)}
              title={`"${t.text.replace(/·/g,' ')}" → ID ${t.id}`}
              className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded cursor-pointer
                transition-all duration-100
                ${getColorClass(t.colorIndex)}
                ${isSelected
                  ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-800 scale-110 z-10'
                  : 'hover:scale-105 hover:z-10'
                }`}
            >
              {t.id}
            </button>
          )
        })}
      </div>
    </div>
  )
}
