#!/usr/bin/env node

/**
 * Lou Gehrig Fan Club - Keep Alive Script
 * 
 * Simple script to keep Supabase project active by pinging the URL
 * Doesn't require database access, just keeps the project from going idle
 * 
 * Usage:
 *   node lgfc_keep_alive.cjs
 *   node lgfc_keep_alive.cjs --interval=300000
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const config = {
  interval: parseInt(process.argv.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 300000, // 5 minutes default
  supabaseUrl: process.env.SUPABASE_URL || 'https://vkwhrbjkdznncjkzkiuo.supabase.co'
};

if (!config.supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  process.exit(1);
}

class KeepAlivePinger {
  constructor() {
    this.stats = {
      totalPings: 0,
      successfulPings: 0,
      failedPings: 0,
      startTime: Date.now(),
      lastPing: null
    };
  }

  async pingSupabase() {
    return new Promise((resolve) => {
      const url = new URL(config.supabaseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'GET',
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        this.stats.totalPings++;
        this.stats.lastPing = Date.now();
        
        if (res.statusCode >= 200 && res.statusCode < 500) {
          this.stats.successfulPings++;
          console.log(`✅ Ping successful (${res.statusCode}) - ${new Date().toLocaleTimeString()}`);
        } else {
          this.stats.failedPings++;
          console.log(`⚠️  Ping failed (${res.statusCode}) - ${new Date().toLocaleTimeString()}`);
        }
        resolve();
      });

      req.on('error', (err) => {
        this.stats.totalPings++;
        this.stats.failedPings++;
        console.log(`❌ Ping error: ${err.message} - ${new Date().toLocaleTimeString()}`);
        resolve();
      });

      req.on('timeout', () => {
        this.stats.totalPings++;
        this.stats.failedPings++;
        console.log(`⏰ Ping timeout - ${new Date().toLocaleTimeString()}`);
        req.destroy();
        resolve();
      });

      req.end();
    });
  }

  displayStats() {
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    const successRate = this.stats.totalPings > 0 ? 
      ((this.stats.successfulPings / this.stats.totalPings) * 100).toFixed(1) : '0.0';
    
    console.log('\n📊 KEEP ALIVE STATS:');
    console.log(`⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s`);
    console.log(`📡 Total Pings: ${this.stats.totalPings}`);
    console.log(`✅ Successful: ${this.stats.successfulPings}`);
    console.log(`❌ Failed: ${this.stats.failedPings}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    
    if (this.stats.lastPing) {
      const lastPingTime = new Date(this.stats.lastPing).toLocaleTimeString();
      console.log(`🔄 Last Ping: ${lastPingTime}`);
    }
    
    console.log(`🔗 Target: ${config.supabaseUrl}`);
    console.log(`⏰ Interval: ${config.interval/1000}s`);
  }

  async run() {
    console.log('🚀 Starting LGFC Keep Alive Pinger...');
    console.log(`🔗 Supabase URL: ${config.supabaseUrl}`);
    console.log(`⏰ Ping Interval: ${config.interval/1000} seconds`);
    console.log('🌐 Keeping project active 24/7\n');
    
    // Initial ping
    await this.pingSupabase();
    
    // Display stats every 5 minutes
    const statsInterval = setInterval(() => this.displayStats(), 300000);
    
    // Main ping loop
    const pingLoop = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, config.interval));
        await this.pingSupabase();
        pingLoop(); // Continue the loop
      } catch (err) {
        console.error('❌ Ping loop error:', err);
        // Continue despite errors
        setTimeout(pingLoop, 10000);
      }
    };
    
    // Start the ping loop
    pingLoop();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Keep alive interrupted by user');
      clearInterval(statsInterval);
      this.displayStats();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Keep alive terminated');
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

// Run keep alive
if (require.main === module) {
  console.log('🎯 Lou Gehrig Fan Club Keep Alive Pinger');
  console.log('   Keeps Supabase project active 24/7');
  console.log('   Prevents project from going idle\n');
  
  const pinger = new KeepAlivePinger();
  pinger.run().catch(err => {
    console.error('❌ Keep alive failed:', err);
    process.exit(1);
  });
}