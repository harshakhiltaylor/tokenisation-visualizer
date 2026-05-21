/**
 * Loads a real .tiktoken vocab file from OpenAI's CDN.
 *
 * Format of .tiktoken files (one line per token):
 *   <base64-encoded-bytes> <integer-token-id>
 *
 * We build two maps:
 *   tokenToId : Uint8Array  → number   (encode)
 *   idToToken : number      → Uint8Array (decode)
 */

export interface TiktokenVocab {
  tokenToId: Map<string, number>   // key = base64 of bytes
  idToToken: Map<number, Uint8Array>
  vocabSize: number
}

// Server-side in-memory cache (survives across requests in same Node.js process)
const vocabCache = new Map<string, TiktokenVocab>()

function base64ToBytes(b64: string): Uint8Array {
  const bin = Buffer.from(b64, 'base64')
  return new Uint8Array(bin)
}

export async function loadVocab(url: string): Promise<TiktokenVocab> {
  if (vocabCache.has(url)) {
    return vocabCache.get(url)!
  }

  const res = await fetch(url, { next: { revalidate: 86400 } }) // cache 24h in Next.js
  if (!res.ok) {
    throw new Error(`Failed to fetch vocab from ${url}: ${res.status} ${res.statusText}`)
  }

  const text = await res.text()
  const lines = text.trim().split('\n')

  const tokenToId = new Map<string, number>()
  const idToToken = new Map<number, Uint8Array>()

  for (const line of lines) {
    if (!line.trim()) continue
    const spaceIdx = line.lastIndexOf(' ')
    if (spaceIdx === -1) continue
    const b64 = line.slice(0, spaceIdx)
    const id  = parseInt(line.slice(spaceIdx + 1), 10)
    const bytes = base64ToBytes(b64)
    tokenToId.set(b64, id)
    idToToken.set(id, bytes)
  }

  const vocab: TiktokenVocab = { tokenToId, idToToken, vocabSize: idToToken.size }
  vocabCache.set(url, vocab)
  return vocab
}
