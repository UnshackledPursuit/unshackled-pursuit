import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Thought = {
  id: string
  user_id: string
  content: string
  content_type: 'text' | 'voice' | 'image' | 'pdf' | 'link'
  source: 'manual' | 'shortcut' | 'share_extension'
  status: 'inbox' | 'processing' | 'routed' | 'done'
  captured_at: string
  priority: 'high' | 'medium' | 'low' | 'someday' | null
  tags: string[] | null
  ai_analysis: string | null
  routed_to: string | null
  raw_file_url: string | null
}
