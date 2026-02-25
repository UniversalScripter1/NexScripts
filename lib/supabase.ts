import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type Script = {
  id: string
  slug: string
  title: string
  description: string | null
  script_content: string
  game_name: string | null
  game_link: string | null
  background_image_url: string | null
  created_at: string
  updated_at: string
}

export type Analytics = {
  id: string
  script_id: string
  event_type: 'view' | 'copy'
  ip_hash: string | null
  user_agent: string | null
  country: string | null
  created_at: string
}
