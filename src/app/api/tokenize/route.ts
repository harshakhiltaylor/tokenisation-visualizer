import { NextRequest, NextResponse } from 'next/server'
import { MODELS } from '@/lib/models'
import { loadVocab } from '@/lib/vocabLoader'
import { encodeWithVocab } from '@/lib/tiktokenEncoder'
import { Token, TokenizeRequest, TokenizeResult, LanguageSegment } from '@/types'

// Detect language/script for a string of text
function detectLanguageBreakdown(tokens: Token[]): LanguageSegment[] {
  const counts: Record<string, number> = {}

  for (const token of tokens) {
    const text = token.text.replace(/[·↵→]/g, ' ')
    let dominant = 'Latin/ASCII'

    for (const char of text) {
      const cp = char.codePointAt(0) ?? 0
      if (cp > 127) {
        if (cp >= 0x4E00 && cp <= 0x9FFF) { dominant = 'CJK'; break }
        if (cp >= 0xAC00 && cp <= 0xD7AF) { dominant = 'Korean'; break }
        if (cp >= 0x3040 && cp <= 0x30FF) { dominant = 'Japanese'; break }
        if (cp >= 0x0400 && cp <= 0x04FF) { dominant = 'Cyrillic'; break }
        if (cp >= 0x0600 && cp <= 0x06FF) { dominant = 'Arabic'; break }
        if (cp >= 0x0900 && cp <= 0x097F) { dominant = 'Devanagari'; break }
        if (cp >= 0x1F300 && cp <= 0x1FAFF) { dominant = 'Emoji'; break }
        if (cp > 127) { dominant = 'Other Unicode'; break }
      }
    }

    counts[dominant] = (counts[dominant] ?? 0) + 1
  }

  const total = tokens.length || 1
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([script, tokenCount]) => ({
      script,
      tokenCount,
      percent: Math.round((tokenCount / total) * 100),
    }))
}

export async function POST(req: NextRequest) {
  try {
    const body: TokenizeRequest = await req.json()
    const { text, modelId, showWhitespace } = body

    if (!text) {
      return NextResponse.json({
        tokens: [], tokenCount: 0, charCount: 0, byteCount: 0,
        compressionRatio: 0, avgTokenLength: 0, modelId, loadedFromCache: false,
        singleByteTokenCount: 0, multiByteTokenCount: 0, rareTokenCount: 0,
        longestTokenIndex: -1, languageBreakdown: [],
      })
    }

    const meta = MODELS[modelId]
    if (!meta) {
      return NextResponse.json({ error: 'Unknown model' }, { status: 400 })
    }

    // Load vocab from CDN (cached in memory after first fetch)
    const vocab = await loadVocab(meta.vocabUrl)

    // Encode
    const rawTokens = encodeWithVocab(text, vocab, meta.patternType)

    const decoder = new TextDecoder('utf-8', { fatal: false })
    const encoder = new TextEncoder()
    const byteCount = encoder.encode(text).length

    const tokens: Token[] = rawTokens.map((t, i) => {
      const raw = decoder.decode(new Uint8Array(t.bytes))
      let display = raw
      if (showWhitespace) {
        display = display
          .replace(/ /g, '·')
          .replace(/\n/g, '↵\n')
          .replace(/\t/g, '→')
      }
      return {
        text: display,
        id: t.tokenId,
        bytes: t.bytes,
        colorIndex: i % 20,
      }
    })

    const tokenCount = tokens.length
    const charCount  = text.length
    const avgTokenLength  = tokenCount > 0 ? parseFloat((charCount / tokenCount).toFixed(2)) : 0
    const compressionRatio = tokenCount > 0 ? parseFloat((byteCount / tokenCount).toFixed(2)) : 0

    // New stats
    const singleByteTokenCount = tokens.filter(t => t.bytes.length === 1).length
    const multiByteTokenCount  = tokens.filter(t => t.bytes.length > 1).length
    // Rare = tokens with 4+ bytes (likely multi-byte Unicode or unusual tokens)
    const rareTokenCount = tokens.filter(t => t.bytes.length >= 4).length

    // Longest token by byte count
    let longestTokenIndex = 0
    let maxBytes = 0
    tokens.forEach((t, i) => {
      if (t.bytes.length > maxBytes) { maxBytes = t.bytes.length; longestTokenIndex = i }
    })
    if (tokenCount === 0) longestTokenIndex = -1

    const languageBreakdown = detectLanguageBreakdown(tokens)

    const result: TokenizeResult = {
      tokens,
      tokenCount,
      charCount,
      byteCount,
      compressionRatio,
      avgTokenLength,
      modelId,
      loadedFromCache: true,
      singleByteTokenCount,
      multiByteTokenCount,
      rareTokenCount,
      longestTokenIndex,
      languageBreakdown,
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('[tokenize]', err)
    const message = err instanceof Error ? err.message : 'Tokenization failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
