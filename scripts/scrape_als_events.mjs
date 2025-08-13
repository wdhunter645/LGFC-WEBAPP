#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ALS Community Event Sources
const ALS_EVENT_SOURCES = [
  {
    name: 'ALS Association',
    url: 'https://www.als.org/events',
    type: 'html'
  },
  {
    name: 'I AM ALS',
    url: 'https://www.iamals.org/events/',
    type: 'html'
  },
  {
    name: 'ALS CURE Project',
    url: 'https://www.alscure.org/events',
    type: 'html'
  },
  {
    name: 'Live Like Lou',
    url: 'https://www.livelikelou.org/events',
    type: 'html'
  }
];

function nowIso() {
  return new Date().toISOString();
}

function parseDate(dateStr) {
  // Try various date formats
  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})/, // Month DD, YYYY
    /(\d{1,2})\s+(\w+)\s+(\d{4})/ // DD Month YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      // Convert to ISO date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }
  
  return null;
}

async function scrapeHtmlEvents(source) {
  try {
    console.log(`Scraping ${source.name}...`);
    const response = await fetch(source.url);
    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const events = [];
    
    // Generic selectors for common event patterns
    const selectors = [
      '.event', '.event-item', '.calendar-event', '.event-card',
      '[class*="event"]', '[class*="calendar"]'
    ];
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        const $el = $(el);
        
        // Try to extract event information
        const title = $el.find('h1, h2, h3, h4, .title, [class*="title"]').first().text().trim();
        const dateText = $el.find('.date, .time, [class*="date"], [class*="time"]').first().text().trim();
        const location = $el.find('.location, .venue, [class*="location"], [class*="venue"]').first().text().trim();
        const link = $el.find('a').first().attr('href');
        const description = $el.find('.description, .summary, [class*="description"], [class*="summary"]').first().text().trim();
        
        if (title && dateText) {
          const startAt = parseDate(dateText);
          if (startAt) {
            events.push({
              title,
              start_at: startAt,
              location: location || null,
              link_url: link ? new URL(link, source.url).href : null,
              description: description || null,
              source: source.name,
              is_club_event: false
            });
          }
        }
      });
      
      if (events.length > 0) break; // Found events with this selector
    }
    
    console.log(`Found ${events.length} events from ${source.name}`);
    return events;
  } catch (error) {
    console.error(`Error scraping ${source.name}:`, error.message);
    return [];
  }
}

async function updateEventMissCount(eventId, missed = true) {
  try {
    if (missed) {
      // Increment miss count
      await supabase.rpc('increment_event_miss_count', { event_id: eventId });
    } else {
      // Reset miss count
      await supabase
        .from('events')
        .update({ miss_count: 0 })
        .eq('id', eventId);
    }
  } catch (error) {
    console.error('Error updating miss count:', error.message);
  }
}

async function removeExpiredEvents() {
  try {
    // Remove events with 3 or more misses
    const { data, error } = await supabase
      .from('events')
      .delete()
      .gte('miss_count', 3)
      .eq('is_club_event', false);
    
    if (error) {
      console.error('Error removing expired events:', error.message);
    } else {
      console.log(`Removed ${data?.length || 0} expired events`);
    }
  } catch (error) {
    console.error('Error in removeExpiredEvents:', error.message);
  }
}

async function processEvents(newEvents) {
  let added = 0;
  let updated = 0;
  
  for (const event of newEvents) {
    try {
      // Check if event already exists (by title and date)
      const { data: existing } = await supabase
        .from('events')
        .select('id, miss_count')
        .eq('title', event.title)
        .eq('start_at', event.start_at)
        .eq('is_club_event', false)
        .limit(1);
      
      if (existing && existing.length > 0) {
        // Event exists, reset miss count
        await updateEventMissCount(existing[0].id, false);
        updated++;
      } else {
        // New event, add it
        const { error } = await supabase
          .from('events')
          .insert({
            ...event,
            miss_count: 0
          });
        
        if (error) {
          console.error('Error inserting event:', error.message);
        } else {
          added++;
        }
      }
    } catch (error) {
      console.error('Error processing event:', error.message);
    }
  }
  
  return { added, updated };
}

async function markMissingEvents() {
  try {
    // Get all non-club events that weren't found in this scrape
    const { data: existingEvents } = await supabase
      .from('events')
      .select('id, title, miss_count')
      .eq('is_club_event', false);
    
    if (!existingEvents) return;
    
    // Mark events as missed (they'll be removed after 3 misses)
    for (const event of existingEvents) {
      await updateEventMissCount(event.id, true);
    }
    
    console.log(`Marked ${existingEvents.length} existing events as potentially missed`);
  } catch (error) {
    console.error('Error marking missing events:', error.message);
  }
}

async function main() {
  console.log('Starting ALS Events Scraper...');
  console.log(`Time: ${nowIso()}`);
  
  try {
    // First, mark all existing events as potentially missed
    await markMissingEvents();
    
    // Scrape events from all sources
    const allEvents = [];
    for (const source of ALS_EVENT_SOURCES) {
      if (source.type === 'html') {
        const events = await scrapeHtmlEvents(source);
        allEvents.push(...events);
      }
      // Add more source types here as needed (RSS, API, etc.)
    }
    
    console.log(`Total events found: ${allEvents.length}`);
    
    // Process and store events
    const { added, updated } = await processEvents(allEvents);
    console.log(`Added: ${added}, Updated: ${updated}`);
    
    // Remove events that have been missed 3 times
    await removeExpiredEvents();
    
    // Log completion
    console.log('ALS Events Scraper completed successfully');
    
  } catch (error) {
    console.error('ALS Events Scraper failed:', error);
    process.exit(1);
  }
}

// Run the scraper
main();