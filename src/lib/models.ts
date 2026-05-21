import { ModelId, ModelMeta } from '@/types'

// All vocab / merges files are served from OpenAI's public blob storage.
// cl100k_base  → GPT-4, GPT-3.5-turbo, text-embedding-ada-002
// o200k_base   → GPT-4o
// p50k_base    → code-davinci-002, text-davinci-002/003  (also used by gpt-4-1106-preview alias)
// CodeLlama    → uses its own SentencePiece vocab; we approximate with char-level BPE fallback

const CDN = 'https://openaipublic.blob.core.windows.net/encodings'

export const MODELS: Record<ModelId, ModelMeta> = {
  'cl100k_base': {
    id: 'cl100k_base',
    label: 'cl100k_base',
    description: 'Used by GPT-4, GPT-3.5-turbo, text-embedding-ada-002. ~100k tokens.',
    vocabUrl:   `${CDN}/cl100k_base.tiktoken`,
    mergesUrl:  '',
    patternType: 'cl100k',
  },
  'o200k_base': {
    id: 'o200k_base',
    label: 'o200k_base',
    description: 'Used by GPT-4o and GPT-4o-mini. ~200k tokens, better multilingual coverage.',
    vocabUrl:   `${CDN}/o200k_base.tiktoken`,
    mergesUrl:  '',
    patternType: 'cl100k',
  },
  'gpt-4-1106-preview': {
    id: 'gpt-4-1106-preview',
    label: 'gpt-4-1106-preview',
    description: 'GPT-4 Turbo preview. Uses cl100k_base tokenizer under the hood.',
    vocabUrl:   `${CDN}/cl100k_base.tiktoken`,
    mergesUrl:  '',
    patternType: 'cl100k',
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    label: 'gpt-3.5-turbo',
    description: 'ChatGPT. Uses cl100k_base tokenizer. Same vocab as GPT-4.',
    vocabUrl:   `${CDN}/cl100k_base.tiktoken`,
    mergesUrl:  '',
    patternType: 'cl100k',
  },
  'codellama': {
    id: 'codellama',
    label: 'codellama/CodeLlama-7b-hf',
    description: 'Meta CodeLlama. Uses a SentencePiece BPE vocab (32k tokens). Code-optimised.',
    vocabUrl:   `${CDN}/p50k_base.tiktoken`,  // closest public approximation
    mergesUrl:  '',
    patternType: 'codellama',
  },
}

export const MODEL_LIST: ModelId[] = [
  'cl100k_base',
  'o200k_base',
  'gpt-4-1106-preview',
  'gpt-3.5-turbo',
  'codellama',
]
