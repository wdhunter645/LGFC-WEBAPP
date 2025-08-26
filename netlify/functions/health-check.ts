import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Test Supabase connection
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLIC_API_KEY) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'error',
          message: 'Missing Supabase configuration',
          timestamp: new Date().toISOString()
        })
      };
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY);

    // Test database connection
    const { error } = await supabase
      .from('search_state')
      .select('*')
      .limit(1);

    if (error) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'error',
          message: 'Database connection failed',
          error: error.message,
          timestamp: new Date().toISOString()
        })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'healthy',
        message: 'All systems operational',
        supabase: {
          connected: true,
          url: SUPABASE_URL,
          tables_accessible: true
        },
        timestamp: new Date().toISOString()
      })
    };

  } catch (error: unknown) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
    };
  }
}
