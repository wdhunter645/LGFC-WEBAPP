#!/bin/bash

# Lou Gehrig Fan Club Traffic Simulator Monitoring Installation
# Installs and configures monitoring for the traffic simulator

echo "🚀 Installing Traffic Simulator Monitoring..."

# Create logs directory
mkdir -p logs

# Make watchdog script executable
chmod +x watchdog_traffic_simulator.sh

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Create PM2 startup script
echo "🔧 Creating PM2 startup script..."
cat > start_traffic_simulator.sh << 'EOF'
#!/bin/bash
cd /workspace
pm2 start ecosystem.config.js
pm2 save
pm2 startup
EOF

chmod +x start_traffic_simulator.sh

# Create systemd service (if on Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔧 Creating systemd service..."
    sudo cp lgfc-traffic-simulator.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable lgfc-traffic-simulator.service
    echo "✅ Systemd service created and enabled"
fi

# Create monitoring status script
cat > check_status.sh << 'EOF'
#!/bin/bash
echo "=== Traffic Simulator Status ==="

# Check PM2
if command -v pm2 &> /dev/null; then
    echo "📊 PM2 Status:"
    pm2 status
    echo ""
fi

# Check systemd service
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔧 Systemd Service Status:"
    sudo systemctl status lgfc-traffic-simulator.service --no-pager
    echo ""
fi

# Check watchdog
echo "🐕 Watchdog Status:"
if pgrep -f "watchdog_traffic_simulator.sh" > /dev/null; then
    echo "✅ Watchdog is running (PID: $(pgrep -f watchdog_traffic_simulator.sh))"
else
    echo "❌ Watchdog is not running"
fi

# Check simulator
echo "🚀 Simulator Status:"
if pgrep -f "lgfc_enhanced_jwt_traffic_simulator.cjs" > /dev/null; then
    echo "✅ Traffic simulator is running (PID: $(pgrep -f lgfc_enhanced_jwt_traffic_simulator.cjs))"
else
    echo "❌ Traffic simulator is not running"
fi

echo ""
echo "📋 Recent logs:"
tail -n 10 logs/watchdog.log 2>/dev/null || echo "No watchdog logs found"
EOF

chmod +x check_status.sh

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Available monitoring options:"
echo ""
echo "1. PM2 (Recommended):"
echo "   Start: ./start_traffic_simulator.sh"
echo "   Stop: pm2 stop lgfc-traffic-simulator"
echo "   Status: pm2 status"
echo ""
echo "2. Systemd Service (Linux):"
echo "   Start: sudo systemctl start lgfc-traffic-simulator"
echo "   Stop: sudo systemctl stop lgfc-traffic-simulator"
echo "   Status: sudo systemctl status lgfc-traffic-simulator"
echo ""
echo "3. Watchdog Script:"
echo "   Start: ./watchdog_traffic_simulator.sh"
echo "   Stop: pkill -f watchdog_traffic_simulator.sh"
echo ""
echo "4. Status Check:"
echo "   ./check_status.sh"
echo ""
echo "🎯 Recommended setup: Use PM2 for production monitoring"