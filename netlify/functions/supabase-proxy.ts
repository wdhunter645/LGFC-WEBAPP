import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
      body: ''
    };
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
    const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY || 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';

    // Extract the path after /api/supabase/
    const path = event.path.replace('/api/supabase/', '');
    const targetUrl = `${SUPABASE_URL}/${path}`;

    // Forward the request to Supabase
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_PUBLIC_API_KEY,
        'Authorization': `Bearer ${SUPABASE_PUBLIC_API_KEY}`,
        ...Object.fromEntries(
          Object.entries(event.headers)
            .filter(([key]) => !['host', 'x-forwarded-for', 'x-forwarded-proto'].includes(key.toLowerCase()))
        )
      },
      body: event.body || undefined
    });

    const responseBody = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
      body: responseBody
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Proxy error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}