import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use environment variables or fallbacks like the app does
const SUPABASE_URL = process.env.SUPABASE_URL || 
                     process.env.VITE_SUPABASE_URL || 
                     'https://vkwhrbjkdznncjkzkiuo.supabase.co';

const SUPABASE_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY || 
                         process.env.VITE_SUPABASE_ANON_KEY ||
                         'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';

async function insertTestEvents() {
  console.log('🔗 Connecting to Supabase...');
  console.log('URL:', SUPABASE_URL);
  console.log('Key:', SUPABASE_API_KEY.substring(0, 20) + '...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

  try {
    // Load test events
    const eventsFile = join(__dirname, 'sample-events.json');
    const events = JSON.parse(readFileSync(eventsFile, 'utf8'));
    
    console.log(`📅 Inserting ${events.length} test events...`);

    // Insert events one by one to get better error messages
    let successCount = 0;
    for (const event of events) {
      try {
        const { data, error } = await supabase
          .from('events')
          .insert(event)
          .select('id, title');
        
        if (error) {
          console.log(`❌ Failed to insert "${event.title}":`, error.message);
        } else {
          console.log(`✅ Inserted "${event.title}" (${data?.[0]?.id})`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Exception inserting "${event.title}":`, err.message);
      }
    }

    console.log(`\n📊 Results: ${successCount}/${events.length} events inserted successfully`);

    // Test querying events
    console.log('\n🔍 Testing event query...');
    const { data: queryData, error: queryError } = await supabase
      .from('events')
      .select('id, title, start_at, location, is_club_event')
      .eq('is_club_event', true)
      .gte('start_at', new Date(Date.now() - 24*60*60*1000).toISOString())
      .order('start_at', { ascending: true })
      .limit(5);

    if (queryError) {
      console.log('❌ Query failed:', queryError.message);
    } else {
      console.log(`✅ Query successful: Found ${queryData?.length || 0} upcoming events`);
      queryData?.forEach(event => {
        console.log(`  - ${event.title} at ${event.location} (${new Date(event.start_at).toLocaleDateString()})`);
      });
    }

  } catch (error) {
    console.log('❌ Connection or setup error:', error.message);
    return false;
  }

  return true;
}

// Run the script
insertTestEvents().catch(err => {
  console.error('💥 Script failed:', err.message);
  process.exit(1);
});