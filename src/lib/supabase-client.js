import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = (typeof window !== 'undefined' && window.__SUPABASE_URL) || import.meta.env.SUPABASE_URL || ''
  const supabasePublicKey = (typeof window !== 'undefined' && window.__SUPABASE_KEY) || import.meta.env.SUPABASE_PUBLIC_API_KEY || ''
  
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
  const supabaseUrl = process.env.SUPABASE_URL || ''
  const supabasePublicKey = process.env.SUPABASE_PUBLIC_API_KEY || ''
  
  return createServerClient(
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
          } catch {}
        },
      },
    }
  )
}

export function createJWTClient() {
  const supabaseUrl = (typeof window !== 'undefined' && window.__SUPABASE_URL) || import.meta.env.SUPABASE_URL || ''
  const supabasePublicKey = (typeof window !== 'undefined' && window.__SUPABASE_KEY) || import.meta.env.SUPABASE_PUBLIC_API_KEY || ''
  
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