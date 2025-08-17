import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || (typeof window !== 'undefined' && window.__SUPABASE_URL) || ''
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_API_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLIC_API_KEY || (typeof window !== 'undefined' && window.__SUPABASE_KEY) || ''
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  )
}

// Server-side client for use in API routes or server components
export function createServerClient(cookies) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || ''
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_API_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLIC_API_KEY || ''
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  )
}

// JWT-only client that doesn't require anon key for authentication
export function createJWTClient() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || (typeof window !== 'undefined' && window.__SUPABASE_URL) || ''
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_API_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLIC_API_KEY || (typeof window !== 'undefined' && window.__SUPABASE_KEY) || ''
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  )
}