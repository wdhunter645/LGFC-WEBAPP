#!/usr/bin/env node

/**
 * Lou Gehrig Fan Club - Production Traffic Simulator for GitHub Codespaces
 * 
 * Consolidated script that works in browser-based GitHub Codespaces environment
 * No external dependencies - uses native Node.js modules and fetch API
 * 
 * Usage in Codespaces terminal:
 *   node lgfc_traffic_simulator.js
 *   node lgfc_traffic_simulator.js --duration=300 --users=50
 */

const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

// Configuration from command line args
const config = {
  duration: parseInt(process.argv.find(arg => arg.startsWith('--duration='))?.split('=')[1]) || 180,
  maxConcurrentUsers: parseInt(process.argv.find(arg => arg.startsWith('--users='))?.split('=')[1]) || 25,
  baseDelay: 2000,
  variancePercent: 0.4
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

  // Make HTTP request to Supabase
  async request(method, path, body = null, params = {}) {
    const url = new URL(`${this.restUrl}${path}`);
    
    // Add query parameters
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
      const response = await fetch(url.toString(), options);
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

  // Query builder methods
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

  // For compatibility with original Supabase client patterns
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

// Initialize client
const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

// Traffic pattern definitions (from original LGFC documentation)
const userActions = {
  browseHomepage: { weight: 25, reads: ['admin_posts', 'milestones'] },
  viewPhotoGallery: { weight: 20, reads: ['media_assets', 'media_locations'] },
  readBiography: { weight: 15, reads: ['admin_posts', 'milestones'] },
  alsAwarenessPage: { weight: 12, reads: ['als_messages', 'milestones'] },
  photoMatchupGame: { weight: 10, reads: ['photo_matchups'], writes: ['photo_matchups'] },
  userSignup: { weight: 8, writes: ['users'], reads: [] },
  submitUserContent: { weight: 5, writes: ['approved_user_content'], reads: ['users'] },
  membershipCard: { weight: 3, reads: ['users', 'milestones'] },
  adminLogin: { weight: 2, reads: ['users', 'admin_tasks'] }
};

// Sample data for realistic traffic
const sampleUsers = [
  { full_name: 'Baseball Fan', email: 'fan@example.com' },
  { full_name: 'History Buff', email: 'history@example.com' },
  { full_name: 'Yankees Lover', email: 'yankees@example.com' },
  { full_name: 'ALS Supporter', email: 'support@example.com' }
];

const sampleContent = [
  'Great article about Lou Gehrig!',
  'His speech still gives me chills',
  'Luckiest man on the face of the earth',
  'Iron Horse forever',
  'Never forget his courage'
];

class TrafficSimulator {
  constructor() {
    this.activeUsers = 0;
    this.totalRequests = 0;
    this.errors = 0;
    this.startTime = Date.now();
    this.stats = {
      reads: 0,
      writes: 0,
      actions: {},
      tableHits: {}
    };
  }

  getRandomDelay(baseMs = config.baseDelay) {
    const variance = baseMs * config.variancePercent;
    return baseMs + (Math.random() * variance * 2 - variance);
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

  async performReads(tables, sessionId) {
    for (const table of tables) {
      try {
        this.stats.tableHits[table] = (this.stats.tableHits[table] || 0) + 1;
        
        let query = supabase.from(table).select('*');
        
        // Add realistic query patterns based on LGFC schema
        switch (table) {
          case 'admin_posts':
            query = query.order('created_at', { ascending: false }).limit(10);
            break;
          case 'media_assets':
            query = query.limit(20);
            break;
          case 'milestones':
            const today = new Date().toISOString().split('T')[0];
            query = query.gte('milestone_date', today).limit(5);
            break;
          case 'photo_matchups':
            query = query.limit(1).order('created_at', { ascending: false });
            break;
          case 'als_messages':
            query = query.limit(5);
            break;
          case 'media_locations':
            query = query.limit(10);
            break;
          default:
            query = query.limit(5);
        }
        
        const { data, error } = await query;
        
        if (error) {
          this.errors++;
          console.log(`⚠️  User ${sessionId}: Read error on ${table} - ${error.message}`);
        } else {
          this.stats.reads++;
          this.totalRequests++;
        }
        
        // Small delay between reads to simulate real browsing
        await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
        
      } catch (err) {
        this.errors++;
        console.log(`⚠️  User ${sessionId}: Read exception on ${table} - ${err.message}`);
      }
    }
  }

  async performWrites(tables, sessionId) {
    for (const table of tables) {
      try {
        this.stats.tableHits[table] = (this.stats.tableHits[table] || 0) + 1;
        let insertData = {};
        
        // Generate realistic test data based on LGFC schema
        switch (table) {
          case 'users':
            const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
            insertData = {
              id: this.generateUUID(),
              full_name: `${user.full_name} ${Math.floor(Math.random() * 1000)}`,
              email: `test${Math.floor(Math.random() * 10000)}@simulation.local`,
              created_at: new Date().toISOString()
            };
            break;
            
          case 'approved_user_content':
            insertData = {
              id: this.generateUUID(),
              content: sampleContent[Math.floor(Math.random() * sampleContent.length)],
              content_type: 'comment',
              created_at: new Date().toISOString(),
              approved_at: new Date().toISOString()
            };
            break;
            
          case 'photo_matchups':
            insertData = {
              id: this.generateUUID(),
              user_guess: Math.random() > 0.5 ? 'correct' : 'incorrect',
              created_at: new Date().toISOString()
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
        
      } catch (err) {
        this.errors++;
        console.log(`⚠️  User ${sessionId}: Write exception on ${table} - ${err.message}`);
      }
    }
  }

  async simulateUserSession(sessionId) {
    this.activeUsers++;
    const sessionStart = Date.now();
    const sessionDuration = this.getRandomDelay(30000); // 30s average session
    
    console.log(`👤 User ${sessionId} started session (${Math.round(sessionDuration/1000)}s)`);
    
    while (Date.now() - sessionStart < sessionDuration && Date.now() - this.startTime < config.duration * 1000) {
      const action = this.selectUserAction();
      
      // Track action stats
      this.stats.actions[action.name] = (this.stats.actions[action.name] || 0) + 1;
      
      console.log(`  🔄 User ${sessionId}: ${action.name}`);
      
      // Perform reads first (simulate page loads)
      if (action.reads.length > 0) {
        await this.performReads(action.reads, sessionId);
      }
      
      // Then writes (simulate form submissions)
      if (action.writes.length > 0) {
        await this.performWrites(action.writes, sessionId);
      }
      
      // Wait before next action (simulate user reading/thinking)
      await new Promise(resolve => setTimeout(resolve, this.getRandomDelay()));
    }
    
    this.activeUsers--;
    console.log(`👤 User ${sessionId} ended session`);
  }

  displayStats() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rps = elapsed > 0 ? (this.totalRequests / elapsed).toFixed(1) : '0.0';
    
    console.clear();
    console.log('🏟️  LOU GEHRIG FAN CLUB - PRODUCTION TRAFFIC SIMULATION');
    console.log('======================================================');
    console.log(`⏱️  Elapsed: ${Math.round(elapsed)}s / ${config.duration}s`);
    console.log(`👥 Active Users: ${this.activeUsers} / ${config.maxConcurrentUsers}`);
    console.log(`📊 Total Requests: ${this.totalRequests} (${rps} req/s)`);
    console.log(`📖 Reads: ${this.stats.reads}`);
    console.log(`✏️  Writes: ${this.stats.writes}`);
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
  }

  async run() {
    console.log('🚀 Starting LGFC Production Traffic Simulation...');
    console.log(`⚙️  Duration: ${config.duration}s, Max Users: ${config.maxConcurrentUsers}`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}`);
    console.log('🌐 Running in GitHub Codespaces\n');
    
    // Test connection first
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error(`❌ Connection test failed: ${error.message}`);
      if (error.status === 404) {
        console.error('   Check if "users" table exists in your Supabase database');
      }
      return;
    }
    console.log('✅ Supabase connection successful\n');
    
    // Start stats display interval
    const statsInterval = setInterval(() => this.displayStats(), 3000);
    
    // User spawning loop
    let userCounter = 0;
    const spawnInterval = setInterval(() => {
      if (this.activeUsers < config.maxConcurrentUsers && Date.now() - this.startTime < config.duration * 1000) {
        userCounter++;
        this.simulateUserSession(userCounter);
      }
    }, this.getRandomDelay(5000)); // New user every ~5 seconds
    
    // Wait for simulation to complete
    setTimeout(() => {
      clearInterval(spawnInterval);
      
      // Wait for active users to finish
      const cleanup = setInterval(() => {
        if (this.activeUsers === 0) {
          clearInterval(cleanup);
          clearInterval(statsInterval);
          this.displayStats();
          console.log('\n✅ Traffic simulation completed!');
          
          // Final summary
          const totalTime = (Date.now() - this.startTime) / 1000;
          const avgRps = totalTime > 0 ? (this.totalRequests / totalTime).toFixed(2) : '0.00';
          const errorRate = this.totalRequests > 0 ? ((this.errors / this.totalRequests) * 100).toFixed(1) : '0.0';
          
          console.log('\n📋 FINAL REPORT:');
          console.log(`   Duration: ${Math.round(totalTime)}s`);
          console.log(`   Total Requests: ${this.totalRequests}`);
          console.log(`   Average RPS: ${avgRps}`);
          console.log(`   Error Rate: ${errorRate}%`);
          console.log(`   Peak Concurrent Users: ${userCounter}`);
          console.log(`   Most Active Table: ${Object.entries(this.stats.tableHits).sort(([,a],[,b]) => b-a)[0]?.[0] || 'none'}`);
          
          process.exit(0);
        }
      }, 1000);
      
    }, config.duration * 1000);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Simulation interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Run simulation
if (require.main === module) {
  console.log('🎯 Lou Gehrig Fan Club Traffic Simulator');
  console.log('   Designed for GitHub Codespaces environment');
  console.log('   Based on LGFC_AS_BUILT_MASTER_DOCUMENTATION V2\n');
  
  const simulator = new TrafficSimulator();
  simulator.run().catch(err => {
    console.error('❌ Simulation failed:', err);
    process.exit(1);
  });
}
