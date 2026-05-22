'use client'
import { useState, useCallback } from 'react'
import { Download, Share2, Check, Link } from 'lucide-react'
import { TokenizeResult } from '@/types'

interface Props {
  result: TokenizeResult
  text: string
}

export default function ExportShare({ result, text }: Props) {
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const exportJson = useCallback(() => {
    const payload = {
      model:  result.modelId,
      stats: {
        tokenCount:      result.tokenCount,
        charCount:       result.charCount,
        byteCount:       result.byteCount,
        avgTokenLength:  result.avgTokenLength,
        compressionRatio: result.compressionRatio,
        singleByteTokens: result.singleByteTokenCount,
        multiByteTokens:  result.multiByteTokenCount,
        rareTokens:       result.rareTokenCount,
      },
      tokens: result.tokens.map(t => ({
        text:  t.text,
        id:    t.id,
        bytes: t.bytes,
      })),
      ids: result.tokens.map(t => t.id),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `tokenization_${result.modelId}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  const share = useCallback(async () => {
    setShareError(null)
    try {
      const payload = JSON.stringify({ text, modelId: result.modelId })
      const encoded = btoa(unescape(encodeURIComponent(payload)))
      const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setShareError('Could not copy to clipboard')
    }
  }, [text, result.modelId])

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={exportJson}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border
          bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400
          border-slate-200 dark:border-slate-700
          hover:border-emerald-300 dark:hover:border-emerald-600
          hover:text-emerald-600 dark:hover:text-emerald-400
          transition-all duration-150"
        title="Export tokens, IDs, and stats as JSON"
      >
        <Download size={13} />
        Export JSON
      </button>

      <button
        onClick={share}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border
          transition-all duration-150
          ${copied
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400'
          }`}
        title="Copy shareable URL to clipboard"
      >
        {copied
          ? <><Check size={13} />Link copied!</>
          : <><Share2 size={13} />Share URL</>
        }
      </button>

      {shareError && (
        <span className="text-[11px] text-rose-500">{shareError}</span>
      )}
    </div>
  )
}
