import { createClient } from '@supabase/supabase-js'

// The app is "mock-first": with no env vars it runs entirely on local mock data.
// Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (Vercel env / .env.local) to go live.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(url && key)
export const supabase = hasSupabase ? createClient(url, key) : null
