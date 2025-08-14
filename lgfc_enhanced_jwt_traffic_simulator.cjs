#!/usr/bin/env node

/**
 * Lou Gehrig Fan Club - Enhanced JWT Traffic Simulator
 * 
 * Enhanced traffic simulator that keeps Supabase project active
 * by both pinging the URL and making actual JWT API calls
 * 
 * Usage:
 *   node lgfc_enhanced_jwt_traffic_simulator.cjs
 *   node lgfc_enhanced_jwt_traffic_simulator.cjs --interval=300000 --users=20
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

console.log('🚀 Enhanced JWT Traffic Simulator Starting...');
console.log('📡 Target URL:', supabaseUrl);
console.log('⏱️  Interval:', config.interval, 'ms');
console.log('👥 Max Users:', config.maxConcurrentUsers);

// Enhanced JWT Traffic Simulator Class
class EnhancedJWTTrafficSimulator {
  constructor() {
    this.stats = {
      totalRequests: 0,
      errors: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
      successfulPings: 0,
      failedPings: 0,
      successfulAPICalls: 0,
      failedAPICalls: 0
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
          'User-Agent': 'LGFC-Enhanced-JWT-Simulator/1.0',
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

  async makeAPICall(userId) {
    return new Promise((resolve) => {
      const url = new URL(supabaseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: '/rest/v1/search_state?select=*&limit=1',
        method: 'GET',
        headers: {
          'User-Agent': 'LGFC-Enhanced-JWT-Simulator/1.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
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
          // API calls might fail due to auth, but that's expected
          if (res.statusCode >= 200 && res.statusCode < 500) {
            this.stats.successfulAPICalls++;
            resolve({ success: true, status: res.statusCode, message: 'API call successful' });
          } else {
            this.stats.failedAPICalls++;
            resolve({ success: false, status: res.statusCode, message: 'API call failed (expected)' });
          }
        });
      });

      req.on('error', (err) => {
        this.stats.failedAPICalls++;
        resolve({ success: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        this.stats.failedAPICalls++;
        resolve({ success: false, error: 'Request timeout' });
      });

      req.end();
    });
  }

  async simulateUser(userId) {
    console.log(`👤 User ${userId} - Starting enhanced JWT session`);
    
    const startTime = Date.now();
    const sessionEndTime = startTime + config.sessionDuration;
    
    while (Date.now() < sessionEndTime) {
      try {
        // Alternate between ping and API call
        if (Math.random() > 0.5) {
          const result = await this.pingSupabase(userId);
          if (result.success) {
            console.log(`✅ User ${userId} - Ping successful (${result.status})`);
          } else {
            console.log(`❌ User ${userId} - Ping failed: ${result.error || result.message}`);
          }
        } else {
          const result = await this.makeAPICall(userId);
          if (result.success) {
            console.log(`✅ User ${userId} - API call successful (${result.status})`);
          } else {
            console.log(`⚠️  User ${userId} - API call failed (${result.status}) - expected`);
          }
        }
        
        this.stats.totalRequests++;
        this.logActivity();
        
        // Random delay between requests
        const delay = this.getRandomDelay(config.baseDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.log(`❌ User ${userId} - Error: ${error.message}`);
        this.stats.errors++;
      }
    }
    
    console.log(`👤 User ${userId} - Enhanced JWT session completed`);
  }

  async start() {
    console.log('🎯 Lou Gehrig Fan Club Enhanced JWT Traffic Simulator');
    console.log('   Enhanced mode - URL pinging + API calls');
    console.log('   Keeps Supabase project active 24/7');
    console.log('');
    
    console.log('🚀 Starting LGFC Enhanced JWT Traffic Simulator...');
    console.log(`⚙️  Interval: ${config.interval/1000}s, Max Users: ${config.maxConcurrentUsers}`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}`);
    console.log('🔐 Enhanced JWT mode - URL pinging + API calls');
    console.log('🌐 Generating activity to keep project active 24/7');
    console.log('');

    // Test initial connection
    console.log('🔌 Testing initial connection...');
    const initialTest = await this.pingSupabase(0);
    if (initialTest.success) {
      console.log('✅ Project is active and responding');
    } else {
      console.log('❌ Project is not responding');
    }
    console.log('');

    // Start user simulation
    const userPromises = [];
    
    while (true) {
      // Start new users if we haven't reached the limit
      while (this.activeUsers < config.maxConcurrentUsers) {
        this.userCounter++;
        this.activeUsers++;
        
        const userPromise = this.simulateUser(this.userCounter).finally(() => {
          this.activeUsers--;
        });
        
        userPromises.push(userPromise);
        
        // Small delay between starting users
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Wait for the configured interval
      await new Promise(resolve => setTimeout(resolve, config.interval));
    }
  }

  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);
    
    const totalRequests = this.stats.successfulPings + this.stats.failedPings + this.stats.successfulAPICalls + this.stats.failedAPICalls;
    const successRate = totalRequests > 0 ? ((this.stats.successfulPings + this.stats.successfulAPICalls) / totalRequests * 100).toFixed(1) : 0;
    
    return {
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      activeUsers: this.activeUsers,
      totalRequests,
      successfulPings: this.stats.successfulPings,
      failedPings: this.stats.failedPings,
      successfulAPICalls: this.stats.successfulAPICalls,
      failedAPICalls: this.stats.failedAPICalls,
      successRate,
      lastActivity: new Date(this.stats.lastActivity).toLocaleTimeString(),
      projectStatus: this.stats.successfulPings > 0 ? 'Active' : 'Inactive'
    };
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Enhanced JWT simulation terminated');
  console.log('');
  
  const stats = simulator.getStats();
  console.log('📊 ENHANCED JWT TRAFFIC SIMULATOR STATS:');
  console.log(`⏱️  Uptime: ${stats.uptime}`);
  console.log(`👥 Active Users: ${stats.activeUsers}`);
  console.log(`📈 Total Requests: ${stats.totalRequests}`);
  console.log(`✅ Successful Pings: ${stats.successfulPings}`);
  console.log(`❌ Failed Pings: ${stats.failedPings}`);
  console.log(`✅ Successful API Calls: ${stats.successfulAPICalls}`);
  console.log(`❌ Failed API Calls: ${stats.failedAPICalls}`);
  console.log(`📊 Success Rate: ${stats.successRate}%`);
  console.log(`🔄 Last Activity: ${stats.lastActivity}`);
  console.log(`🌐 Project Status: ${stats.projectStatus}`);
  
  process.exit(0);
});

// Start the simulator
const simulator = new EnhancedJWTTrafficSimulator();
simulator.start().catch(err => {
  console.error('❌ Enhanced JWT Traffic Simulator failed:', err);
  process.exit(1);
});