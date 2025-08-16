export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { question, email } = JSON.parse(event.body || '{}');
    if (!question || typeof question !== 'string' || question.trim().length < 5) {
      return { statusCode: 400, body: 'Invalid question' };
    }
    // TODO: integrate with storage (Supabase table) or email. For now, log.
    console.log('Q&A Submission:', { question, email, at: new Date().toISOString() });
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: 'Server error' };
  }
};