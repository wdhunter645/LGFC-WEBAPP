/*
  Lou Gehrig Content Search Edge Function
  
  This function performs web searches and processes results to identify
  new Lou Gehrig-related content while avoiding duplicates.
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
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const { query, maxResults = 10 }: SearchRequest = await req.json();
    const limit = Math.max(1, Math.min(Number(maxResults) || 10, 100));
    
    if (!query) {
      return new Response(JSON.stringify({ error: "Query parameter is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Enhanced query with Lou Gehrig context
    const enhancedQuery = `"Lou Gehrig" OR "ALS" OR "amyotrophic lateral sclerosis" ${query}`;
    
    // For demo purposes, we'll simulate search results
    // In production, you would integrate with Bing Search API, Google Custom Search, or similar
    const mockSearchResults: SearchResult[] = [
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

    // Create hash function for deduplication
    const createContentHash = (content: string): string => {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      return Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    let newContentAdded = 0;
    let duplicatesFound = 0;
    const processedItems = [];

    // Process each search result
    let processedCount = 0;
    for (const result of mockSearchResults) {
      if (processedCount >= limit) break;
      const contentHash = createContentHash(result.snippet + result.title);
      
      // Check for duplicates
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

      // Insert new content item
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

      // Extract and store media URLs (simulate image extraction)
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

    // Record search session
    await supabase
      .from('search_sessions')
      .insert({
        search_query: query,
        search_provider: 'mock',
        results_found: mockSearchResults.length,
        new_content_added: newContentAdded,
        duplicates_found: duplicatesFound,
      });

    return new Response(JSON.stringify({
      success: true,
      query,
      resultsFound: mockSearchResults.length,
      newContentAdded,
      duplicatesFound,
      processedItems,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Search function error:', error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper function to extract media URLs from content
function extractMediaUrls(content: string): string[] {
  const imageRegex = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)/gi;
  return content.match(imageRegex) || [];
}