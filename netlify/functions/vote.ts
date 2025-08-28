import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') {
		return { statusCode: 405, body: 'Method Not Allowed' };
	}
	try {
		const { image_id } = JSON.parse(event.body || '{}');
		if (!image_id) return { statusCode: 400, body: 'Missing image_id' };

		const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
		const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY || 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';
		if (!SUPABASE_URL || !SUPABASE_PUBLIC_API_KEY) {
			return { statusCode: 500, body: 'Server not configured' };
		}

		const { createClient } = await import('@supabase/supabase-js');
		const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY);

		// Determine or set visitor cookie
		const headers = event.headers || {};
		const cookieHeader = headers.cookie || headers.Cookie || '';
		const match = /visitor_id=([^;]+)/.exec(cookieHeader || '');
		let visitorId = match ? decodeURIComponent(match[1]) : '';
		if (!visitorId) {
			visitorId = crypto.randomUUID();
		}

		const today = new Date();
		const session_day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0,10);

		// Upsert visitor record
		await supabase.from('visitors').insert({ id: visitorId }).select().maybeSingle();

		// Prevent duplicate: unique (visitor_id, image_id, session_day)
		const { error } = await supabase
			.from('visitor_votes')
			.insert({ visitor_id: visitorId, image_id, session_day });
		if (error && !String(error.message || '').includes('duplicate')) {
			return { statusCode: 400, body: `Vote error: ${error.message}` };
		}

		return {
			statusCode: 200,
			headers: {
				'Set-Cookie': `visitor_id=${encodeURIComponent(visitorId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*365}; Secure`
			},
			body: JSON.stringify({ ok: true })
		};
	} catch (e: any) {
		return { statusCode: 500, body: 'Server error' };
	}
}