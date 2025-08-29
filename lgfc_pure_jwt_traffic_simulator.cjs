#!/usr/bin/env node

/**
 * Lou Gehrig Fan Club - Pure JWT Traffic Simulator
 * 
 * Pure JWT-only traffic simulator that keeps Supabase project active
 * by pinging the URL without requiring any API calls or anon key
 * 
 * Usage:
 *   node lgfc_pure_jwt_traffic_simulator.cjs
 *   node lgfc_pure_jwt_traffic_simulator.cjs --interval=300000 --users=20
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

// Direct URL - no environment variables needed since JWT uses internal server variables
const supabaseUrl = 'https://vkwhrbjkdznncjkzkiuo.supabase.co';

console.log('🚀 Pure JWT Traffic Simulator Starting...');
console.log('📡 Target URL:', supabaseUrl);
console.log('⏱️  Interval:', config.interval, 'ms');
console.log('👥 Max Users:', config.maxConcurrentUsers);

// Pure JWT Traffic Simulator Class
class PureJWTTrafficSimulator {
  constructor() {
    this.stats = {
      totalRequests: 0,
      errors: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
      successfulPings: 0,
      failedPings: 0
    };
    this.activeUsers = 0;
    this.userCounter = 0;
  }

  getRandomDelay(baseDelay) {
    const variance = baseDelay * config.variancePercent;
    return baseDelay + (Math.random() * variance * 2 - variance);
  }

  logActivity() {
    this.stats.lastActivity = Date.now();
  }

  async pingSupabase(userId) {
    return new Promise((resolve) => {
      const url = new URL(supabaseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'GET',
        headers: {
          'User-Agent': 'LGFC-JWT-Traffic-Simulator/1.0',
          'Accept': 'text/html,application/json',
          'Connection': 'keep-alive'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          // Any response (including 404) means the project is active
          if (res.statusCode >= 200 && res.statusCode < 500) {
            this.stats.successfulPings++;
            resolve({ success: true, status: res.statusCode, message: 'Project active' });
          } else {
            this.stats.failedPings++;
            resolve({ success: false, status: res.statusCode, message: 'Project inactive' });
          }
        });
      });

      req.on('error', (err) => {
        this.stats.failedPings++;
        resolve({ success: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        this.stats.failedPings++;
        resolve({ success: false, error: 'Request timeout' });
      });

      req.end();
    });
  }

  async simulateUserSession(userId) {
    this.activeUsers++;
    const sessionStart = Date.now();
    
    try {
      console.log(`👤 User ${userId} - Starting JWT session`);
      
      // Simulate user activity by pinging different endpoints
      const endpoints = [
        '/',
        '/rest/v1/',
        '/auth/v1/',
        '/storage/v1/',
        '/functions/v1/'
      ];

      for (const endpoint of endpoints) {
        if (Date.now() - sessionStart > config.sessionDuration) break;
        
        try {
          const result = await this.pingSupabase(userId);
          
          if (result.success) {
            console.log(`✅ User ${userId} - Ping successful (${result.status})`);
          } else {
            console.log(`⚠️  User ${userId} - Ping failed: ${result.error || result.message}`);
          }
          
          this.stats.totalRequests++;
          this.logActivity();
          
          // Random delay between pings
          await new Promise(resolve => setTimeout(resolve, this.getRandomDelay(3000)));
          
        } catch (err) {
          console.log(`❌ User ${userId} - Ping error: ${err.message}`);
          this.stats.errors++;
        }
      }
      
      console.log(`👤 User ${userId} - JWT session completed`);
      
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
      ((this.stats.successfulPings / this.stats.totalRequests) * 100).toFixed(1) : '0.0';
    
    console.log('\n📊 PURE JWT TRAFFIC SIMULATOR STATS:');
    console.log(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`);
    console.log(`👥 Active Users: ${this.activeUsers}`);
    console.log(`📈 Total Requests: ${this.stats.totalRequests}`);
    console.log(`✅ Successful Pings: ${this.stats.successfulPings}`);
    console.log(`❌ Failed Pings: ${this.stats.failedPings}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`🔄 Last Activity: ${new Date(this.stats.lastActivity).toLocaleTimeString()}`);
    console.log(`🌐 Project Status: ${this.stats.successfulPings > 0 ? 'Active' : 'Inactive'}`);
  }

  async run() {
    console.log('🚀 Starting LGFC Pure JWT Traffic Simulator...');
    console.log(`⚙️  Interval: ${config.interval/1000}s, Max Users: ${config.maxConcurrentUsers}`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}`);
    console.log('🔐 Pure JWT mode - No anon key required');
    console.log('🌐 Pinging to keep project active 24/7\n');
    
    // Test initial connection
    console.log('🔌 Testing initial connection...');
    const testResult = await this.pingSupabase(0);
    if (testResult.success) {
      console.log('✅ Project is active and responding\n');
    } else {
      console.log(`⚠️  Project test: ${testResult.error || testResult.message}\n`);
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
      console.log('\n🛑 Pure JWT simulation interrupted by user');
      clearInterval(statsInterval);
      this.displayStats();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Pure JWT simulation terminated');
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

// Run pure JWT simulation
if (require.main === module) {
  console.log('🎯 Lou Gehrig Fan Club Pure JWT Traffic Simulator');
  console.log('   Pure JWT mode - No anon key or API calls required');
  console.log('   Keeps Supabase project active 24/7\n');
  
  const simulator = new PureJWTTrafficSimulator();
  simulator.run().catch(err => {
    console.error('❌ Pure JWT simulation failed:', err);
    process.exit(1);
  });
}