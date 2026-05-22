# Tokenizer Visualizer

**Live demo → [tokenisation-visualizer-app.vercel.app](https://tokenisation-visualizer-app.vercel.app)**

A Next.js + TypeScript tokenizer visualizer using **real tiktoken vocabularies** fetched live from OpenAI's CDN. Visualize exactly how GPT-4, GPT-4o, and other LLMs break your text into tokens — with rich analytics, heatmaps, streaming animations, file upload, history, and more.

---

## ✨ Features

### 🤖 Models
Supports **5 real tokenizer models** with actual vocab files from `openaipublic.blob.core.windows.net`:

| Model | Used By | Vocab Size | Context Window |
|---|---|---|---|
| `cl100k_base` | GPT-4, GPT-3.5-turbo, text-embedding-ada-002 | 100,277 | 128k |
| `o200k_base` | GPT-4o, GPT-4o-mini | 200,019 | 128k |
| `gpt-4-1106-preview` | GPT-4 Turbo | 100,277 | 128k |
| `gpt-3.5-turbo` | ChatGPT | 100,277 | 16k |
| `codellama/CodeLlama-7b-hf` | Meta CodeLlama | 32,000 | 16k |

---

### 🎨 Visualization & Display

- **Colored token highlighting** — 20 distinct colors cycle through tokens
- **Token heatmap** 🔥 — toggle heatmap mode where color intensity reflects byte size (green=1B → red=4B+), with a live legend
- **Streaming animation** ⚡ — tokens appear one-by-one with staggered fade-in, simulating LLM streaming output
- **Click-to-highlight** — click any token chip to highlight its corresponding ID in the list (and vice versa), with bidirectional scroll-into-view
- **Token boundary markers** — toggle thin vertical dividers between every token boundary
- **Longest token finder** 🏆 — the single longest token (by byte count) is highlighted with a gold glow and shown in the panel header
- **Hover tooltip** — shows token ID, byte count, hex bytes, and decimal bytes on hover

---

### 📊 Analysis & Stats

- **Token statistics** — count, characters, bytes, chars/token, bytes/token
- **Context window usage bar** — visual gradient progress bar showing `N / max_context` tokens used (green → amber → red), with percentage and tick marks
- **Single-byte vs multi-byte breakdown** — stat cards + stacked bar showing what % of tokens are ASCII vs Unicode
- **Vocabulary coverage indicator** — stacked bar distinguishing single-byte (cheap, ASCII) from multi-byte (Unicode/multilingual) token usage
- **Rare token detector** — flags tokens with 4+ bytes (unusual or multi-byte Unicode tokens); shown as amber stat card with % of total
- **Language / script breakdown** — detects Latin/ASCII, CJK, Korean, Japanese, Cyrillic, Arabic, Devanagari, Emoji; renders as stacked bar + pills
- **Longest token highlight** — gold outline on the longest token in the visualization panel

---

### 📥 Input & Output

- **File upload** — drag-and-drop or browse `.txt`, `.py`, `.md`, `.json`, `.ts`, `.tsx`, `.js`, `.csv`, `.yaml`, `.xml`, `.html` (max 500 KB)
- **URL fetch** — paste any URL and the server fetches + strips HTML to plain text for tokenization (CORS-safe, server-side proxy)
- **Sample texts** — English, Korean, Python, Arithmetic, Unicode, Mixed case one-click presets
- **Show whitespace** toggle — spaces → `·`, newlines → `↵`, tabs → `→`
- **Export as JSON** — download `{ tokens, ids, stats }` as a timestamped `.json` file
- **Share URL** — encodes `text + modelId` as base64 in the URL; copy the link and share — the page restores the exact tokenization on load
- **Copy token IDs** — one-click copy as `[id1, id2, ...]`

---

### 🕓 History

- **Last 10 inputs** stored in `localStorage` — collapsible panel shows text preview, model, token count, and timestamp
- Click any history entry to instantly restore text + model
- Per-entry delete or clear-all

---

### 🔄 Comparison

- **Side-by-side model comparison** — pick any two models and see how the same text tokenizes differently, with per-model stats

---

### 🌓 Theme

- **Dark / Light mode** with system preference detection and no flash on load

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The first tokenization per model fetches the vocab file from OpenAI's CDN (~1–2 MB). After that it's cached in server memory for the lifetime of the process.

---

## Deployment

Deployed on Vercel — [tokenisation-visualizer-app.vercel.app](https://tokenisation-visualizer-app.vercel.app)

To deploy your own fork:
1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Next.js, no config needed

---

## Project Structure

```
src/
  app/
    api/
      tokenize/route.ts      API — loads vocab, tokenizes, computes all stats
      fetch-url/route.ts     API — server-side URL proxy (strips HTML → plain text)
    page.tsx                 Main page — all state and feature wiring
    layout.tsx               Root layout with no-flash theme script
    globals.css              Tailwind + token chip, heatmap, animation styles
  components/
    ThemeToggle.tsx          Animated sun/moon toggle
    ModelSelector.tsx        Dropdown with all 5 models + descriptions
    TokenDisplay.tsx         Token chips — heatmap, animation, click, boundary, longest
    TokenIDs.tsx             Scrollable ID list — click-to-highlight, copy
    StatsBar.tsx             Stats cards — tokens, chars, bytes, rare, byte breakdown
    ComparisonView.tsx       Side-by-side model comparison
    ContextWindowBar.tsx     Gradient progress bar for context window usage
    VocabCoverageBar.tsx     Stacked bar — single-byte vs multi-byte coverage
    LanguageBreakdown.tsx    Script/language detection — stacked bar + pills
    FileUpload.tsx           Drag-and-drop file reader
    HistoryPanel.tsx         localStorage-backed last-10 inputs panel
    ExportShare.tsx          JSON export + shareable URL generator
  lib/
    models.ts                Model registry (CDN URLs, context windows, vocab sizes)
    vocabLoader.ts           Fetches + parses .tiktoken files, in-memory cache
    tiktokenEncoder.ts       Real BPE merge algorithm using loaded vocab
    colors.ts                20-color token palette
  types/
    index.ts                 Shared TypeScript types (Token, TokenizeResult, etc.)
```

---

## How the Real Tokenization Works

`.tiktoken` files are line-delimited:
```
<base64-bytes> <token-id>
```

The token ID is the **merge rank** — lower ID = higher priority merge. The BPE encoder:
1. Splits text into chunks using OpenAI's regex pattern
2. Converts each chunk to raw UTF-8 bytes
3. Repeatedly merges the byte-pair whose merged form has the lowest token ID
4. Returns the final list of token IDs

This is the same algorithm as the official `tiktoken` Python library.

---

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS + custom CSS animations
- **Fonts** — Inter (UI) + JetBrains Mono (tokens)
- **Tokenization** — real BPE using OpenAI public `.tiktoken` vocab files
- **Deployment** — Vercel
