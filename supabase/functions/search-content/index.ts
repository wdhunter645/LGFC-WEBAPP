/*
  Lou Gehrig Content Search Edge Function
  - Live search via Bing if SEARCH_API_KEY is set; otherwise uses mock data
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

    // Initialize Supabase client (Edge runtime provides these secrets)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const enhancedQuery = `"Lou Gehrig" OR "ALS" OR "amyotrophic lateral sclerosis" ${query}`;

    // Try live search first if API key is set, otherwise use mock results
    const results = await fetchSearchResults(enhancedQuery, limit);

    // Create hash function for deduplication
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

      // Check for duplicates by hash
      const { data: existingContent } = await supabase
        .from('content_items')
        .select('id')
        .eq('content_hash', contentHash)
        .limit(1);
      if (existingContent && existingContent.length > 0) {
        duplicatesFound++;
        continue;
      }

      // Check for duplicate URLs
      const { data: existingUrl } = await supabase
        .from('content_items')
        .select('id')
        .eq('source_url', result.url)
        .limit(1);
      if (existingUrl && existingUrl.length > 0) {
        duplicatesFound++;
        continue;
      }

      // Calculate relevance score based on content
      const calculateRelevance = (title: string, snippet: string): number => {
        const keywords = ['lou gehrig', 'als', 'amyotrophic lateral sclerosis', 'iron horse', 'yankees'];
        const text = (title + ' ' + snippet).toLowerCase();
        let score = 0;
        keywords.forEach(keyword => {
          if (text.includes(keyword)) score += 2;
        });
        return Math.min(Math.max(score, 1), 10);
      };

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

      // Extract and store media URLs
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

    // Record search session
    await supabase
      .from('search_sessions')
      .insert({
        search_query: query,
        search_provider: (Deno.env.get('SEARCH_API_PROVIDER') || 'mock').toLowerCase(),
        results_found: results.length,
        new_content_added: newContentAdded,
        duplicates_found: duplicatesFound,
      });

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

async function fetchSearchResults(query: string, limit: number): Promise<SearchResult[]> {
  const apiKey = Deno.env.get('SEARCH_API_KEY');
  const provider = (Deno.env.get('SEARCH_API_PROVIDER') || 'BING').toUpperCase();

  if (!apiKey) {
    return mockResults().slice(0, limit);
  }

  if (provider === 'BING') {
    try {
      // Try Bing News first
      const newsUrl = new URL('https://api.bing.microsoft.com/v7.0/news/search');
      newsUrl.searchParams.set('q', query);
      newsUrl.searchParams.set('count', String(limit));
      const newsRes = await fetch(newsUrl.toString(), {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      });

      const results: SearchResult[] = [];
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

      // If we still need more, use Bing Web Search
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
      return mockResults().slice(0, limit);
    }
  }

  // Default fallback
  return mockResults().slice(0, limit);
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

// Helper: extract media URLs from text
function extractMediaUrls(content: string): string[] {
  const imageRegex = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  return content.match(imageRegex) || [];
}