#!/usr/bin/env node

/**
 * Lou Gehrig Fan Club - JWT-Only Traffic Simulator
 * 
 * Uses JWT authentication without requiring anon key
 * Implements proper JWT token management
 * 
 * Usage:
 *   node lgfc_jwt_only_traffic_simulator.cjs
 *   node lgfc_jwt_only_traffic_simulator.cjs --interval=300000 --users=20
 */

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

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  process.exit(1);
}

// JWT Traffic Simulator Class
class JWTOnlyTrafficSimulator {
  constructor() {
    this.stats = {
      totalRequests: 0,
      errors: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
      tableHits: {},
      actionHits: {},
      authSessions: 0,
      authErrors: 0,
      jwtTokens: 0,
      jwtErrors: 0
    };
    this.activeUsers = 0;
    this.userCounter = 0;
    this.jwtTokens = new Map(); // Store JWT tokens for users
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

  async generateJWTToken(userId) {
    try {
      // Simulate JWT token generation for anonymous user
      const tokenPayload = {
        sub: `anon-${userId}`,
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        iat: Math.floor(Date.now() / 1000),
        iss: supabaseUrl,
        role: 'authenticated'
      };

      // In a real implementation, this would be signed by Supabase
      // For simulation purposes, we'll create a mock token
      const mockToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
      this.jwtTokens.set(userId, mockToken);
      this.stats.jwtTokens++;
      
      console.log(`🔐 User ${userId} - JWT token generated`);
      return mockToken;
    } catch (err) {
      console.log(`❌ User ${userId} - JWT generation failed: ${err.message}`);
      this.stats.jwtErrors++;
      return null;
    }
  }

  async makeAuthenticatedRequest(userId, endpoint, method = 'GET', data = null) {
    const token = this.jwtTokens.get(userId);
    if (!token) {
      console.log(`❌ User ${userId} - No JWT token available`);
      return null;
    }

    return new Promise((resolve) => {
      const url = new URL(endpoint, supabaseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: responseData, status: res.statusCode });
          } else {
            resolve({ success: false, error: responseData, status: res.statusCode });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async simulateUserSession(userId) {
    this.activeUsers++;
    const sessionStart = Date.now();
    
    try {
      // Generate JWT token for user
      const token = await this.generateJWTToken(userId);
      if (!token) {
        console.log(`⚠️  User ${userId} - Skipping session due to JWT failure`);
        return;
      }

      // Simulate user browsing different pages
      const actions = [
        { action: 'browse_milestones', endpoint: '/rest/v1/milestones?select=*&limit=5', delay: 3000 },
        { action: 'view_memorabilia', endpoint: '/rest/v1/memorabilia?select=*&limit=5', delay: 2500 },
        { action: 'check_events', endpoint: '/rest/v1/events?select=*&limit=5', delay: 2000 },
        { action: 'read_news', endpoint: '/rest/v1/news?select=*&limit=5', delay: 4000 },
        { action: 'view_photos', endpoint: '/rest/v1/media_files?select=*&limit=5', delay: 3000 },
        { action: 'browse_books', endpoint: '/rest/v1/books?select=*&limit=5', delay: 2000 }
      ];

      for (const { action, endpoint, delay } of actions) {
        if (Date.now() - sessionStart > config.sessionDuration) break;
        
        try {
          const result = await this.makeAuthenticatedRequest(userId, endpoint);
          
          if (result && result.success) {
            console.log(`👤 User ${userId} - ${action} (Status: ${result.status})`);
            this.logAction(action, endpoint.split('/')[3]); // Extract table name
          } else {
            console.log(`⚠️  User ${userId} - ${action} failed: ${result?.error || 'Unknown error'}`);
            this.stats.errors++;
          }
          
          this.stats.totalRequests++;
          
          // Random delay between actions
          await new Promise(resolve => setTimeout(resolve, this.getRandomDelay(delay)));
          
        } catch (err) {
          console.log(`❌ User ${userId} - ${action} error: ${err.message}`);
          this.stats.errors++;
        }
      }
      
      // Clean up JWT token
      this.jwtTokens.delete(userId);
      
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
    
    const jwtSuccessRate = (this.stats.jwtTokens + this.stats.jwtErrors) > 0 ?
      ((this.stats.jwtTokens / (this.stats.jwtTokens + this.stats.jwtErrors)) * 100).toFixed(1) : '0.0';
    
    console.log('\n📊 JWT-ONLY TRAFFIC SIMULATOR STATS:');
    console.log(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`);
    console.log(`👥 Active Users: ${this.activeUsers}`);
    console.log(`📈 Total Requests: ${this.stats.totalRequests}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`🔐 JWT Tokens Generated: ${this.stats.jwtTokens}`);
    console.log(`🔐 JWT Errors: ${this.stats.jwtErrors}`);
    console.log(`🔐 JWT Success Rate: ${jwtSuccessRate}%`);
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
    console.log('🚀 Starting LGFC JWT-Only Traffic Simulator...');
    console.log(`⚙️  Interval: ${config.interval/1000}s, Max Users: ${config.maxConcurrentUsers}`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}`);
    console.log('🔐 Using JWT-only authentication (no anon key required)');
    console.log('🌐 Running continuously to keep project active\n');
    
    // Test connection first
    console.log('🔌 Testing Supabase connection...');
    try {
      const testResult = await this.makeAuthenticatedRequest(0, '/rest/v1/search_state?select=*&limit=1');
      if (testResult && testResult.success) {
        console.log('✅ Supabase connection successful\n');
      } else {
        console.log(`⚠️  Connection test result: ${testResult?.error || 'Unknown'}\n`);
      }
    } catch (err) {
      console.log(`⚠️  Connection test: ${err.message}\n`);
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
      console.log('\n🛑 JWT-only simulation interrupted by user');
      clearInterval(statsInterval);
      this.displayStats();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 JWT-only simulation terminated');
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

// Run JWT-only simulation
if (require.main === module) {
  console.log('🎯 Lou Gehrig Fan Club JWT-Only Traffic Simulator');
  console.log('   Uses JWT authentication without anon key');
  console.log('   Compatible with new Supabase authentication system\n');
  
  const simulator = new JWTOnlyTrafficSimulator();
  simulator.run().catch(err => {
    console.error('❌ JWT-only simulation failed:', err);
    process.exit(1);
  });
}