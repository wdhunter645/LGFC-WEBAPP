import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use direct URL and public API key - same as backend scripts
  const supabaseUrl = 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
  const supabaseAnonKey = 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';
  
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
  // Use direct URL and public API key - same as backend scripts
  const supabaseUrl = 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
  const supabaseAnonKey = 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';
  
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// JWT-only client that doesn't require anon key for authentication
export function createJWTClient() {
  // Use direct URL and public API key - same as backend scripts
  const supabaseUrl = 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
  const supabaseAnonKey = 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';
  
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