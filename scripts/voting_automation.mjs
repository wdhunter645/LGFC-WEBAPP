#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getCurrentRound() {
  const { data, error } = await supabase.rpc('get_current_voting_round');
  if (error) {
    console.error('Error getting current round:', error);
    return null;
  }
  return data?.[0] || null;
}

async function endCurrentRound(roundId) {
  console.log(`Ending round ${roundId}...`);
  const { data, error } = await supabase.rpc('end_voting_round', { round_id: roundId });
  if (error) {
    console.error('Error ending round:', error);
    return null;
  }
  return data;
}

async function getWinnerImages() {
  // Get all completed rounds with winners
  const { data, error } = await supabase
    .from('voting_rounds')
    .select('winner_image_id')
    .eq('status', 'completed')
    .not('winner_image_id', 'is', null);
  
  if (error) {
    console.error('Error getting winner images:', error);
    return [];
  }
  
  return data.map(row => row.winner_image_id);
}

async function getAllImages() {
  // Get all available images for initial rounds
  const { data, error } = await supabase
    .from('media_files')
    .select('id')
    .eq('media_type', 'image');
  
  if (error) {
    console.error('Error getting all images:', error);
    return [];
  }
  
  return data.map(row => row.id);
}

async function startNewRound(roundNumber, imageIds) {
  console.log(`Starting round ${roundNumber} with ${imageIds.length} images...`);
  const { data, error } = await supabase.rpc('start_voting_round', {
    round_number: roundNumber,
    image_ids: imageIds
  });
  
  if (error) {
    console.error('Error starting new round:', error);
    return null;
  }
  
  return data;
}

async function getNextRoundNumber() {
  const { data, error } = await supabase
    .from('voting_rounds')
    .select('round_number')
    .order('round_number', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('Error getting next round number:', error);
    return 1;
  }
  
  return (data?.[0]?.round_number || 0) + 1;
}

async function main() {
  console.log('Starting voting automation...');
  
  try {
    // 1. Check if there's a current active round
    const currentRound = await getCurrentRound();
    
    if (currentRound) {
      console.log(`Found active round ${currentRound.round_number} (${currentRound.round_id})`);
      
      // Check if round should end (past Sunday)
      const today = new Date();
      const endDate = new Date(currentRound.end_date);
      
      if (today > endDate) {
        console.log('Round has ended, determining winner...');
        const winnerId = await endCurrentRound(currentRound.round_id);
        console.log(`Winner determined: ${winnerId}`);
      } else {
        console.log('Round is still active, no action needed');
        return;
      }
    }
    
    // 2. Get images for new round
    let imageIds = [];
    const winnerImages = await getWinnerImages();
    
    if (winnerImages.length >= 2) {
      // Use winner images for subsequent rounds
      console.log(`Using ${winnerImages.length} winner images for new round`);
      imageIds = winnerImages;
    } else {
      // Use all available images for initial rounds
      console.log('No previous winners, using all available images');
      imageIds = await getAllImages();
    }
    
    if (imageIds.length < 2) {
      console.log('Not enough images available for voting round');
      return;
    }
    
    // 3. Start new round
    const nextRoundNumber = await getNextRoundNumber();
    const newRoundId = await startNewRound(nextRoundNumber, imageIds);
    
    if (newRoundId) {
      console.log(`New round ${nextRoundNumber} started successfully: ${newRoundId}`);
    } else {
      console.error('Failed to start new round');
    }
    
  } catch (error) {
    console.error('Voting automation failed:', error);
    process.exit(1);
  }
}

main();