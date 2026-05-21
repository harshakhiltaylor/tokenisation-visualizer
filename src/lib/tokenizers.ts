// Character-level tokenizer
export function charEncode(text: string): Array<{ tokenId: number; bytes: number[] }> {
  const encoder = new TextEncoder()
  const result: Array<{ tokenId: number; bytes: number[] }> = []

  for (const char of text) {
    const bytes = Array.from(encoder.encode(char))
    // use the first byte as a simple id for single-byte chars, else hash
    const tokenId = bytes.length === 1 ? bytes[0] : bytes.reduce((a, b) => (a * 31 + b) & 0xffff, 0)
    result.push({ tokenId, bytes })
  }

  return result
}

// Word-level tokenizer (splits on whitespace and punctuation)
export function wordEncode(text: string): Array<{ tokenId: number; bytes: number[] }> {
  const encoder = new TextEncoder()
  // split preserving the delimiters
  const parts = text.split(/(\s+|[.,!?;:'"()\[\]{}\-—\/\\])/)
  const result: Array<{ tokenId: number; bytes: number[] }> = []

  let wordVocab = new Map<string, number>()
  let nextId = 256

  for (const part of parts) {
    if (part === '') continue
    const bytes = Array.from(encoder.encode(part))

    if (!wordVocab.has(part)) {
      wordVocab.set(part, nextId++)
    }
    const tokenId = wordVocab.get(part)!
    result.push({ tokenId, bytes })
  }

  return result
}
