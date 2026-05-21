export type ModelId =
  | 'cl100k_base'
  | 'o200k_base'
  | 'gpt-4-1106-preview'
  | 'gpt-3.5-turbo'
  | 'codellama'

export interface ModelMeta {
  id: ModelId
  label: string
  description: string
  vocabUrl: string
  mergesUrl: string
  patternType: 'cl100k' | 'p50k' | 'codellama'
}

export interface Token {
  text: string      // decoded display text
  id: number        // token integer ID
  bytes: number[]   // raw UTF-8 bytes
  colorIndex: number
}

export interface TokenizeResult {
  tokens: Token[]
  tokenCount: number
  charCount: number
  byteCount: number
  compressionRatio: number
  avgTokenLength: number
  modelId: ModelId
  loadedFromCache: boolean
}

export interface TokenizeRequest {
  text: string
  modelId: ModelId
  showWhitespace: boolean
}
