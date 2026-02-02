import { NextRequest, NextResponse } from 'next/server'
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const link = searchParams.get('link')
  const agent = searchParams.get('agent') || undefined // Optional preferred agent

  if (!link) {
    return NextResponse.json({ error: 'Missing link parameter' }, { status: 400 })
  }

  try {
    const trimmed = link.trim()
    const base = "https://danodrevo-api.vercel.app"
    const normalized = trimmed.startsWith("http")
      ? trimmed
      : trimmed.startsWith("/")
        ? `${base}${trimmed}`
        : /^(taobao|weidian|1688)\/\d+$/i.test(trimmed)
          ? `${base}/${trimmed}`
          : trimmed

    const url = `${base}/convert?link=${encodeURIComponent(normalized)}`
    const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } })
    if (!res.ok) {
      return NextResponse.json({ error: `Request failed (${res.status})` }, { status: res.status })
    }
    const json = await res.json()
    return NextResponse.json(json)
  } catch (err) {
    console.error('Link conversion error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


