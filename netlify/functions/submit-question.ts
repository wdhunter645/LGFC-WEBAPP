export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { question, email } = JSON.parse(event.body || '{}');
    if (!question || typeof question !== 'string' || question.trim().length < 5) {
      return { statusCode: 400, body: 'Invalid question' };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
    const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY as string | undefined;

    let stored = false;
    if (SUPABASE_URL && SUPABASE_PUBLIC_API_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY);
        const { error } = await supabase
          .from('faq_items')
          .insert({
            question: question.trim(),
            submitter_email: email || null,
            status: 'draft'
          });
        if (!error) stored = true;
      } catch (e: any) {
        console.error('Supabase insert failed:', e?.message || e);
      }
    }

    console.log('Q&A Submission:', { question, email, at: new Date().toISOString(), stored });
    return { statusCode: 200, body: JSON.stringify({ ok: true, stored }) };
  } catch (err) {
    return { statusCode: 500, body: 'Server error' };
  }
};