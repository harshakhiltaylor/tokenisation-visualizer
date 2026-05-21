// BPE Tokenizer - TypeScript port of the Python notebook implementation

export function getStats(ids: number[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (let i = 0; i < ids.length - 1; i++) {
    const key = `${ids[i]},${ids[i + 1]}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

export function mergePair(ids: number[], pair: [number, number], idx: number): number[] {
  const newIds: number[] = []
  let i = 0
  while (i < ids.length) {
    if (i < ids.length - 1 && ids[i] === pair[0] && ids[i + 1] === pair[1]) {
      newIds.push(idx)
      i += 2
    } else {
      newIds.push(ids[i])
      i++
    }
  }
  return newIds
}

// Pre-trained BPE merges (learned from a representative corpus)
// These are the top 50 most common byte-pair merges for English text
const PRETRAINED_MERGES: Array<[[number, number], number]> = [
  [[101, 32], 256],   // 'e '
  [[116, 104], 257],  // 'th'
  [[105, 110], 258],  // 'in'
  [[115, 32], 259],   // 's '
  [[116, 32], 260],   // 't '
  [[101, 114], 261],  // 'er'
  [[97, 110], 262],   // 'an'
  [[111, 114], 263],  // 'or'
  [[100, 32], 264],   // 'd '
  [[44, 32], 265],    // ', '
  [[97, 114], 266],   // 'ar'
  [[101, 110], 267],  // 'en'
  [[121, 32], 268],   // 'y '
  [[46, 32], 269],    // '. '
  [[97, 108], 270],   // 'al'
  [[257, 256], 271],  // 'the '
  [[111, 110], 272],  // 'on'
  [[99, 111], 273],   // 'co'
  [[105, 116], 274],  // 'it'
  [[258, 103], 275],  // 'ing'
  [[111, 32], 276],   // 'o '
  [[114, 101], 277],  // 're'
  [[115, 116], 278],  // 'st'
  [[97, 116], 279],   // 'at'
  [[104, 97], 280],   // 'ha'
  [[110, 32], 281],   // 'n '
  [[114, 32], 282],   // 'r '
  [[101, 100], 283],  // 'ed'
  [[105, 115], 284],  // 'is'
  [[111, 117], 285],  // 'ou'
  [[273, 100], 286],  // 'cod'
  [[101, 115], 287],  // 'es'
  [[110, 103], 288],  // 'ng'
  [[108, 101], 289],  // 'le'
  [[104, 101], 290],  // 'he'
  [[108, 108], 291],  // 'll'
  [[105, 111], 292],  // 'io'
  [[99, 104], 293],   // 'ch'
  [[119, 104], 294],  // 'wh'
  [[272, 32], 295],   // 'on '
  [[117, 116], 296],  // 'ut'
  [[111, 102], 297],  // 'of'
  [[108, 32], 298],   // 'l '
  [[109, 101], 299],  // 'me'
  [[102, 32], 300],   // 'f '
  [[110, 116], 301],  // 'nt'
  [[119, 101], 302],  // 'we'
  [[107, 101], 303],  // 'ke'
  [[119, 111], 304],  // 'wo'
  [[114, 111], 305],  // 'ro'
]

// Build vocab from merges
function buildVocab(merges: Array<[[number, number], number]>): Map<number, Uint8Array> {
  const vocab = new Map<number, Uint8Array>()
  for (let i = 0; i < 256; i++) {
    vocab.set(i, new Uint8Array([i]))
  }
  for (const [[p0, p1], idx] of merges) {
    const b0 = vocab.get(p0)!
    const b1 = vocab.get(p1)!
    const merged = new Uint8Array(b0.length + b1.length)
    merged.set(b0, 0)
    merged.set(b1, b0.length)
    vocab.set(idx, merged)
  }
  return vocab
}

const mergesMap = new Map<string, number>(
  PRETRAINED_MERGES.map(([[p0, p1], idx]) => [`${p0},${p1}`, idx])
)
const vocab = buildVocab(PRETRAINED_MERGES)

export function bpeEncode(text: string): Array<{ tokenId: number; bytes: number[] }> {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(text)
  let ids = Array.from(bytes)

  while (ids.length >= 2) {
    const stats = getStats(ids)
    // find the pair with the lowest merge index (highest priority)
    let bestKey = ''
    let bestIdx = Infinity
    for (const [key] of stats) {
      const idx = mergesMap.get(key)
      if (idx !== undefined && idx < bestIdx) {
        bestIdx = idx
        bestKey = key
      }
    }
    if (!bestKey) break
    const [a, b] = bestKey.split(',').map(Number) as [number, number]
    ids = mergePair(ids, [a, b], bestIdx)
  }

  return ids.map(id => ({
    tokenId: id,
    bytes: Array.from(vocab.get(id) ?? new Uint8Array([id])),
  }))
}

export function bpeDecode(ids: number[]): string {
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const allBytes: number[] = []
  for (const id of ids) {
    const bytes = vocab.get(id) ?? new Uint8Array([id])
    allBytes.push(...Array.from(bytes))
  }
  return decoder.decode(new Uint8Array(allBytes))
}
