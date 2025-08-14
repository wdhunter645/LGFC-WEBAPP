#!/usr/bin/env node
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// JWT approach: Public API key for connection, JWT for authentication
const SUPABASE_URL = 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY || 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

const query = process.argv[2] || 'Lou Gehrig';
const maxResults = Math.max(1, Math.min(Number(process.argv[3]) || 50, 100));

function hashHex(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function nowIso() {
  return new Date().toISOString();
}

async function authenticateWithJWT() {
  console.log('🔐 Authenticating with JWT (Internal Variables)...');
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  
  if (authError) {
    console.error('❌ JWT authentication failed:', authError.message);
    process.exit(1);
  }
  
  console.log('✅ JWT authentication successful');
  console.log('   User ID:', authData.user.id);
  return authData.user;
}

async function main() {
  // First authenticate with JWT
  await authenticateWithJWT();
  
  const { data: stateRows } = await supabase.from('search_state').select('last_run_at').eq('id', 1).limit(1);
  const lastRunAt = stateRows && stateRows[0]?.last_run_at ? new Date(stateRows[0].last_run_at) : undefined;

  const enhancedQuery = `"Lou Gehrig" OR "ALS" OR "amyotrophic lateral sclerosis" ${query}`;

  const results = await fetchFreeResults(enhancedQuery, maxResults, lastRunAt);

  let newContentAdded = 0;
  let duplicatesFound = 0;
  const processedItems = [];

  for (const result of results) {
    if (newContentAdded >= maxResults) break;

    const contentHash = hashHex(result.snippet + result.title);

    const { data: existingContent } = await supabase
      .from('content_items')
      .select('id')
      .eq('content_hash', contentHash)
      .limit(1);
    if (existingContent && existingContent.length > 0) {
      duplicatesFound++;
      continue;
    }

    const { data: existingUrl } = await supabase
      .from('content_items')
      .select('id')
      .eq('source_url', result.url)
      .limit(1);
    if (existingUrl && existingUrl.length > 0) {
      duplicatesFound++;
      continue;
    }

    const wordCount = result.snippet.split(/\s+/).filter(Boolean).length;
    const relevanceScore = calculateRelevance(result.title, result.snippet);

    const { data: newItem, error: insertError } = await supabase
      .from('content_items')
      .insert({
        title: result.title,
        content_text: result.snippet,
        source_url: result.url,
        content_hash: contentHash,
        content_type: 'article',
        search_query: query,
        word_count: wordCount,
        relevance_score: relevanceScore,
        date_found: result.datePublished || nowIso(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      continue;
    }

    newContentAdded++;
    processedItems.push(newItem);

    const mediaUrls = extractMediaUrls(result.snippet);
    for (const mediaUrl of mediaUrls) {
      await supabase
        .from('media_files')
        .insert({
          content_item_id: newItem.id,
          media_url: mediaUrl,
          media_type: 'image',
          file_name: mediaUrl.split('/').pop() || '',
        });
    }
  }

  await supabase
    .from('search_sessions')
    .insert({
      search_query: query,
      search_provider: 'free-aggregator',
      results_found: results.length,
      new_content_added: newContentAdded,
      duplicates_found: duplicatesFound,
    });

  await supabase
    .from('search_state')
    .upsert({ id: 1, last_run_at: nowIso(), last_query: query });

  console.log(JSON.stringify({
    success: true,
    query,
    resultsFound: results.length,
    newContentAdded,
    duplicatesFound,
  }));
}

function calculateRelevance(title, snippet) {
  const keywords = ['lou gehrig', 'als', 'amyotrophic lateral sclerosis', 'iron horse', 'yankees'];
  const text = (title + ' ' + snippet).toLowerCase();
  let score = 0;
  for (const kw of keywords) if (text.includes(kw)) score += 2;
  return Math.min(Math.max(score, 1), 10);
}

function extractMediaUrls(content) {
  const imageRegex = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  return content.match(imageRegex) || [];
}

async function fetchFreeResults(query, limit, lastRunAt) {
  const tasks = [
    fetchGdelt(query, limit, lastRunAt),
    fetchWikipedia(query, Math.min(limit, 20)),
    fetchInternetArchive(query, Math.min(limit, 50), lastRunAt),
    fetchWikimediaCommons(query, Math.min(limit, 25)),
    fetchRssFeeds(getRssFeeds(), Math.min(limit, 50), lastRunAt),
  ];
  const nytKey = process.env.NYT_API_KEY;
  if (nytKey) tasks.push(fetchNYTimes(query, Math.min(limit, 25), lastRunAt, nytKey));

  const arrays = await Promise.all(tasks);
  const out = [];
  const seen = new Set();
  for (const arr of arrays) {
    for (const r of arr) {
      const key = r.url;
      if (key && !seen.has(key)) {
        out.push(r);
        seen.add(key);
        if (out.length >= limit) break;
      }
    }
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
}

function getRssFeeds() {
  const env = process.env.RSS_FEEDS;
  if (env && env.trim().length > 0) {
    return env.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [
    'https://www.mlb.com/feeds/news/rss.xml',
    'https://www.mlb.com/yankees/feeds/news/rss.xml'
  ];
}

async function fetchGdelt(query, limit, lastRunAt) {
  try {
    const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
    url.searchParams.set('query', query);
    url.searchParams.set('mode', 'ArtList');
    url.searchParams.set('maxrecords', String(Math.min(limit, 50)));
    url.searchParams.set('format', 'json');
    if (lastRunAt) {
      const dt = new Date(lastRunAt);
      const pad = (n, w = 2) => String(n).padStart(w, '0');
      const stamp = `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}`;
      url.searchParams.set('startdatetime', stamp);
    }
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const body = await res.json();
    const items = Array.isArray(body?.articles) ? body.articles : (Array.isArray(body?.documents) ? body.documents : []);
    const results = [];
    for (const it of items) {
      const title = it?.title || it?.name || '';
      const link = it?.url || it?.seendateurl || it?.link || '';
      if (!title || !link) continue;
      results.push({ title, url: link, snippet: it?.excerpt || it?.description || it?.text || '', datePublished: it?.seendate || it?.date || undefined });
      if (results.length >= limit) break;
    }
    return results;
  } catch (e) {
    console.error('GDELT error:', e);
    return [];
  }
}

async function fetchWikipedia(query, limit) {
  try {
    const url = new URL('https://en.wikipedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'search');
    url.searchParams.set('srsearch', query);
    url.searchParams.set('srlimit', String(Math.min(limit, 20)));
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const body = await res.json();
    const arr = Array.isArray(body?.query?.search) ? body.query.search : [];
    const results = [];
    for (const s of arr) {
      const title = s?.title;
      if (!title) continue;
      const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;
      const snippet = (s?.snippet || '').replace(/<[^>]+>/g, '');
      results.push({ title, url: pageUrl, snippet });
      if (results.length >= limit) break;
    }
    return results;
  } catch (e) {
    console.error('Wikipedia error:', e);
    return [];
  }
}

async function fetchInternetArchive(query, limit, lastRunAt) {
  try {
    const url = new URL('https://archive.org/advancedsearch.php');
    let q = query;
    if (lastRunAt) {
      const dt = new Date(lastRunAt);
      const iso = dt.toISOString().split('Z')[0] + 'Z';
      q = `${query} AND publicdate:[${iso} TO *]`;
    }
    url.searchParams.set('q', q);
    url.searchParams.set('output', 'json');
    url.searchParams.set('rows', String(Math.min(limit, 50)));
    url.searchParams.append('sort[]', 'publicdate desc');
    url.searchParams.append('fl[]', 'identifier');
    url.searchParams.append('fl[]', 'title');
    url.searchParams.append('fl[]', 'description');
    url.searchParams.append('fl[]', 'publicdate');
    url.searchParams.set('page', '1');

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const body = await res.json();
    const docs = Array.isArray(body?.response?.docs) ? body.response.docs : [];
    const results = [];
    for (const d of docs) {
      const identifier = d?.identifier;
      const title = d?.title || identifier;
      if (!identifier || !title) continue;
      const link = `https://archive.org/details/${encodeURIComponent(identifier)}`;
      const snippet = typeof d?.description === 'string' ? d.description : '';
      results.push({ title, url: link, snippet, datePublished: d?.publicdate });
      if (results.length >= limit) break;
    }
    return results;
  } catch (e) {
    console.error('Internet Archive error:', e);
    return [];
  }
}

async function fetchWikimediaCommons(query, limit) {
  try {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'search');
    url.searchParams.set('srsearch', query);
    url.searchParams.set('srnamespace', '6');
    url.searchParams.set('srlimit', String(Math.min(limit, 25)));
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const body = await res.json();
    const arr = Array.isArray(body?.query?.search) ? body.query.search : [];
    const results = [];
    for (const s of arr) {
      const title = s?.title;
      if (!title) continue;
      const pageUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;
      const snippet = (s?.snippet || '').replace(/<[^>]+>/g, '');
      results.push({ title, url: pageUrl, snippet });
      if (results.length >= limit) break;
    }
    return results;
  } catch (e) {
    console.error('Wikimedia Commons error:', e);
    return [];
  }
}

async function fetchNYTimes(query, limit, lastRunAt, apiKey) {
  try {
    const url = new URL('https://api.nytimes.com/svc/search/v2/articlesearch.json');
    url.searchParams.set('q', query);
    url.searchParams.set('sort', 'newest');
    url.searchParams.set('api-key', apiKey);
    if (lastRunAt) {
      const dt = new Date(lastRunAt);
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dt.getUTCDate()).padStart(2, '0');
      url.searchParams.set('begin_date', `${y}${m}${d}`);
    }
    url.searchParams.set('page', '0');
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const body = await res.json();
    const docs = Array.isArray(body?.response?.docs) ? body.response.docs : [];
    const results = [];
    for (const doc of docs) {
      const title = doc?.headline?.main || doc?.headline || '';
      const link = doc?.web_url || '';
      if (!title || !link) continue;
      const snippet = doc?.abstract || doc?.lead_paragraph || '';
      results.push({ title, url: link, snippet, datePublished: doc?.pub_date });
      if (results.length >= limit) break;
    }
    return results;
  } catch (e) {
    console.error('NYTimes error:', e);
    return [];
  }
}

async function fetchRssFeeds(feeds, limit, lastRunAt) {
  const items = [];
  const since = lastRunAt ? new Date(lastRunAt).getTime() : undefined;
  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl);
      if (!res.ok) continue;
      const xml = await res.text();
      const { DOMParser } = await import('@xmldom/xmldom');
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const channelItems = Array.from(doc.getElementsByTagName('item'));
      for (const it of channelItems) {
        const t = it.getElementsByTagName('title')[0]?.textContent?.trim() || '';
        const l = it.getElementsByTagName('link')[0]?.textContent?.trim() || '';
        const d = it.getElementsByTagName('description')[0]?.textContent?.trim() || '';
        const p = it.getElementsByTagName('pubDate')[0]?.textContent?.trim() || '';
        if (!t || !l) continue;
        if (since && p) {
          const tp = Date.parse(p);
          if (!Number.isNaN(tp) && tp < since) continue;
        }
        items.push({ title: t, url: l, snippet: d, datePublished: p });
        if (items.length >= limit) break;
      }
      if (items.length >= limit) break;
    } catch (e) {
      console.error('RSS error:', feedUrl, e);
    }
  }
  return items.slice(0, limit);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});