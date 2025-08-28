import { createBrowserClient, createServerClient as createSupabaseServerClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = (typeof window !== 'undefined' && window.__SUPABASE_URL) || 
                      import.meta.env.SUPABASE_URL || 
                      import.meta.env.VITE_SUPABASE_URL || 
                      'https://vkwhrbjkdznncjkzkiuo.supabase.co'
  
  const supabasePublicKey = (typeof window !== 'undefined' && window.__SUPABASE_KEY) || 
                           import.meta.env.SUPABASE_PUBLIC_API_KEY || 
                           import.meta.env.VITE_SUPABASE_ANON_KEY ||
                           'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs'
  
  return createBrowserClient(
    supabaseUrl,
    supabasePublicKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  )
}

export function createServerClient(cookies) {
  const supabaseUrl = process.env.SUPABASE_URL || 
                      process.env.VITE_SUPABASE_URL || 
                      'https://vkwhrbjkdznncjkzkiuo.supabase.co'
  
  const supabasePublicKey = process.env.SUPABASE_PUBLIC_API_KEY || 
                           process.env.VITE_SUPABASE_ANON_KEY ||
                           'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs'
  
  return createSupabaseServerClient(
    supabaseUrl,
    supabasePublicKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      cookies: {
        getAll() {
          return cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies.set(name, value, options)
            )
          } catch (err) {
            console.warn('Cookie setAll not available in this context');
          }
        },
      },
    }
  )
}

export function createJWTClient() {
  const supabaseUrl = (typeof window !== 'undefined' && window.__SUPABASE_URL) || 
                      import.meta.env.SUPABASE_URL || 
                      import.meta.env.VITE_SUPABASE_URL || 
                      'https://vkwhrbjkdznncjkzkiuo.supabase.co'
  
  const supabasePublicKey = (typeof window !== 'undefined' && window.__SUPABASE_KEY) || 
                           import.meta.env.SUPABASE_PUBLIC_API_KEY || 
                           import.meta.env.VITE_SUPABASE_ANON_KEY ||
                           'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs'
  
  return createBrowserClient(
    supabaseUrl,
    supabasePublicKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  )
}