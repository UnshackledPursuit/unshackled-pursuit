import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'archived'
  color: string
  created_at: string
  app_path: string | null
  website_path: string | null
  feedback_url: string | null
  custom_instructions: string | null
  sort_order: number
}

export type Thought = {
  id: string
  user_id: string
  content: string
  content_type: 'text' | 'voice' | 'image' | 'pdf' | 'link'
  source: 'manual' | 'shortcut' | 'share_extension' | 'agent' | 'folder_watch'
  status: 'inbox' | 'processing' | 'routed' | 'done' | 'archived'
  captured_at: string
  priority: 'high' | 'medium' | 'low' | 'someday' | null
  tags: string[] | null
  ai_analysis: string | null
  routed_to: string | null
  raw_file_url: string | null
  project_id: string | null
  is_actionable: boolean | null
  suggested_destination: 'things' | 'reminders' | 'calendar' | 'notes' | 'reference' | 'archive' | null
  processed_at: string | null
  url: string | null
  url_title: string | null
  url_description: string | null
}

export type ThoughtWithProject = Thought & {
  project?: Project | null
}

// Routing destinations
export const DESTINATIONS = {
  things: { name: 'Things 3', icon: '✓', color: 'bg-blue-500' },
  reminders: { name: 'Reminders', icon: '🔔', color: 'bg-orange-500' },
  calendar: { name: 'Calendar', icon: '📅', color: 'bg-red-500' },
  notes: { name: 'Notes', icon: '📝', color: 'bg-yellow-500' },
  reference: { name: 'Reference', icon: '📚', color: 'bg-purple-500' },
  archive: { name: 'Archive', icon: '📦', color: 'bg-zinc-500' },
} as const

export type Destination = keyof typeof DESTINATIONS

// Priority config
export const PRIORITIES = {
  high: { name: 'High', color: 'bg-red-500', textColor: 'text-red-400' },
  medium: { name: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  low: { name: 'Low', color: 'bg-green-500', textColor: 'text-green-400' },
  someday: { name: 'Someday', color: 'bg-zinc-500', textColor: 'text-zinc-400' },
} as const

export type Priority = keyof typeof PRIORITIES
