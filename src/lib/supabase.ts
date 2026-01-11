import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseClient: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase credentials not configured. Registry features will be disabled.')
}

export const supabase = supabaseClient

export const isSupabaseConfigured = (): boolean => {
  return supabase !== null
}
