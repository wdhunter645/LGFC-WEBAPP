import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { item_id } = JSON.parse(event.body || '{}');
    if (!item_id) return { statusCode: 400, body: 'Missing item_id' };

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return { statusCode: 200, body: JSON.stringify({ ok: true, stored: false }) };

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase.from('faq_clicks').insert({ item_id });
    if (error) return { statusCode: 400, body: error.message };

    return { statusCode: 200, body: JSON.stringify({ ok: true, stored: true }) };
  } catch (e: any) {
    return { statusCode: 500, body: 'Server error' };
  }
}