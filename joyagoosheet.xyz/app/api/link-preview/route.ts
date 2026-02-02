import { NextRequest, NextResponse } from 'next/server'
import { decryptWithKeyId } from '@/app/lib/keyManager'

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { p?: { i: string; c: string } | { a?: string; d?: string } }
    const enc = body?.p as { i: string; c: string } | undefined
    const legacy = body?.p as unknown as { a?: string; d?: string } | undefined
    if (!enc || typeof enc.c !== 'string' || typeof enc.i !== 'string') {
      // Support legacy double-base64 envelope from other tools if provided
      const dbl = legacy && legacy.a === '$@2' && typeof legacy.d === 'string' ? legacy.d : null
      if (!dbl) {
        return NextResponse.json({ error: 'Missing encrypted payload' }, { status: 400 })
      }
      const once = Buffer.from(dbl, 'base64').toString('utf8')
      const url = Buffer.from(once, 'base64').toString('utf8')
      return await proxyUpstream(url)
    }
    const url = decryptWithKeyId(enc.i, enc.c)
    return await proxyUpstream(url)
  } catch (_) {
    return NextResponse.json({ error: 'Network error' }, { status: 502 })
  }
}

async function proxyUpstream(url: string): Promise<NextResponse> {
  const upstreamUrl = `https://api.rep-finds.com/info/?url=${encodeURIComponent(url)}`
  const res = await fetch(upstreamUrl, {
    cache: 'no-store',
    headers: { 'accept': 'application/json' },
    next: { revalidate: 0 },
  } as RequestInit)

  const contentType = res.headers.get('content-type') || ''
  if (!res.ok) {
    const text = contentType.includes('application/json') ? await res.json() : await res.text()
    return NextResponse.json({ error: 'Upstream request failed', status: res.status, detail: text }, { status: res.status })
  }
  const bodyOut = contentType.includes('application/json') ? await res.json() : await res.text()
  return NextResponse.json(bodyOut)
}


