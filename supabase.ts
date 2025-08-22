import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallbacks for reliable connection
const supabaseUrl = import.meta.env.SUPABASE_URL || 
                    import.meta.env.VITE_SUPABASE_URL || 
                    'https://vkwhrbjkdznncjkzkiuo.supabase.co'

const supabasePublicKey = import.meta.env.SUPABASE_PUBLIC_API_KEY || 
                         import.meta.env.VITE_SUPABASE_ANON_KEY ||
                         'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs'

if (!supabaseUrl || !supabasePublicKey) {
  console.warn('Supabase configuration missing, using fallback values')
}

export const supabase = createClient(supabaseUrl, supabasePublicKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
