import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Event = {
  id: string
  title: string
  date: string
  end_date?: string | null
  time?: string | null
  member: string
  members?: string[] | null
  color: string
  colors?: string[] | null
  notes?: string | null
  created_at: string
}
