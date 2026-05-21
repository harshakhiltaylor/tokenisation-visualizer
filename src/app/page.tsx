'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, GitCompare, ChevronDown } from 'lucide-react'
import { ModelId, TokenizeResult } from '@/types'
import { MODELS } from '@/lib/models'
import ThemeToggle from '@/components/ThemeToggle'
import ModelSelector from '@/components/ModelSelector'
import TokenDisplay from '@/components/TokenDisplay'
import TokenIDs from '@/components/TokenIDs'
import StatsBar from '@/components/StatsBar'
import ComparisonView from '@/components/ComparisonView'

const SAMPLES = [
  { label: 'English',    text: 'The quick brown fox jumps over the lazy dog.' },
  { label: 'Korean',     text: '만나서 반가워요. 저는 대규모 언어 모델입니다.' },
  { label: 'Python',     text: 'for i in range(1, 101):\n    if i % 3 == 0 and i % 5 == 0:\n        print("FizzBuzz")' },
  { label: 'Arithmetic', text: '127 + 677 = 804\n1275 + 6773 = 8041' },
  { label: 'Mixed case', text: 'Egg.\nI have an Egg.\negg.\nEGG.' },
  { label: 'Unicode',    text: 'Ｕｎｉｃｏｄｅ! 🅤🅝🅘🅒🅞🅓🅔‽ 😄 The very name strikes fear.' },
]

export default function HomePage() {
  const [text,           setText]           = useState('')
  const [modelId,        setModelId]        = useState<ModelId>('cl100k_base')
  const [showWhitespace, setShowWhitespace] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showInfo,       setShowInfo]       = useState(false)
  const [result,         setResult]         = useState<TokenizeResult | null>(null)
  const [loading,        setLoading]        = useState(false)
  const [firstLoad,      setFirstLoad]      = useState(true)
  const [error,          setError]          = useState<string | null>(null)

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevModelRef = useRef<ModelId>(modelId)

  const tokenize = useCallback(async (t: string, mid: ModelId, ws: boolean) => {
    if (!t.trim()) { setResult(null); setError(null); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t, modelId: mid, showWhitespace: ws }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Tokenization failed')
      }
      const data: TokenizeResult = await res.json()
      setResult(data)
      setFirstLoad(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    // If model changed, tokenize immediately; otherwise debounce typing
    const delay = prevModelRef.current !== modelId ? 0 : 220
    prevModelRef.current = modelId
    debounceRef.current = setTimeout(() => tokenize(text, modelId, showWhitespace), delay)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [text, modelId, showWhitespace, tokenize])

  const currentModel = MODELS[modelId]

  return (
    <div className="min-h-screen transition-colors duration-200"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b"
        style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg) 85%, transparent)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow select-none">
              <span className="text-white font-bold text-[15px] leading-none" style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.5px' }}>T</span>
            </div>
            <span className="font-bold text-[15px] tracking-tight">Tokenizer</span>
            <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-widest
              text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800
              border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
              Visualizer
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <ModelSelector value={modelId} onChange={setModelId} loading={loading} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7 space-y-5">

        {/* Model info banner */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl
            bg-indigo-50 dark:bg-indigo-950/30
            border border-indigo-200 dark:border-indigo-900
            text-indigo-700 dark:text-indigo-300
            hover:border-indigo-300 dark:hover:border-indigo-700
            transition-all duration-200"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 flex-shrink-0 text-indigo-500">
            <rect width="12" height="12" rx="3" fill="currentColor" opacity="0.2"/>
            <text x="6" y="9" font-family="system-ui" font-size="8" font-weight="700" fill="currentColor" text-anchor="middle">T</text>
          </svg>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold truncate">{currentModel.label}</span>
              <ChevronDown size={13} className={`flex-shrink-0 text-indigo-400 transition-transform duration-200 ${showInfo ? 'rotate-180' : ''}`} />
            </div>
            {showInfo && (
              <p className="text-xs mt-1.5 text-indigo-600 dark:text-indigo-400 leading-relaxed">
                {currentModel.description}
              </p>
            )}
          </div>
        </button>

        {/* Sample texts */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mr-1">
            Samples
          </span>
          {SAMPLES.map(s => (
            <button
              key={s.label}
              onClick={() => setText(s.text)}
              className="text-xs px-2.5 py-1 rounded-lg font-medium
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-500 dark:text-slate-400
                hover:border-indigo-300 dark:hover:border-indigo-600
                hover:text-indigo-600 dark:hover:text-indigo-400
                transition-all duration-150"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Two-column layout ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Left: Input */}
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border overflow-hidden shadow-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  Input Text
                </span>
                {text && (
                  <button
                    onClick={() => { setText(''); setResult(null) }}
                    className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste text here…"
                spellCheck={false}
                className="w-full h-56 p-4 text-sm font-mono resize-none bg-transparent
                  text-slate-800 dark:text-slate-100
                  placeholder-slate-300 dark:placeholder-slate-700
                  focus:outline-none leading-relaxed"
              />
            </div>

            {/* Toggle buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowWhitespace(!showWhitespace)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-all duration-150
                  ${showWhitespace
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
              >
                {showWhitespace ? <Eye size={13} /> : <EyeOff size={13} />}
                Show whitespace
              </button>

              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-all duration-150
                  ${showComparison
                    ? 'bg-violet-600 dark:bg-violet-500 text-white border-violet-600 dark:border-violet-500'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400'
                  }`}
              >
                <GitCompare size={13} />
                Compare models
              </button>
            </div>
          </div>

          {/* Right: Visualization */}
          <div className="flex flex-col gap-3">
            {/* Token count */}
            {result && !loading && (
              <div className="flex items-stretch gap-2 animate-fade-in">
                <div className="flex flex-col justify-between px-4 py-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-widest opacity-75 leading-none">tokens</span>
                  <span className="text-2xl font-bold font-mono leading-none mt-1">{result.tokenCount}</span>
                </div>
                <div className="flex flex-col justify-between px-3 py-2 rounded-xl border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 leading-none">chars</span>
                  <span className="text-xl font-bold font-mono text-slate-700 dark:text-slate-200 leading-none mt-1">{result.charCount}</span>
                </div>
                <div className="flex flex-col justify-between px-3 py-2 rounded-xl border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 leading-none">bytes</span>
                  <span className="text-xl font-bold font-mono text-slate-700 dark:text-slate-200 leading-none mt-1">{result.byteCount}</span>
                </div>
              </div>
            )}

            {/* Token visualization panel */}
            <div className="rounded-2xl border shadow-sm flex-1 overflow-hidden"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  Token Visualization
                </span>
                {result && (
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
                    hover for details
                  </span>
                )}
              </div>
              <div className="p-4 min-h-[13rem]">
                {error ? (
                  <div className="flex items-center justify-center min-h-[100px]">
                    <div className="text-xs text-rose-500 dark:text-rose-400 text-center px-4">
                      <p className="font-semibold mb-1">Failed to load vocab</p>
                      <p className="text-rose-400 dark:text-rose-500">{error}</p>
                      <p className="mt-2 text-slate-400">Check your internet connection and try again.</p>
                    </div>
                  </div>
                ) : (
                  <TokenDisplay
                    tokens={result?.tokens ?? []}
                    loading={loading}
                    firstLoad={firstLoad}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {result && !error && <StatsBar result={result} />}

        {/* Token IDs */}
        {result && !error && result.tokens.length > 0 && (
          <div className="rounded-2xl border shadow-sm p-4 animate-fade-in"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <TokenIDs tokens={result.tokens} />
          </div>
        )}

        {/* Comparison */}
        {showComparison && (
          <div className="rounded-2xl border shadow-sm p-4"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <ComparisonView text={text} showWhitespace={showWhitespace} />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-600 py-4
          border-t border-slate-100 dark:border-slate-800">
          Vocab files loaded from{' '}
          <a href="https://openaipublic.blob.core.windows.net" target="_blank" rel="noreferrer"
            className="underline underline-offset-2 hover:text-indigo-500 transition-colors">
            openaipublic.blob.core.windows.net
          </a>
          {' '}· Built with Next.js + TypeScript · Deployable on Vercel
        </div>
      </main>
    </div>
  )
}
