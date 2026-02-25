import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/auth'
import { generateSlug } from '@/lib/slug'

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, script_content, game_name, game_link, background_image_url } = body

    if (!title || !script_content) {
      return NextResponse.json({ error: 'Title and script are required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const slug = generateSlug(title)

    const { data, error } = await supabase
      .from('scripts')
      .insert({ title, description, script_content, game_name, game_link, background_image_url, slug })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, script: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create script' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, title, description, script_content, game_name, game_link, background_image_url } = body

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('scripts')
      .update({ title, description, script_content, game_name, game_link, background_image_url })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, script: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update script' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await req.json()
    const supabase = createServiceClient()

    const { error } = await supabase.from('scripts').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete script' }, { status: 500 })
  }
}
