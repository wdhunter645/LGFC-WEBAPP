/*
  Lou Gehrig Content Search Edge Function
  - Live search via Bing if SEARCH_API_KEY is set; otherwise uses free sources (GDELT + Wikipedia)
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SearchRequest {
  query: string;
  maxResults?: number;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  datePublished?: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    const { query, maxResults = 10 }: SearchRequest = await req.json();
    const limit = Math.max(1, Math.min(Number(maxResults) || 10, 100));

    if (!query) {
      return new Response(JSON.stringify({ error: "Query parameter is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const enhancedQuery = `"Lou Gehrig" OR "ALS" OR "amyotrophic lateral sclerosis" ${query}`;

    // Read last run time for incremental search
    const { data: stateRows } = await supabase.from('search_state').select('last_run_at').eq('id', 1).limit(1);
    const lastRunAt: string | null = (stateRows && stateRows[0]?.last_run_at) || null;

    const results = await fetchSearchResults(enhancedQuery, limit, supabase, lastRunAt || undefined);

    const createContentHash = (content: string): string => {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      return Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    let newContentAdded = 0;
    let duplicatesFound = 0;
    const processedItems: unknown[] = [];

    let processedCount = 0;
    for (const result of results) {
      if (processedCount >= limit) break;

      const contentHash = createContentHash(result.snippet + result.title);

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

      const relevanceScore = calculateRelevance(result.title, result.snippet);
      const wordCount = result.snippet.split(' ').length;

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
          date_found: result.datePublished || new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting content item:', insertError);
        continue;
      }

      newContentAdded++;
      processedCount++;
      processedItems.push(newItem);

      const mediaUrls = extractMediaUrls(result.snippet);
      for (const mediaUrl of mediaUrls) {
        await supabase
          .from('media_files')
          .insert({
            content_item_id: (newItem as any).id,
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
        search_provider: inferProvider(),
        results_found: results.length,
        new_content_added: newContentAdded,
        duplicates_found: duplicatesFound,
      });

    // Update last_run_at
    await supabase.from('search_state').upsert({ id: 1, last_run_at: new Date().toISOString(), last_query: query });

    return new Response(JSON.stringify({
      success: true,
      query,
      resultsFound: results.length,
      newContentAdded,
      duplicatesFound,
      processedItems,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Search function error:', error);
    return new Response(JSON.stringify({ error: "Internal server error", details: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function inferProvider(): string {
  const apiKey = Deno.env.get('SEARCH_API_KEY');
  const provider = (Deno.env.get('SEARCH_API_PROVIDER') || '').toLowerCase();
  if (apiKey && provider) return provider;
  return 'free-aggregator';
}

function calculateRelevance(title: string, snippet: string): number {
  const keywords = ['lou gehrig', 'als', 'amyotrophic lateral sclerosis', 'iron horse', 'yankees'];
  const text = (title + ' ' + snippet).toLowerCase();
  let score = 0;
  keywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });
  return Math.min(Math.max(score, 1), 10);
}

async function fetchSearchResults(query: string, limit: number, supabase: ReturnType<typeof createClient>, lastRunAt?: string): Promise<SearchResult[]> {
  const apiKey = Deno.env.get('SEARCH_API_KEY');
  const provider = (Deno.env.get('SEARCH_API_PROVIDER') || 'BING').toUpperCase();

  if (apiKey) {
    if (provider === 'BING') {
      return await fetchBingResults(query, limit, apiKey);
    }
  }

  // Free aggregator path (no API key required)
  const free = await fetchFreeResults(query, limit, lastRunAt);
  if (free.length > 0) return free.slice(0, limit);
  // Last resort (should be rare)
  return mockResults().slice(0, limit);
}

async function fetchBingResults(query: string, limit: number, apiKey: string): Promise<SearchResult[]> {
  try {
    const results: SearchResult[] = [];
    const newsUrl = new URL('https://api.bing.microsoft.com/v7.0/news/search');
    newsUrl.searchParams.set('q', query);
    newsUrl.searchParams.set('count', String(limit));
    const newsRes = await fetch(newsUrl.toString(), {
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
    });
    if (newsRes.ok) {
      const body = await newsRes.json();
      const values = Array.isArray(body?.value) ? body.value : [];
      for (const v of values) {
        if (results.length >= limit) break;
        if (!v?.name || !v?.url) continue;
        results.push({
          title: v.name,
          url: v.url,
          snippet: v.description || '',
          datePublished: v.datePublished,
        });
      }
    }

    if (results.length < limit) {
      const webUrl = new URL('https://api.bing.microsoft.com/v7.0/search');
      webUrl.searchParams.set('q', query);
      webUrl.searchParams.set('count', String(limit - results.length));
      const webRes = await fetch(webUrl.toString(), {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      });
      if (webRes.ok) {
        const body = await webRes.json();
        const values = Array.isArray(body?.webPages?.value) ? body.webPages.value : [];
        for (const v of values) {
          if (results.length >= limit) break;
          if (!v?.name || !v?.url) continue;
          results.push({
            title: v.name,
            url: v.url,
            snippet: v.snippet || '',
            datePublished: v.dateLastCrawled,
          });
        }
      }
    }

    return results.slice(0, limit);
  } catch (e) {
    console.error('Bing search error:', e);
    return [];
  }
}

async function fetchFreeResults(query: string, limit: number, lastRunAt?: string): Promise<SearchResult[]> {
  const merged: SearchResult[] = [];
  try {
    const rssFeeds = getRssFeeds();
    const tasks: Promise<SearchResult[]>[] = [
      fetchGdelt(query, limit, lastRunAt),
      fetchWikipedia(query, Math.min(limit, 20)),
      fetchInternetArchive(query, Math.min(limit, 50), lastRunAt),
      fetchWikimediaCommons(query, Math.min(limit, 25)),
      fetchRssFeeds(rssFeeds, Math.min(limit, 50), lastRunAt),
    ];
    const nytKey = Deno.env.get('NYT_API_KEY') || Deno.env.get('NYTIMES_API_KEY');
    if (nytKey) tasks.push(fetchNYTimes(query, Math.min(limit, 25), lastRunAt, nytKey));

    const resultsArrays = await Promise.all(tasks);
    const seen = new Set<string>();
    for (const arr of resultsArrays) {
      for (const r of arr) {
        const key = r.url;
        if (key && !seen.has(key)) {
          merged.push(r);
          seen.add(key);
          if (merged.length >= limit) break;
        }
      }
      if (merged.length >= limit) break;
    }
  } catch (e) {
    console.error('Free results error:', e);
  }
  return merged.slice(0, limit);
}

function getRssFeeds(): string[] {
  const env = Deno.env.get('RSS_FEEDS');
  if (env && env.trim().length > 0) {
    return env.split(',').map(s => s.trim()).filter(Boolean);
  }
  // Defaults: MLB + Yankees news feeds
  return [
    'https://www.mlb.com/feeds/news/rss.xml',
    'https://www.mlb.com/yankees/feeds/news/rss.xml'
  ];
}

async function fetchWikimediaCommons(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'search');
    url.searchParams.set('srsearch', query);
    url.searchParams.set('srnamespace', '6'); // File namespace
    url.searchParams.set('srlimit', String(Math.min(limit, 25)));
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const body = await res.json();
    const arr = Array.isArray(body?.query?.search) ? body.query.search : [];
    const out: SearchResult[] = [];
    for (const s of arr) {
      const title = s?.title; // e.g., File:...
      if (!title) continue;
      const pageUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;
      const snippet = (s?.snippet || '').replace(/<[^>]+>/g, '');
      out.push({ title, url: pageUrl, snippet });
      if (out.length >= limit) break;
    }
    return out;
  } catch (e) {
    console.error('Wikimedia Commons error:', e);
    return [];
  }
}

async function fetchNYTimes(query: string, limit: number, lastRunAt: string | undefined, apiKey: string): Promise<SearchResult[]> {
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
    const out: SearchResult[] = [];
    for (const doc of docs) {
      const title = doc?.headline?.main || doc?.headline || '';
      const link = doc?.web_url || '';
      if (!title || !link) continue;
      const snippet = doc?.abstract || doc?.lead_paragraph || '';
      out.push({ title, url: link, snippet, datePublished: doc?.pub_date });
      if (out.length >= limit) break;
    }
    return out;
  } catch (e) {
    console.error('NYTimes error:', e);
    return [];
  }
}

async function fetchRssFeeds(feeds: string[], limit: number, lastRunAt?: string): Promise<SearchResult[]> {
  const items: SearchResult[] = [];
  const since = lastRunAt ? new Date(lastRunAt).getTime() : undefined;

  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl);
      if (!res.ok) continue;
      const xml = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const channelItems = Array.from(doc.querySelectorAll('item'));
      for (const it of channelItems) {
        const title = it.querySelector('title')?.textContent?.trim() || '';
        const link = it.querySelector('link')?.textContent?.trim() || '';
        const desc = it.querySelector('description')?.textContent?.trim() || '';
        const pubDate = it.querySelector('pubDate')?.textContent?.trim() || '';
        if (!title || !link) continue;
        if (since && pubDate) {
          const t = Date.parse(pubDate);
          if (!Number.isNaN(t) && t < since) continue;
        }
        items.push({ title, url: link, snippet: desc, datePublished: pubDate });
        if (items.length >= limit) break;
      }
      if (items.length >= limit) break;
    } catch (e) {
      console.error('RSS error:', feedUrl, e);
    }
  }

  return items.slice(0, limit);
}

async function fetchInternetArchive(query: string, limit: number, lastRunAt?: string): Promise<SearchResult[]> {
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

    const results: SearchResult[] = [];
    for (const d of docs) {
      const identifier = d?.identifier;
      const title = d?.title || identifier;
      if (!identifier || !title) continue;
      const link = `https://archive.org/details/${encodeURIComponent(identifier)}`;
      const snippet = typeof d?.description === 'string' ? d.description : '';
      results.push({
        title,
        url: link,
        snippet,
        datePublished: d?.publicdate,
      });
      if (results.length >= limit) break;
    }
    return results;
  } catch (e) {
    console.error('Internet Archive error:', e);
    return [];
  }
}

async function fetchGdelt(query: string, limit: number, lastRunAt?: string): Promise<SearchResult[]> {
  try {
    const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
    url.searchParams.set('query', query);
    url.searchParams.set('mode', 'ArtList');
    url.searchParams.set('maxrecords', String(Math.min(limit, 50)));
    url.searchParams.set('format', 'json');
    if (lastRunAt) {
      // GDELT expects YYYYMMDDHHMMSS (UTC)
      const dt = new Date(lastRunAt);
      const pad = (n: number, w = 2) => String(n).padStart(w, '0');
      const stamp = `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}`;
      url.searchParams.set('startdatetime', stamp);
    }

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const body = await res.json();
    const items = Array.isArray(body?.articles) ? body.articles : (Array.isArray(body?.documents) ? body.documents : []);

    const results: SearchResult[] = [];
    for (const it of items) {
      const title = it?.title || it?.name || '';
      const link = it?.url || it?.seendateurl || it?.link || '';
      if (!title || !link) continue;
      results.push({
        title,
        url: link,
        snippet: it?.excerpt || it?.description || it?.text || '',
        datePublished: it?.seendate || it?.date || undefined,
      });
      if (results.length >= limit) break;
    }
    return results;
  } catch (e) {
    console.error('GDELT error:', e);
    return [];
  }
}

async function fetchWikipedia(query: string, limit: number): Promise<SearchResult[]> {
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
    const results: SearchResult[] = [];
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

function mockResults(): SearchResult[] {
  return [
    {
      title: "Lou Gehrig's Farewell Speech: A Legacy of Courage",
      url: "https://example.com/lou-gehrig-farewell-speech",
      snippet: "On July 4, 1939, Lou Gehrig delivered one of the most memorable speeches in sports history at Yankee Stadium. Despite his diagnosis with ALS, he considered himself 'the luckiest man on the face of the earth.'",
      datePublished: "2023-07-04"
    },
    {
      title: "Understanding ALS: The Disease That Bears Lou Gehrig's Name",
      url: "https://example.com/understanding-als-lou-gehrig-disease",
      snippet: "Amyotrophic lateral sclerosis (ALS), often called Lou Gehrig's disease, is a progressive neurodegenerative disease that affects nerve cells in the brain and spinal cord.",
      datePublished: "2023-08-15"
    },
    {
      title: "Yankees Honor Lou Gehrig: The Iron Horse's Enduring Impact",
      url: "https://example.com/yankees-honor-lou-gehrig-legacy",
      snippet: "The New York Yankees continue to honor Lou Gehrig's memory through various initiatives, including Lou Gehrig Day and support for ALS research.",
      datePublished: "2023-06-02"
    }
  ];
}

function extractMediaUrls(content: string): string[] {
  const imageRegex = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  return content.match(imageRegex) || [];
}