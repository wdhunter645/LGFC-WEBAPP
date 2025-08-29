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
