'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Eye, EyeOff, GitCompare, ChevronDown,
  Flame, Zap, AlignJustify, Link2, Loader2,
} from 'lucide-react'
import { ModelId, TokenizeResult } from '@/types'
import { MODELS } from '@/lib/models'
import ThemeToggle from '@/components/ThemeToggle'
import ModelSelector from '@/components/ModelSelector'
import TokenDisplay from '@/components/TokenDisplay'
import TokenIDs from '@/components/TokenIDs'
import StatsBar from '@/components/StatsBar'
import ComparisonView from '@/components/ComparisonView'
import ContextWindowBar from '@/components/ContextWindowBar'
import VocabCoverageBar from '@/components/VocabCoverageBar'
import LanguageBreakdown from '@/components/LanguageBreakdown'
import FileUpload from '@/components/FileUpload'
import HistoryPanel, { saveToHistory } from '@/components/HistoryPanel'
import ExportShare from '@/components/ExportShare'

const SAMPLES = [
  { label: 'English',    text: 'The quick brown fox jumps over the lazy dog.' },
  { label: 'Korean',     text: '만나서 반가워요. 저는 대규모 언어 모델입니다.' },
  { label: 'Python',     text: 'for i in range(1, 101):\n    if i % 3 == 0 and i % 5 == 0:\n        print("FizzBuzz")' },
  { label: 'Arithmetic', text: '127 + 677 = 804\n1275 + 6773 = 8041' },
  { label: 'Mixed case', text: 'Egg.\nI have an Egg.\negg.\nEGG.' },
  { label: 'Unicode',    text: 'Ｕｎｉｃｏｄｅ! 🅤🅝🅘🅒🅞🅓🅔‽ 😄 The very name strikes fear.' },
]

export default function HomePage() {
  const [text,            setText]           = useState('')
  const [modelId,         setModelId]        = useState<ModelId>('cl100k_base')
  const [showWhitespace,  setShowWhitespace] = useState(false)
  const [showComparison,  setShowComparison] = useState(false)
  const [showInfo,        setShowInfo]       = useState(false)
  const [result,          setResult]         = useState<TokenizeResult | null>(null)
  const [loading,         setLoading]        = useState(false)
  const [firstLoad,       setFirstLoad]      = useState(true)
  const [error,           setError]          = useState<string | null>(null)

  // New feature states
  const [heatmap,         setHeatmap]        = useState(false)
  const [animate,         setAnimate]        = useState(false)
  const [showBoundary,    setShowBoundary]   = useState(false)
  const [animKey,         setAnimKey]        = useState(0)
  const [selectedIndex,   setSelectedIndex]  = useState<number | null>(null)
  const [urlInput,        setUrlInput]       = useState('')
  const [urlLoading,      setUrlLoading]     = useState(false)
  const [urlError,        setUrlError]       = useState<string | null>(null)

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevModelRef = useRef<ModelId>(modelId)

  // ── Tokenize ───────────────────────────────────────────────
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
      if (animate) setAnimKey(k => k + 1)
      setSelectedIndex(null)
      // Save to history
      saveToHistory({
        text: t,
        modelId: mid,
        tokenCount: data.tokenCount,
        timestamp: Date.now(),
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [animate])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const delay = prevModelRef.current !== modelId ? 0 : 220
    prevModelRef.current = modelId
    debounceRef.current = setTimeout(() => tokenize(text, modelId, showWhitespace), delay)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [text, modelId, showWhitespace, tokenize])

  // ── Load from share URL ────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const share = params.get('share')
    if (!share) return
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(share))))
      if (decoded.text)    setText(decoded.text)
      if (decoded.modelId) setModelId(decoded.modelId as ModelId)
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    } catch { /* ignore bad share links */ }
  }, [])

  // ── URL Fetch ──────────────────────────────────────────────
  const fetchUrl = useCallback(async () => {
    if (!urlInput.trim()) return
    setUrlLoading(true)
    setUrlError(null)
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fetch failed')
      setText(data.text)
      setUrlInput('')
    } catch (e: unknown) {
      setUrlError(e instanceof Error ? e.message : 'Could not fetch URL')
    } finally {
      setUrlLoading(false)
    }
  }, [urlInput])

  // ── History restore ────────────────────────────────────────
  const handleHistorySelect = useCallback((t: string, mid: ModelId) => {
    setText(t)
    setModelId(mid)
  }, [])

  // ── Token / ID click sync ──────────────────────────────────
  const handleTokenClick = useCallback((i: number) => {
    setSelectedIndex(prev => prev === i ? null : i)
  }, [])

  const currentModel = MODELS[modelId]

  // Heatmap legend items
  const heatLegend = [
    { cls: 'heat-1', label: '1 byte' },
    { cls: 'heat-2', label: '2 bytes' },
    { cls: 'heat-3', label: '3 bytes' },
    { cls: 'heat-4', label: '4+ bytes' },
  ]

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
                {' '}Vocab size: <strong>{currentModel.vocabSize.toLocaleString()}</strong> tokens.
                Context window: <strong>{(currentModel.maxContextWindow / 1000).toFixed(0)}k</strong> tokens.
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

        {/* ── Two-column layout ─────────────────────────────── */}
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
                className="w-full h-48 p-4 text-sm font-mono resize-none bg-transparent
                  text-slate-800 dark:text-slate-100
                  placeholder-slate-300 dark:placeholder-slate-700
                  focus:outline-none leading-relaxed"
              />
            </div>

            {/* File upload */}
            <FileUpload onText={setText} />

            {/* URL fetch */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 rounded-xl border text-xs
                bg-white dark:bg-slate-800
                border-slate-200 dark:border-slate-700 focus-within:border-indigo-400 dark:focus-within:border-indigo-500
                transition-colors">
                <Link2 size={13} className="text-slate-400 flex-shrink-0" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchUrl()}
                  placeholder="Paste a URL to tokenize…"
                  className="flex-1 py-2 bg-transparent text-slate-700 dark:text-slate-200
                    placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none font-mono text-xs"
                />
              </div>
              <button
                onClick={fetchUrl}
                disabled={urlLoading || !urlInput.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                  bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700
                  text-white disabled:text-slate-500 transition-colors"
              >
                {urlLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                Fetch
              </button>
            </div>
            {urlError && (
              <p className="text-[11px] text-rose-500 dark:text-rose-400 px-1">{urlError}</p>
            )}

            {/* Toggle buttons row */}
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
                Whitespace
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
                Compare
              </button>

              {/* Heatmap */}
              <button
                onClick={() => setHeatmap(!heatmap)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-all duration-150
                  ${heatmap
                    ? 'bg-rose-600 dark:bg-rose-500 text-white border-rose-600'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-600 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                title="Color tokens by byte size"
              >
                <Flame size={13} />
                Heatmap
              </button>

              {/* Animate */}
              <button
                onClick={() => {
                  setAnimate(!animate)
                  if (!animate) setAnimKey(k => k + 1)
                }}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-all duration-150
                  ${animate
                    ? 'bg-amber-500 dark:bg-amber-400 text-white border-amber-500'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 hover:text-amber-600 dark:hover:text-amber-400'
                  }`}
                title="Animate tokens appearing one by one"
              >
                <Zap size={13} />
                Stream
              </button>

              {/* Boundary markers */}
              <button
                onClick={() => setShowBoundary(!showBoundary)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-all duration-150
                  ${showBoundary
                    ? 'bg-teal-600 dark:bg-teal-500 text-white border-teal-600'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400'
                  }`}
                title="Show boundary markers between tokens"
              >
                <AlignJustify size={13} />
                Boundaries
              </button>
            </div>

            {/* Heatmap legend */}
            {heatmap && (
              <div className="flex items-center gap-2 flex-wrap animate-fade-in">
                <span className="text-[10px] text-slate-400 dark:text-slate-600">Heat legend:</span>
                {heatLegend.map(h => (
                  <span key={h.cls} className={`text-[10px] font-mono px-2 py-0.5 rounded token-chip ${h.cls}`}>
                    {h.label}
                  </span>
                ))}
              </div>
            )}

            {/* History */}
            <HistoryPanel currentModelId={modelId} onSelect={handleHistorySelect} />
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
                {/* Selected token info */}
                {selectedIndex !== null && result.tokens[selectedIndex] && (
                  <div className="flex flex-col justify-between px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 animate-fade-in"
                    style={{ background: 'var(--surface)' }}>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 leading-none">selected</span>
                    <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 leading-none mt-1">
                      #{selectedIndex + 1} · ID {result.tokens[selectedIndex].id}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Context window bar */}
            {result && !loading && (
              <div className="rounded-xl border px-4 py-3 animate-fade-in"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <ContextWindowBar tokenCount={result.tokenCount} model={currentModel} />
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
                <div className="flex items-center gap-2">
                  {result && result.longestTokenIndex >= 0 && (
                    <span className="text-[10px] text-amber-500 dark:text-amber-400">
                      🏆 longest: {result.tokens[result.longestTokenIndex]?.bytes.length}B
                    </span>
                  )}
                  {result && (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
                      {selectedIndex !== null ? `#${selectedIndex + 1} selected` : 'click to select'}
                    </span>
                  )}
                </div>
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
                    heatmap={heatmap}
                    animate={animate}
                    showBoundary={showBoundary}
                    longestTokenIndex={result?.longestTokenIndex ?? -1}
                    selectedIndex={selectedIndex}
                    onTokenClick={handleTokenClick}
                    animationKey={animKey}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {result && !error && <StatsBar result={result} />}

        {/* Vocab coverage + Language breakdown */}
        {result && !error && result.tokenCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div className="rounded-2xl border shadow-sm p-4"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <VocabCoverageBar result={result} />
            </div>
            {result.languageBreakdown.length > 1 && (
              <div className="rounded-2xl border shadow-sm p-4"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <LanguageBreakdown breakdown={result.languageBreakdown} />
              </div>
            )}
          </div>
        )}

        {/* Token IDs */}
        {result && !error && result.tokens.length > 0 && (
          <div className="rounded-2xl border shadow-sm p-4 animate-fade-in"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <TokenIDs
              tokens={result.tokens}
              selectedIndex={selectedIndex}
              onIdClick={handleTokenClick}
            />
          </div>
        )}

        {/* Export / Share */}
        {result && !error && result.tokens.length > 0 && (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              Export &amp; Share
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <ExportShare result={result} text={text} />
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
        <div className="py-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600">
            Vocab files loaded from{' '}
            <a href="https://openaipublic.blob.core.windows.net" target="_blank" rel="noreferrer"
              className="underline underline-offset-2 hover:text-indigo-500 transition-colors">
              openaipublic.blob.core.windows.net
            </a>
            {' '}· Built with Next.js + TypeScript · Deployable on Vercel
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Made by</span>
            <a
              href="https://github.com/harshakhiltaylor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300
                hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              {/* GitHub icon */}
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483
                  0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462
                  -.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832
                  .092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688
                  -.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0
                  0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595
                  1.028 2.688 0 3.848-2.338 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012
                  2.743 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
              </svg>
              harshakhiltaylor
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
