import { NextRequest, NextResponse } from 'next/server'

// Simple proxy for exchange rates. Defaults to base=CNY
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const base = (searchParams.get('base') || 'CNY').toUpperCase()
  const upstream = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`

  try {
    const res = await fetch(upstream, { cache: 'no-store', headers: { accept: 'application/json' } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch rates', status: res.status }, { status: res.status })
    }
    const json = await res.json()
    // Normalize to { base, rates }
    const body = {
      base: json.base_code || base,
      rates: json.rates || {},
      time_last_update_unix: json.time_last_update_unix,
    }
    return NextResponse.json(body)
  } catch (_) {
    return NextResponse.json({ error: 'Network error' }, { status: 502 })
  }
}


