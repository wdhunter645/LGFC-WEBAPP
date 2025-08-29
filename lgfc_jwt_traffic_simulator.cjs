#!/usr/bin/env node

/**
 * Lou Gehrig Fan Club - JWT-Based Traffic Simulator
 * 
 * Uses the new Supabase JWT authentication system
 * Compatible with @supabase/ssr package
 * 
 * Usage:
 *   node lgfc_jwt_traffic_simulator.cjs
 *   node lgfc_jwt_traffic_simulator.cjs --interval=300000 --users=20
 */

const { createClient } = require('@supabase/supabase-js');
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
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  console.error('   Please set these environment variables');
  process.exit(1);
}

// Create Supabase client with JWT authentication
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Traffic Simulator Class
class JWTTrafficSimulator {
  constructor() {
    this.stats = {
      totalRequests: 0,
      errors: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
      tableHits: {},
      actionHits: {},
      authSessions: 0,
      authErrors: 0
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

  async authenticateUser(userId) {
    try {
      // Sign in anonymously to get a JWT session
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.log(`❌ User ${userId} - Auth failed: ${error.message}`);
        this.stats.authErrors++;
        return false;
      }
      
      if (data.user) {
        console.log(`🔐 User ${userId} - Authenticated (${data.user.id})`);
        this.stats.authSessions++;
        return true;
      }
      
      return false;
    } catch (err) {
      console.log(`❌ User ${userId} - Auth error: ${err.message}`);
      this.stats.authErrors++;
      return false;
    }
  }

  async simulateUserSession(userId) {
    this.activeUsers++;
    const sessionStart = Date.now();
    
    try {
      // Authenticate user first
      const isAuthenticated = await this.authenticateUser(userId);
      
      if (!isAuthenticated) {
        console.log(`⚠️  User ${userId} - Skipping session due to auth failure`);
        return;
      }

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
          // Simulate database query with JWT authentication
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(5);
          
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
      
      // Sign out the user
      await supabase.auth.signOut();
      
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
    
    const successRate = this.stats.totalRequests > 0 ? 
      ((this.stats.totalRequests - this.stats.errors) / this.stats.totalRequests * 100).toFixed(1) : '0.0';
    
    const authSuccessRate = (this.stats.authSessions + this.stats.authErrors) > 0 ?
      ((this.stats.authSessions / (this.stats.authSessions + this.stats.authErrors)) * 100).toFixed(1) : '0.0';
    
    console.log('\n📊 JWT TRAFFIC SIMULATOR STATS:');
    console.log(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`);
    console.log(`👥 Active Users: ${this.activeUsers}`);
    console.log(`📈 Total Requests: ${this.stats.totalRequests}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`🔐 Auth Sessions: ${this.stats.authSessions}`);
    console.log(`🔐 Auth Errors: ${this.stats.authErrors}`);
    console.log(`🔐 Auth Success Rate: ${authSuccessRate}%`);
    console.log(`🔄 Last Activity: ${new Date(this.stats.lastActivity).toLocaleTimeString()}`);
    
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
    console.log('🚀 Starting LGFC JWT Traffic Simulator...');
    console.log(`⚙️  Interval: ${config.interval/1000}s, Max Users: ${config.maxConcurrentUsers}`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}`);
    console.log('🔐 Using JWT-based authentication');
    console.log('🌐 Running continuously to keep project active\n');
    
    // Test connection first
    console.log('🔌 Testing Supabase connection...');
    try {
      const { data, error } = await supabase.from('milestones').select('*').limit(1);
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
      console.log('\n🛑 JWT simulation interrupted by user');
      clearInterval(statsInterval);
      this.displayStats();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 JWT simulation terminated');
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

// Run JWT simulation
if (require.main === module) {
  console.log('🎯 Lou Gehrig Fan Club JWT Traffic Simulator');
  console.log('   Uses new Supabase JWT authentication');
  console.log('   Compatible with @supabase/ssr package\n');
  
  const simulator = new JWTTrafficSimulator();
  simulator.run().catch(err => {
    console.error('❌ JWT simulation failed:', err);
    process.exit(1);
  });
}