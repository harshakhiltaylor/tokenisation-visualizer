/**
 * Tiktoken BPE encoder.
 *
 * This is a TypeScript port of the core BPE algorithm used by tiktoken.
 * It uses the real vocab loaded from OpenAI's CDN.
 *
 * The key insight: the .tiktoken file encodes the merge priority implicitly —
 * the token ID IS the merge rank. Lower ID = higher priority merge.
 * So we just need to find the pair whose merged token has the lowest ID.
 */

import { TiktokenVocab } from './vocabLoader'

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64')
}

// Merge two byte arrays
function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length + b.length)
  result.set(a, 0)
  result.set(b, a.length)
  return result
}

// Core BPE: given a list of byte-chunk segments, repeatedly merge lowest-rank pair
function bpeMerge(
  parts: Uint8Array[],
  vocab: TiktokenVocab
): number[] {
  if (parts.length === 0) return []
  if (parts.length === 1) {
    const b64 = bytesToBase64(parts[0])
    return [vocab.tokenToId.get(b64) ?? 0]
  }

  // Iteratively merge until no more merges possible
  let current = parts.slice()

  while (current.length >= 2) {
    let bestRank = Infinity
    let bestIdx  = -1

    for (let i = 0; i < current.length - 1; i++) {
      const merged = concat(current[i], current[i + 1])
      const b64    = bytesToBase64(merged)
      const rank   = vocab.tokenToId.get(b64)
      if (rank !== undefined && rank < bestRank) {
        bestRank = rank
        bestIdx  = i
      }
    }

    if (bestIdx === -1) break // no more merges available

    const merged = concat(current[bestIdx], current[bestIdx + 1])
    current = [
      ...current.slice(0, bestIdx),
      merged,
      ...current.slice(bestIdx + 2),
    ]
  }

  // Convert final segments to token IDs
  return current.map(seg => {
    const b64 = bytesToBase64(seg)
    return vocab.tokenToId.get(b64) ?? 0
  })
}

/**
 * cl100k / o200k regex pattern — splits text into pre-tokenization chunks.
 * JavaScript does not support inline (?i:...) flags, so we list contractions
 * in both cases and apply the /i flag to the whole pattern instead.
 */
const CL100K_PATTERN = /'s|'t|'re|'ve|'m|'ll|'d|'S|'T|'RE|'VE|'M|'LL|'D|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+/giu

/**
 * p50k / codellama pattern
 */
const P50K_PATTERN = /'s|'t|'re|'ve|'m|'ll|'d|'S|'T|'RE|'VE|'M|'LL|'D| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/giu

export interface EncodedToken {
  tokenId: number
  bytes: number[]
}

export function encodeWithVocab(
  text: string,
  vocab: TiktokenVocab,
  patternType: 'cl100k' | 'p50k' | 'codellama'
): EncodedToken[] {
  if (!text) return []

  const encoder = new TextEncoder()
  const result: EncodedToken[] = []

  // Clone the regex so lastIndex resets cleanly on every call
  const basePattern = patternType === 'cl100k' ? CL100K_PATTERN : P50K_PATTERN
  const pattern = new RegExp(basePattern.source, basePattern.flags)

  const chunks: string[] = text.match(pattern) ?? [text]

  for (const chunk of chunks) {
    const bytes = encoder.encode(chunk)

    // Start with single bytes as initial segments
    const initialParts: Uint8Array[] = Array.from(bytes).map(b => new Uint8Array([b]))

    // BPE merge
    const tokenIds = bpeMerge(initialParts, vocab)

    for (const id of tokenIds) {
      const tokenBytes = vocab.idToToken.get(id) ?? new Uint8Array([id & 0xff])
      result.push({ tokenId: id, bytes: Array.from(tokenBytes) })
    }
  }

  return result
}
