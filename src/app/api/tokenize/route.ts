import { NextRequest, NextResponse } from 'next/server'
import { MODELS } from '@/lib/models'
import { loadVocab } from '@/lib/vocabLoader'
import { encodeWithVocab } from '@/lib/tiktokenEncoder'
import { Token, TokenizeRequest, TokenizeResult } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: TokenizeRequest = await req.json()
    const { text, modelId, showWhitespace } = body

    if (!text) {
      return NextResponse.json({
        tokens: [], tokenCount: 0, charCount: 0, byteCount: 0,
        compressionRatio: 0, avgTokenLength: 0, modelId, loadedFromCache: false,
      })
    }

    const meta = MODELS[modelId]
    if (!meta) {
      return NextResponse.json({ error: 'Unknown model' }, { status: 400 })
    }

    // Load vocab from CDN (cached in memory after first fetch)
    const vocab = await loadVocab(meta.vocabUrl)
    const loadedFromCache = true // after first load it's always cached

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

    const result: TokenizeResult = {
      tokens,
      tokenCount,
      charCount,
      byteCount,
      compressionRatio,
      avgTokenLength,
      modelId,
      loadedFromCache,
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('[tokenize]', err)
    const message = err instanceof Error ? err.message : 'Tokenization failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
