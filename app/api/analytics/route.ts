import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { scriptId, eventType } = await req.json()

    if (!scriptId || !['view', 'copy'].includes(eventType)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Hash IP for privacy
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const ipHash = createHash('sha256').update(ip + process.env.ADMIN_SECRET).digest('hex').slice(0, 16)
    const userAgent = req.headers.get('user-agent') || null
    const country = req.headers.get('x-vercel-ip-country') || null

    const { error } = await supabase.from('analytics').insert({
      script_id: scriptId,
      event_type: eventType,
      ip_hash: ipHash,
      user_agent: userAgent,
      country,
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
