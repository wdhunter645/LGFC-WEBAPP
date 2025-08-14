import { createClient } from '@supabase/supabase-js'

// Use direct URL and public API key - same as backend scripts
const supabaseUrl = 'https://vkwhrbjkdznncjkzkiuo.supabase.co'
const supabaseAnonKey = 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
