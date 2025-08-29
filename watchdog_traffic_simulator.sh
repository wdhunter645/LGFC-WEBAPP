#!/bin/bash

# Lou Gehrig Fan Club Traffic Simulator Watchdog
# Monitors and restarts the traffic simulator if it stops

SCRIPT_NAME="lgfc_enhanced_jwt_traffic_simulator.cjs"
LOG_FILE="./logs/watchdog.log"
SIMULATOR_LOG="./logs/simulator.log"
CHECK_INTERVAL=30  # Check every 30 seconds
MAX_RESTARTS=10
RESTART_COUNT=0

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if process is running
is_running() {
    pgrep -f "$SCRIPT_NAME" > /dev/null 2>&1
}

# Start the simulator
start_simulator() {
    log "Starting traffic simulator..."
    nohup node "$SCRIPT_NAME" --interval=300000 --users=15 > "$SIMULATOR_LOG" 2>&1 &
    sleep 5
    
    if is_running; then
        log "Traffic simulator started successfully (PID: $(pgrep -f $SCRIPT_NAME))"
        return 0
    else
        log "Failed to start traffic simulator"
        return 1
    fi
}

# Stop the simulator
stop_simulator() {
    log "Stopping traffic simulator..."
    pkill -f "$SCRIPT_NAME"
    sleep 2
    
    if is_running; then
        log "Force killing traffic simulator..."
        pkill -9 -f "$SCRIPT_NAME"
    fi
}

# Main watchdog loop
main() {
    log "=== Traffic Simulator Watchdog Started ==="
    log "Monitoring script: $SCRIPT_NAME"
    log "Check interval: ${CHECK_INTERVAL}s"
    log "Max restarts: $MAX_RESTARTS"
    
    # Start the simulator initially
    if ! start_simulator; then
        log "ERROR: Could not start traffic simulator initially"
        exit 1
    fi
    
    while true; do
        if ! is_running; then
            log "WARNING: Traffic simulator is not running!"
            
            if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
                log "ERROR: Maximum restart attempts ($MAX_RESTARTS) reached. Stopping watchdog."
                exit 1
            fi
            
            RESTART_COUNT=$((RESTART_COUNT + 1))
            log "Restarting traffic simulator (attempt $RESTART_COUNT/$MAX_RESTARTS)..."
            
            if start_simulator; then
                log "Traffic simulator restarted successfully"
            else
                log "ERROR: Failed to restart traffic simulator"
            fi
        else
            # Reset restart count if running successfully
            if [ $RESTART_COUNT -gt 0 ]; then
                log "Traffic simulator is running normally. Reset restart count."
                RESTART_COUNT=0
            fi
        fi
        
        sleep $CHECK_INTERVAL
    done
}

# Handle shutdown
cleanup() {
    log "Shutting down watchdog..."
    stop_simulator
    log "Watchdog stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main