#!/usr/bin/env node

/**
 * Lou Gehrig Fan Club - Enhanced JWT Traffic Simulator
 * 
 * Enhanced traffic simulator that keeps Supabase project active
 * by both pinging the URL and making actual JWT API calls
 * Varies payloads and users to avoid detection patterns
 * 
 * Usage:
 *   node lgfc_enhanced_jwt_traffic_simulator.cjs
 *   node lgfc_enhanced_jwt_traffic_simulator.cjs --interval=300000 --users=20
 */

const https = require('https');
const { URL } = require('url');

// Configuration with randomization
const config = {
  interval: parseInt(process.argv.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 300000, // 5 minutes default
  maxConcurrentUsers: parseInt(process.argv.find(arg => arg.startsWith('--users='))?.split('=')[1]) || 20,
  sessionDuration: 60000, // 1 minute per user session
  baseDelay: 2000,
  variancePercent: 0.4
};

// Direct URL with public API key for JWT traffic simulation
const supabaseUrl = 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
const supabaseApiKey = 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';

// Vary user agents to avoid detection
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'LGFC-Enhanced-JWT-Simulator/1.0',
  'LGFC-Traffic-Generator/2.0',
  'Lou-Gehrig-Fan-Club/1.0'
];

// Vary API endpoints to generate different types of activity
const apiEndpoints = [
  '/rest/v1/search_state?select=*&limit=1',
  '/rest/v1/content_items?select=id,title&limit=5',
  '/rest/v1/media_files?select=id,media_url&limit=3',
  '/rest/v1/search_sessions?select=*&limit=1',
  '/auth/v1/user',
  '/rest/v1/rpc/get_search_stats',
  '/rest/v1/search_state?select=last_run_at&id=eq.1',
  '/rest/v1/content_items?select=count&limit=1'
];

// Vary request methods and payloads
const requestTypes = [
  { method: 'GET', path: '/', description: 'Home page ping' },
  { method: 'GET', path: '/auth/v1/settings', description: 'Auth settings' },
  { method: 'GET', path: '/rest/v1/', description: 'API root' },
  { method: 'HEAD', path: '/', description: 'Head request' },
  { method: 'OPTIONS', path: '/rest/v1/search_state', description: 'Options request' }
];

console.log('🚀 Enhanced JWT Traffic Simulator Starting...');
console.log('📡 Target URL:', supabaseUrl);
console.log('⏱️  Interval:', config.interval, 'ms');
console.log('👥 Max Users:', config.maxConcurrentUsers);
console.log('🎭 User Agents:', userAgents.length, 'variations');
console.log('🔗 API Endpoints:', apiEndpoints.length, 'variations');

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
      failedAPICalls: 0,
      userAgentVariations: new Set(),
      endpointVariations: new Set(),
      methodVariations: new Set()
    };
    this.activeUsers = 0;
    this.userCounter = 0;
  }

  getRandomDelay(baseDelay) {
    const variance = baseDelay * config.variancePercent;
    return baseDelay + (Math.random() * variance * 2 - variance);
  }

  getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  getRandomEndpoint() {
    return apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)];
  }

  getRandomRequestType() {
    return requestTypes[Math.floor(Math.random() * requestTypes.length)];
  }

  logActivity() {
    this.stats.lastActivity = Date.now();
  }

  async pingSupabase(userId) {
    return new Promise((resolve) => {
      const url = new URL(supabaseUrl);
      const userAgent = this.getRandomUserAgent();
      const requestType = this.getRandomRequestType();
      
      this.stats.userAgentVariations.add(userAgent);
      this.stats.methodVariations.add(requestType.method);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: requestType.path,
        method: requestType.method,
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/json,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
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
            resolve({ success: true, status: res.statusCode, message: 'Project active', method: requestType.method });
          } else {
            this.stats.failedPings++;
            resolve({ success: false, status: res.statusCode, message: 'Project inactive', method: requestType.method });
          }
        });
      });

      req.on('error', (err) => {
        this.stats.failedPings++;
        resolve({ success: false, error: err.message, method: requestType.method });
      });

      req.on('timeout', () => {
        req.destroy();
        this.stats.failedPings++;
        resolve({ success: false, error: 'Request timeout', method: requestType.method });
      });

      req.end();
    });
  }

  async makeAPICall(userId) {
    return new Promise((resolve) => {
      const url = new URL(supabaseUrl);
      const userAgent = this.getRandomUserAgent();
      const endpoint = this.getRandomEndpoint();
      
      this.stats.userAgentVariations.add(userAgent);
      this.stats.endpointVariations.add(endpoint);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: endpoint,
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'apikey': supabaseApiKey,
          'Authorization': `Bearer ${supabaseApiKey}`,
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
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
            resolve({ success: true, status: res.statusCode, message: 'API call successful', endpoint });
          } else {
            this.stats.failedAPICalls++;
            resolve({ success: false, status: res.statusCode, message: 'API call failed (expected)', endpoint });
          }
        });
      });

      req.on('error', (err) => {
        this.stats.failedAPICalls++;
        resolve({ success: false, error: err.message, endpoint });
      });

      req.on('timeout', () => {
        req.destroy();
        this.stats.failedAPICalls++;
        resolve({ success: false, error: 'Request timeout', endpoint });
      });

      req.end();
    });
  }

  async simulateUser(userId) {
    const userAgent = this.getRandomUserAgent();
    console.log(`👤 User ${userId} - Starting enhanced JWT session (${userAgent.substring(0, 30)}...)`);
    
    const startTime = Date.now();
    const sessionEndTime = startTime + config.sessionDuration;
    
    while (Date.now() < sessionEndTime) {
      try {
        // Vary the request pattern - not always 50/50
        const requestType = Math.random();
        let result;
        
        if (requestType < 0.4) {
          // 40% chance of ping
          result = await this.pingSupabase(userId);
          if (result.success) {
            console.log(`✅ User ${userId} - ${result.method} ping successful (${result.status})`);
          } else {
            console.log(`❌ User ${userId} - ${result.method} ping failed: ${result.error || result.message}`);
          }
        } else if (requestType < 0.8) {
          // 40% chance of API call
          result = await this.makeAPICall(userId);
          if (result.success) {
            console.log(`✅ User ${userId} - API call successful (${result.status}) - ${result.endpoint.substring(0, 30)}...`);
          } else {
            console.log(`⚠️  User ${userId} - API call failed (${result.status}) - ${result.endpoint.substring(0, 30)}... - expected`);
          }
        } else {
          // 20% chance of longer delay (simulating user thinking)
          const thinkTime = Math.random() * 5000 + 2000; // 2-7 seconds
          await new Promise(resolve => setTimeout(resolve, thinkTime));
          console.log(`🤔 User ${userId} - Thinking... (${Math.round(thinkTime/1000)}s)`);
          continue;
        }
        
        this.stats.totalRequests++;
        this.logActivity();
        
        // Vary delay between requests (more realistic)
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
    console.log('   Enhanced mode - URL pinging + API calls + varied patterns');
    console.log('   Keeps Supabase project active 24/7 with natural traffic');
    console.log('');
    
    console.log('🚀 Starting LGFC Enhanced JWT Traffic Simulator...');
    console.log(`⚙️  Interval: ${config.interval/1000}s, Max Users: ${config.maxConcurrentUsers}`);
    console.log(`🔗 Supabase URL: ${supabaseUrl}`);
    console.log('🔐 Enhanced JWT mode - Varied payloads and users');
    console.log('🌐 Generating natural activity to keep project active 24/7');
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
      // Vary the number of users started each cycle
      const usersToStart = Math.floor(Math.random() * 3) + 1; // 1-3 users per cycle
      
      // Start new users if we haven't reached the limit
      while (this.activeUsers < config.maxConcurrentUsers && usersToStart > 0) {
        this.userCounter++;
        this.activeUsers++;
        
        const userPromise = this.simulateUser(this.userCounter).finally(() => {
          this.activeUsers--;
        });
        
        userPromises.push(userPromise);
        
        // Vary delay between starting users
        const startDelay = Math.random() * 2000 + 500; // 0.5-2.5 seconds
        await new Promise(resolve => setTimeout(resolve, startDelay));
      }
      
      // Vary the interval slightly to avoid patterns
      const intervalVariation = config.interval + (Math.random() * 10000 - 5000); // ±5 seconds
      await new Promise(resolve => setTimeout(resolve, intervalVariation));
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
      projectStatus: this.stats.successfulPings > 0 ? 'Active' : 'Inactive',
      userAgentVariations: this.stats.userAgentVariations.size,
      endpointVariations: this.stats.endpointVariations.size,
      methodVariations: this.stats.methodVariations.size
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
  console.log(`🎭 User Agent Variations: ${stats.userAgentVariations}`);
  console.log(`🔗 Endpoint Variations: ${stats.endpointVariations}`);
  console.log(`📝 Method Variations: ${stats.methodVariations}`);
  
  process.exit(0);
});

// Start the simulator
const simulator = new EnhancedJWTTrafficSimulator();
simulator.start().catch(err => {
  console.error('❌ Enhanced JWT Traffic Simulator failed:', err);
  process.exit(1);
});