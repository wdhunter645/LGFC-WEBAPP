import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Test Supabase connection
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
    const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY || 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY);

    // Test database connection
    const { data, error } = await supabase
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

  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'error',
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}