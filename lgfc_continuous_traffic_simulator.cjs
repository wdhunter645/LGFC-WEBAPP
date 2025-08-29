#!/usr/bin/env node

/**
 * Lou Gehrig Fan Club - Continuous Traffic Simulator
 * 
 * Runs indefinitely to keep Supabase project active 24/7
 * Prevents project from going idle and being paused
 * 
 * Usage:
 *   node lgfc_continuous_traffic_simulator.js
 *   node lgfc_continuous_traffic_simulator.js --interval=300000 --users=20
 */

const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

// Configuration
const config = {
  interval: parseInt(process.argv.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 300000, // 5 minutes default
  maxConcurrentUsers: parseInt(process.argv.find(arg => arg.startsWith('--users='))?.split('=')[1]) || 20,
  sessionDuration: 60000, // 1 minute per user session
  baseDelay: 2000,
  variancePercent: 0.4
};

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  console.error('   Please set these environment variables');
  process.exit(1);
}

// Simple Supabase client implementation
class SupabaseClient {
  constructor(url, key) {
    this.url = url.replace(/\/$/, '');
    this.key = key;
    this.restUrl = `${this.url}/rest/v1`;
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
    this.params.order = `${column}.${options.ascending ? 'asc' : 'desc'}`;
    return this;
  }

  eq(column, value) {
    this.params[column] = `eq.${value}`;
    return this;
  }

  async execute() {
    return await this.client.request('GET', `/${this.table}`, null, this.params);
  }
}

// Traffic Simulator Class
class ContinuousTrafficSimulator {
  constructor() {
    this.supabase = new SupabaseClient(supabaseUrl, supabaseKey);
    this.stats = {
      totalRequests: 0,
      errors: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
      tableHits: {},
      actionHits: {}
    };
    this.activeUsers = 0;
    this.userCounter = 0;
  }

  getRandomDelay(baseDelay) {
    const variance = baseDelay * config.variancePercent;
    return baseDelay + (Math.random() * variance * 2 - variance);
  }

  logAction(action, table = null) {
    this.stats.actionHits[action] = (this.stats.actionHits[action] || 0) + 1;
    if (table) {
      this.stats.tableHits[table] = (this.stats.tableHits[table] || 0) + 1;
    }
    this.stats.lastActivity = Date.now();
  }

  async simulateUserSession(userId) {
    this.activeUsers++;
    const sessionStart = Date.now();
    
    try {
      // Simulate user browsing different pages
      const actions = [
        { action: 'browse_milestones', table: 'milestones', delay: 3000 },
        { action: 'view_memorabilia', table: 'memorabilia', delay: 2500 },
        { action: 'check_events', table: 'events', delay: 2000 },
        { action: 'read_news', table: 'news', delay: 4000 },
        { action: 'view_photos', table: 'media_files', delay: 3000 },
        { action: 'browse_books', table: 'books', delay: 2000 }
      ];

      for (const { action, table, delay } of actions) {
        if (Date.now() - sessionStart > config.sessionDuration) break;
        
        try {
          // Simulate database query
          const { data, error } = await this.supabase.from(table).select('*').limit(5).execute();
          
          if (error) {
            console.log(`⚠️  User ${userId} - ${action} failed: ${error.message}`);
            this.stats.errors++;
          } else {
            console.log(`👤 User ${userId} - ${action} (${data?.length || 0} items)`);
            this.logAction(action, table);
          }
          
          this.stats.totalRequests++;
          
          // Random delay between actions
          await new Promise(resolve => setTimeout(resolve, this.getRandomDelay(delay)));
          
        } catch (err) {
          console.log(`❌ User ${userId} - ${action} error: ${err.message}`);
          this.stats.errors++;
        }
      }
      
    } catch (err) {
      console.error(`❌ User ${userId} session error:`, err.message);
    } finally {
      this.activeUsers--;
    }
  }

  displayStats() {
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    console.log('\n📊 CONTINUOUS TRAFFIC SIMULATOR STATS:');
    console.log(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`);
    console.log(`👥 Active Users: ${this.activeUsers}`);
    console.log(`📈 Total Requests: ${this.stats.totalRequests}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`🔄 Last Activity: ${new Date(this.stats.lastActivity).toLocaleTimeString()}`);
    
    if (this.stats.totalRequests > 0) {
      const errorRate = ((this.stats.errors / this.stats.totalRequests) * 100).toFixed(1);
      console.log(`📊 Error Rate: ${errorRate}%`);
    }
    
    console.log('\n🎯 Most Active Actions:');
    Object.entries(this.stats.actionHits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([action, count]) => {
        console.log(`   ${action}: ${count}`);
      });

    console.log('\n🗄️  Database Table Activity:');
    Object.entries(this.stats.tableHits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([table, hits]) => {
        console.log(`   ${table}: ${hits} queries`);
      });
  }

  async run() {
    console.log('🚀 Starting LGFC Continuous Traffic Simulator...');
    console.log(`⚙️  Interval: ${config.interval/1000}s, Max Users: ${config.maxConcurrentUsers}`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}`);
    console.log('🌐 Running continuously to keep project active\n');
    
    // Test connection first
    console.log('🔌 Testing Supabase connection...');
    try {
      const { data, error } = await this.supabase.from('milestones').select('*').limit(1).execute();
      if (error) {
        console.error(`❌ Connection test failed: ${error.message}`);
        return;
      }
      console.log('✅ Supabase connection successful\n');
    } catch (err) {
      console.error(`❌ Connection test failed: ${err.message}`);
      return;
    }
    
    // Display stats every 30 seconds
    const statsInterval = setInterval(() => this.displayStats(), 30000);
    
    // Main simulation loop
    const simulationLoop = async () => {
      try {
        // Spawn new users if under limit
        while (this.activeUsers < config.maxConcurrentUsers) {
          this.userCounter++;
          this.simulateUserSession(this.userCounter);
          
          // Small delay between spawning users
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Wait for next cycle
        await new Promise(resolve => setTimeout(resolve, config.interval));
        
        // Continue the loop
        simulationLoop();
        
      } catch (err) {
        console.error('❌ Simulation loop error:', err);
        // Continue despite errors
        setTimeout(simulationLoop, 10000);
      }
    };
    
    // Start the simulation loop
    simulationLoop();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Continuous simulation interrupted by user');
      clearInterval(statsInterval);
      this.displayStats();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Continuous simulation terminated');
      clearInterval(statsInterval);
      this.displayStats();
      process.exit(0);
    });
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Run continuous simulation
if (require.main === module) {
  console.log('🎯 Lou Gehrig Fan Club Continuous Traffic Simulator');
  console.log('   Keeps Supabase project active 24/7');
  console.log('   Prevents project from going idle\n');
  
  const simulator = new ContinuousTrafficSimulator();
  simulator.run().catch(err => {
    console.error('❌ Continuous simulation failed:', err);
    process.exit(1);
  });
}