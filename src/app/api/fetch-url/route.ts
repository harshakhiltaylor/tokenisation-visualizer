import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    // Basic URL validation
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http/https URLs allowed' }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'TokenizerBot/1.0' },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Fetch failed: ${response.status}` }, { status: 502 })
    }

    const contentType = response.headers.get('content-type') ?? ''
    let text = ''

    if (contentType.includes('text/html')) {
      const html = await response.text()
      // Strip HTML tags and decode entities
      text = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 20000) // cap at 20k chars
    } else if (contentType.includes('text/')) {
      text = (await response.text()).slice(0, 20000)
    } else {
      return NextResponse.json({ error: 'URL does not return text content' }, { status: 415 })
    }

    return NextResponse.json({ text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
