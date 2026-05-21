# Tokenizer Visualizer

**Live demo → [tokenisation-visualizer-app.vercel.app](https://tokenisation-visualizer-app.vercel.app)**

A Next.js + TypeScript tokenizer visualizer using **real tiktoken vocabularies** fetched live from OpenAI's CDN.

## Features

- **5 real tokenizer models** with actual vocab files from `openaipublic.blob.core.windows.net`:
  - `cl100k_base` — GPT-4, GPT-3.5-turbo
  - `o200k_base` — GPT-4o
  - `gpt-4-1106-preview` — GPT-4 Turbo
  - `gpt-3.5-turbo` — ChatGPT
  - `codellama/CodeLlama-7b-hf` — Meta CodeLlama
- **Colored token highlighting** with 20 distinct colors
- **Hover tooltip** — shows token ID, byte count, hex bytes, decimal bytes
- **Token statistics** — count, chars, bytes, chars/token, bytes/token
- **Copy token IDs** to clipboard (formatted as `[id1, id2, ...]`)
- **Show whitespace** toggle — spaces → `·`, newlines → `↵`, tabs → `→`
- **Side-by-side comparison** of any two models
- **Dark / Light mode** with system preference + no flash on load
- **Sample texts** — English, Korean, Python, arithmetic, Unicode, mixed case

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The first tokenization per model fetches the vocab file from OpenAI's CDN (~1–2MB). After that it's cached in server memory for the lifetime of the process (instant on Vercel too, per serverless instance).

## Deployment

Deployed on Vercel — [tokenisation-visualizer-app.vercel.app](https://tokenisation-visualizer-app.vercel.app)

To deploy your own fork:
1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Next.js, no config needed

## Project Structure

```
src/
  app/
    api/tokenize/route.ts    Next.js API route — loads vocab + tokenizes
    page.tsx                 Main page
    layout.tsx               Root layout with no-flash theme script
    globals.css              Tailwind base + token chip styles
  components/
    ThemeToggle.tsx          Animated sun/moon toggle
    ModelSelector.tsx        Dropdown with all 5 models + descriptions
    TokenDisplay.tsx         Colored tokens with hover tooltip
    TokenIDs.tsx             Scrollable ID list with copy button
    StatsBar.tsx             5-card stats panel
    ComparisonView.tsx       Side-by-side model comparison
  lib/
    models.ts                Model registry (CDN URLs, pattern types)
    vocabLoader.ts           Fetches + parses .tiktoken files, in-memory cache
    tiktokenEncoder.ts       Real BPE merge algorithm using loaded vocab
    colors.ts                20-color token palette
  types/
    index.ts                 Shared TypeScript types
```

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
