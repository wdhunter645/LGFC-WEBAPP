import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { id, answer, sendEmail } = JSON.parse(event.body || '{}');
    if (!id || typeof answer !== 'string') return { statusCode: 400, body: 'Missing id or answer' };

    const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
    const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY as string | undefined;
    if (!SUPABASE_URL || !SUPABASE_PUBLIC_API_KEY) return { statusCode: 500, body: 'Server not configured' };

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY);

    const { data: row, error: fetchErr } = await supabase
      .from('faq_items')
      .select('id, question, submitter_email')
      .eq('id', id)
      .maybeSingle();
    if (fetchErr) return { statusCode: 400, body: fetchErr.message };

    const status = sendEmail ? 'published' : 'draft';
    const { error: updErr } = await supabase
      .from('faq_items')
      .update({ answer, status })
      .eq('id', id);
    if (updErr) return { statusCode: 400, body: updErr.message };

    let emailed = false;
    if (sendEmail && row?.submitter_email) {
      const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string | undefined;
      const SENDGRID_FROM = process.env.SENDGRID_FROM as string | undefined;
      if (SENDGRID_API_KEY && SENDGRID_FROM) {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: row.submitter_email }], subject: 'Answer to your question' }],
            from: { email: SENDGRID_FROM },
            content: [ { type: 'text/plain', value: `Question: ${row.question}\n\nAnswer: ${answer}` } ]
          })
        });
        emailed = res.ok;
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, emailed }) };
  } catch (e: any) {
    return { statusCode: 500, body: 'Server error' };
  }
}