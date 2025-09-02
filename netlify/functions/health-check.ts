import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Test environment variables
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLIC_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Missing Supabase configuration',
          debug: {
            hasUrl: !!SUPABASE_URL,
            hasKey: !!SUPABASE_PUBLIC_API_KEY,
            envVars: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
          },
          timestamp: new Date().toISOString()
        })
      };
    }

    // Test Supabase client creation
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY);

    // Test database connection with a simple query that should always work
    const { data, error } = await supabase
      .from('search_state')
      .select('id, last_run_at')
      .limit(1);

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Database connection failed',
          error: error.message,
          supabaseUrl: SUPABASE_URL,
          timestamp: new Date().toISOString()
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        message: 'All systems operational',
        supabase: {
          connected: true,
          url: SUPABASE_URL,
          tables_accessible: true,
          search_state_records: data?.length || 0
        },
        build: {
          nodeEnv: process.env.NODE_ENV || 'development',
          deployContext: process.env.CONTEXT || 'unknown'
        },
        timestamp: new Date().toISOString()
      })
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Health check failed',
        error: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      })
    };
  }
}
