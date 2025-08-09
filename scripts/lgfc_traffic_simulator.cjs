#!/usr/bin/env node

/**
 * Lou Gehrig Fan Club - Enhanced Production Traffic Simulator 
 * 
 * NOW WITH VARIABLE LOAD PATTERNS for realistic Supabase metrics
 * - Rush hour simulation (high traffic bursts)
 * - Lunch break drops (low activity periods)
 * - Random visitor spikes
 * - Heavy vs light user sessions
 * 
 * Usage: node scripts/lgfc_traffic_simulator.cjs --duration=300 --users=50
 */

const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

// Enhanced configuration with load variability
const config = {
  duration: parseInt(process.argv.find(arg => arg.startsWith('--duration='))?.split('=')[1]) || 180,
  maxConcurrentUsers: parseInt(process.argv.find(arg => arg.startsWith('--users='))?.split('=')[1]) || 25,
  baseDelay: 2000,
  variancePercent: 0.4,
  
  // NEW: Variable load patterns
  loadPatterns: {
    rushHour: { multiplier: 3.0, duration: 30000, probability: 0.3 },
    lunchDrop: { multiplier: 0.3, duration: 20000, probability: 0.2 },
    normalTraffic: { multiplier: 1.0, duration: 15000, probability: 0.4 },
    flashSpike: { multiplier: 5.0, duration: 10000, probability: 0.1 }
  }
};

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  console.error('   In Codespaces, check your .env file or repository secrets');
  process.exit(1);
}

// Simple Supabase client implementation
class SupabaseClient {
  constructor(url, key) {
    this.url = url.replace(/\/$/, '');
    this.key = key;
    this.restUrl = `${this.url}/rest/v1`;
  }

  async makeHttpsRequest(url, options) {
    const https = require("https");
    const urlObj = new URL(url);
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || "GET",
        headers: options.headers || {}
      }, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          json: () => Promise.resolve(JSON.parse(data))
        }));
      });
      if (options.body) req.write(options.body);
      req.on("error", reject);
      req.end();
    });
  }

  async request(method, path, body = null, params = {}) {
    const url = new URL(`${this.restUrl}${path}`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });

    const options = {
      method,
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await this.makeHttpsRequest(url.toString(), options);
      const data = response.ok ? await response.json().catch(() => null) : null;
      
      return {
        data,
        error: response.ok ? null : { 
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status 
        }
      };
    } catch (err) {
      return {
        data: null,
        error: { message: err.message, status: 0 }
      };
    }
  }

  from(table) {
    return new QueryBuilder(this, table);
  }
}

class QueryBuilder {
  constructor(client, table) {
    this.client = client;
    this.table = table;
    this.params = {};
  }

  select(columns = '*') {
    this.params.select = columns;
    return this;
  }

  limit(count) {
    this.params.limit = count;
    return this;
  }

  order(column, options = {}) {
    const direction = options.ascending === false ? 'desc' : 'asc';
    this.params.order = `${column}.${direction}`;
    return this;
  }

  gte(column, value) {
    this.params[`${column}`] = `gte.${value}`;
    return this;
  }

  async insert(data) {
    const body = Array.isArray(data) ? data : [data];
    return await this.client.request('POST', `/${this.table}`, body);
  }

  async execute() {
    return await this.client.request('GET', `/${this.table}`, null, this.params);
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

// Enhanced user actions with variable intensities
const userActions = {
  browseHomepage: { 
    weight: 25, 
    reads: ['admin_posts', 'milestones'],
    intensity: 'light',
    queriesPerAction: 2
  },
  viewPhotoGallery: { 
    weight: 20, 
    reads: ['media_assets', 'media_locations'],
    intensity: 'medium',
    queriesPerAction: 5
  },
  readBiography: { 
    weight: 15, 
    reads: ['admin_posts', 'milestones'],
    intensity: 'light',
    queriesPerAction: 3
  },
  alsAwarenessPage: { 
    weight: 12, 
    reads: ['als_messages', 'milestones'],
    intensity: 'light',
    queriesPerAction: 2
  },
  photoMatchupGame: { 
    weight: 10, 
    reads: ['photo_matchups'], 
    writes: ['photo_matchups'],
    intensity: 'heavy',
    queriesPerAction: 8
  },
  userSignup: { 
    weight: 8, 
    writes: ['users'], 
    reads: [],
    intensity: 'medium',
    queriesPerAction: 4
  },
  submitUserContent: { 
    weight: 5, 
    writes: ['approved_user_content'], 
    reads: ['users'],
    intensity: 'heavy',
    queriesPerAction: 6
  },
  heavyDataMining: {
    weight: 3,
    reads: ['admin_posts', 'media_assets', 'milestones', 'users'],
    intensity: 'extreme',
    queriesPerAction: 15
  },
  adminDashboard: { 
    weight: 2, 
    reads: ['users', 'admin_tasks', 'admin_posts', 'approved_user_content'],
    intensity: 'heavy',
    queriesPerAction: 10
  }
};

const sampleUsers = [
  { full_name: 'Baseball Fan', email: 'fan@example.com' },
  { full_name: 'History Buff', email: 'history@example.com' },
  { full_name: 'Yankees Lover', email: 'yankees@example.com' },
  { full_name: 'ALS Supporter', email: 'support@example.com' },
  { full_name: 'Data Researcher', email: 'research@example.com' }
];

const sampleContent = [
  'Great article about Lou Gehrig!',
  'His speech still gives me chills',
  'Luckiest man on the face of the earth',
  'Iron Horse forever',
  'Never forget his courage',
  'Amazing historical documentation',
  'This archive is incredible',
  'Thank you for preserving his legacy'
];

class VariableLoadTrafficSimulator {
  constructor() {
    this.activeUsers = 0;
    this.totalRequests = 0;
    this.errors = 0;
    this.startTime = Date.now();
    this.currentLoadPattern = 'normalTraffic';
    this.patternStartTime = Date.now();
    this.stats = {
      reads: 0,
      writes: 0,
      actions: {},
      tableHits: {},
      loadPatterns: {},
      peakConcurrentUsers: 0,
      heavyOperations: 0
    };
  }

  // NEW: Dynamic load pattern management
  updateLoadPattern() {
    const patternAge = Date.now() - this.patternStartTime;
    const currentPattern = config.loadPatterns[this.currentLoadPattern];
    
    if (patternAge > currentPattern.duration) {
      // Time to switch patterns
      const random = Math.random();
      let cumulative = 0;
      
      for (const [patternName, pattern] of Object.entries(config.loadPatterns)) {
        cumulative += pattern.probability;
        if (random <= cumulative) {
          this.currentLoadPattern = patternName;
          this.patternStartTime = Date.now();
          this.stats.loadPatterns[patternName] = (this.stats.loadPatterns[patternName] || 0) + 1;
          console.log(`🔄 Load Pattern Change: ${patternName} (${pattern.multiplier}x traffic)`);
          break;
        }
      }
    }
  }

  getCurrentLoadMultiplier() {
    return config.loadPatterns[this.currentLoadPattern].multiplier;
  }

  getVariableDelay(baseMs = config.baseDelay) {
    const loadMultiplier = this.getCurrentLoadMultiplier();
    const adjustedBase = baseMs / loadMultiplier; // Higher load = faster actions
    const variance = adjustedBase * config.variancePercent;
    return Math.max(100, adjustedBase + (Math.random() * variance * 2 - variance));
  }

  selectUserAction() {
    const totalWeight = Object.values(userActions).reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [actionName, action] of Object.entries(userActions)) {
      random -= action.weight;
      if (random <= 0) {
        return { name: actionName, ...action };
      }
    }
    
    return { name: 'browseHomepage', ...userActions.browseHomepage };
  }

  generateUUID() {
    return crypto.randomUUID();
  }

  async performReads(tables, sessionId, action) {
    const queriesPerTable = Math.ceil(action.queriesPerAction / Math.max(tables.length, 1));
    
    for (const table of tables) {
      // Perform multiple queries per table based on action intensity
      for (let i = 0; i < queriesPerTable; i++) {
        try {
          this.stats.tableHits[table] = (this.stats.tableHits[table] || 0) + 1;
          
          let query = supabase.from(table).select('*');
          
          // Add more complex queries for heavy operations
          switch (table) {
            case 'admin_posts':
              if (action.intensity === 'heavy' || action.intensity === 'extreme') {
                // Complex query with ordering and large limits
                query = query.order('created_at', { ascending: false }).limit(50 + Math.floor(Math.random() * 100));
              } else {
                query = query.order('created_at', { ascending: false }).limit(10);
              }
              break;
              
            case 'media_assets':
              if (action.intensity === 'extreme') {
                // Very large query to stress the database
                query = query.limit(200);
              } else if (action.intensity === 'heavy') {
                query = query.limit(50);
              } else {
                query = query.limit(20);
              }
              break;
              
            case 'milestones':
              const today = new Date().toISOString().split('T')[0];
              query = query.gte('milestone_date', today).limit(action.intensity === 'extreme' ? 50 : 5);
              break;
              
            case 'users':
              if (action.intensity === 'extreme') {
                // Heavy user data mining
                query = query.limit(100).order('created_at', { ascending: false });
              } else {
                query = query.limit(10);
              }
              break;
              
            default:
              query = query.limit(action.intensity === 'extreme' ? 25 : 5);
          }
          
          const { data, error } = await query;
          
          if (error) {
            this.errors++;
            console.log(`⚠️  User ${sessionId}: Read error on ${table} - ${error.message}`);
          } else {
            this.stats.reads++;
            this.totalRequests++;
            
            if (action.intensity === 'extreme') {
              this.stats.heavyOperations++;
            }
          }
          
          // Variable delay between queries
          const delayBetweenQueries = action.intensity === 'extreme' ? 50 : Math.random() * 200 + 50;
          await new Promise(resolve => setTimeout(resolve, delayBetweenQueries));
          
        } catch (err) {
          this.errors++;
          console.log(`⚠️  User ${sessionId}: Read exception on ${table} - ${err.message}`);
        }
      }
    }
  }

  async performWrites(tables, sessionId, action) {
    for (const table of tables) {
      // Perform multiple writes for heavy operations
      const writeCount = action.intensity === 'heavy' || action.intensity === 'extreme' ? 3 : 1;
      
      for (let w = 0; w < writeCount; w++) {
        try {
          this.stats.tableHits[table] = (this.stats.tableHits[table] || 0) + 1;
          let insertData = {};
          
          switch (table) {
            case 'users':
              const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
              insertData = {
                id: this.generateUUID(),
                full_name: `${user.full_name} ${Math.floor(Math.random() * 10000)}`,
                email: `test${Math.floor(Math.random() * 100000)}@simulation.local`,
                created_at: new Date().toISOString()
              };
              break;
              
            case 'approved_user_content':
              insertData = {
                id: this.generateUUID(),
                content: sampleContent[Math.floor(Math.random() * sampleContent.length)],
                content_type: action.intensity === 'heavy' ? 'detailed_review' : 'comment',
                created_at: new Date().toISOString(),
                approved_at: new Date().toISOString()
              };
              break;
              
            case 'photo_matchups':
              insertData = {
                id: this.generateUUID(),
                user_guess: Math.random() > 0.5 ? 'correct' : 'incorrect',
                created_at: new Date().toISOString(),
                response_time_ms: Math.floor(Math.random() * 5000 + 1000)
              };
              break;
              
            default:
              console.log(`⏭️  User ${sessionId}: Skipping unknown write table ${table}`);
              continue;
          }
          
          const { data, error } = await supabase.from(table).insert(insertData);
          
          if (error) {
            this.errors++;
            console.log(`⚠️  User ${sessionId}: Write error on ${table} - ${error.message}`);
          } else {
            this.stats.writes++;
            this.totalRequests++;
          }
          
          // Brief delay between multiple writes
          if (w < writeCount - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
        } catch (err) {
          this.errors++;
          console.log(`⚠️  User ${sessionId}: Write exception on ${table} - ${err.message}`);
        }
      }
    }
  }

  async simulateUserSession(sessionId) {
    this.activeUsers++;
    this.stats.peakConcurrentUsers = Math.max(this.stats.peakConcurrentUsers, this.activeUsers);
    
    const loadMultiplier = this.getCurrentLoadMultiplier();
    const baseSessionDuration = 30000; // 30 seconds base
    const sessionDuration = this.getVariableDelay(baseSessionDuration);
    
    const sessionStart = Date.now();
    console.log(`👤 User ${sessionId} started session (${Math.round(sessionDuration/1000)}s, ${loadMultiplier}x load)`);
    
    while (Date.now() - sessionStart < sessionDuration && Date.now() - this.startTime < config.duration * 1000) {
      const action = this.selectUserAction();
      
      this.stats.actions[action.name] = (this.stats.actions[action.name] || 0) + 1;
      
      console.log(`  🔄 User ${sessionId}: ${action.name} (${action.intensity} intensity)`);
      
      // Perform reads first
      if (action.reads.length > 0) {
        await this.performReads(action.reads, sessionId, action);
      }
      
      // Then writes
      if (action.writes.length > 0) {
        await this.performWrites(action.writes, sessionId, action);
      }
      
      // Wait before next action (affected by load pattern)
      await new Promise(resolve => setTimeout(resolve, this.getVariableDelay()));
    }
    
    this.activeUsers--;
    console.log(`👤 User ${sessionId} ended session`);
  }

  displayStats() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rps = elapsed > 0 ? (this.totalRequests / elapsed).toFixed(1) : '0.0';
    const currentPattern = this.currentLoadPattern;
    const loadMultiplier = this.getCurrentLoadMultiplier();
    
    console.clear();
    console.log('🏟️  LOU GEHRIG FAN CLUB - VARIABLE LOAD TRAFFIC SIMULATION');
    console.log('=========================================================');
    console.log(`⏱️  Elapsed: ${Math.round(elapsed)}s / ${config.duration}s`);
    console.log(`🌊 Current Load Pattern: ${currentPattern} (${loadMultiplier}x)`);
    console.log(`👥 Active Users: ${this.activeUsers} / ${config.maxConcurrentUsers} (Peak: ${this.stats.peakConcurrentUsers})`);
    console.log(`📊 Total Requests: ${this.totalRequests} (${rps} req/s)`);
    console.log(`📖 Reads: ${this.stats.reads} | ✏️  Writes: ${this.stats.writes} | 🔥 Heavy Ops: ${this.stats.heavyOperations}`);
    console.log(`❌ Errors: ${this.errors} (${this.totalRequests > 0 ? ((this.errors/this.totalRequests)*100).toFixed(1) : '0'}%)`);
    
    console.log('\n📈 Top User Actions:');
    Object.entries(this.stats.actions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([action, count]) => {
        console.log(`   ${action}: ${count}`);
      });

    console.log('\n🗄️  Database Table Activity:');
    Object.entries(this.stats.tableHits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .forEach(([table, hits]) => {
        console.log(`   ${table}: ${hits} queries`);
      });
      
    console.log('\n🌊 Load Pattern History:');
    Object.entries(this.stats.loadPatterns).forEach(([pattern, count]) => {
      const multiplier = config.loadPatterns[pattern].multiplier;
      console.log(`   ${pattern}: ${count} cycles (${multiplier}x load)`);
    });
  }

  async run() {
    console.log('🚀 Starting Enhanced LGFC Traffic Simulation with Variable Load...');
    console.log(`⚙️  Duration: ${config.duration}s, Max Users: ${config.maxConcurrentUsers}`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}`);
    console.log('🌊 Variable Load Patterns: rushHour(3x), lunchDrop(0.3x), normal(1x), flashSpike(5x)\n');
    
    // Test connection first
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error(`❌ Connection test failed: ${error.message}`);
      return;
    }
    console.log('✅ Supabase connection successful\n');
    
    // Start stats display interval
    const statsInterval = setInterval(() => this.displayStats(), 2000);
    
    // Load pattern management interval
    const patternInterval = setInterval(() => this.updateLoadPattern(), 5000);
    
    // Variable user spawning loop
    let userCounter = 0;
    const spawnInterval = setInterval(() => {
      if (Date.now() - this.startTime < config.duration * 1000) {
        const loadMultiplier = this.getCurrentLoadMultiplier();
        const maxUsers = Math.floor(config.maxConcurrentUsers * loadMultiplier);
        
        if (this.activeUsers < maxUsers) {
          userCounter++;
          this.simulateUserSession(userCounter);
        }
      }
    }, 3000); // Check every 3 seconds for new users
    
    // Simulation completion
    setTimeout(() => {
      clearInterval(spawnInterval);
      clearInterval(patternInterval);
      
      const cleanup = setInterval(() => {
        if (this.activeUsers === 0) {
          clearInterval(cleanup);
          clearInterval(statsInterval);
          this.displayStats();
          console.log('\n✅ Variable Load Traffic Simulation Completed!');
          
          const totalTime = (Date.now() - this.startTime) / 1000;
          const avgRps = totalTime > 0 ? (this.totalRequests / totalTime).toFixed(2) : '0.00';
          const errorRate = this.totalRequests > 0 ? ((this.errors / this.totalRequests) * 100).toFixed(1) : '0.0';
          
          console.log('\n📋 ENHANCED FINAL REPORT:');
          console.log(`   Duration: ${Math.round(totalTime)}s`);
          console.log(`   Total Requests: ${this.totalRequests}`);
          console.log(`   Average RPS: ${avgRps}`);
          console.log(`   Peak Concurrent Users: ${this.stats.peakConcurrentUsers}`);
          console.log(`   Heavy Operations: ${this.stats.heavyOperations}`);
          console.log(`   Error Rate: ${errorRate}%`);
          console.log(`   Load Pattern Changes: ${Object.keys(this.stats.loadPatterns).length}`);
          
          process.exit(0);
        }
      }, 1000);
      
    }, config.duration * 1000);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Variable load simulation interrupted by user');
  process.exit(0);
});

// Run enhanced simulation
if (require.main === module) {
  console.log('🎯 Lou Gehrig Fan Club Enhanced Traffic Simulator');
  console.log('   Variable Load Patterns for Realistic Database Metrics');
  console.log('   Based on LGFC_AS_BUILT_MASTER_DOCUMENTATION V2\n');
  
  const simulator = new VariableLoadTrafficSimulator();
  simulator.run().catch(err => {
    console.error('❌ Enhanced simulation failed:', err);
    process.exit(1);
  });
}
