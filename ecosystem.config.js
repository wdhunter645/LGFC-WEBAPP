module.exports = {
  apps: [
    {
      name: 'lgfc-traffic-simulator',
      script: 'lgfc_enhanced_jwt_traffic_simulator.cjs',
      args: '--interval=300000 --users=15',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/traffic-simulator-error.log',
      out_file: './logs/traffic-simulator-out.log',
      log_file: './logs/traffic-simulator-combined.log',
      time: true,
      // Restart if process dies
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s',
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true
    }
  ]
};