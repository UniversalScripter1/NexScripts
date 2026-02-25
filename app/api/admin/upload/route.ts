import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' }, { status: 400 })
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${uuidv4()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('backgrounds')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('backgrounds')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
