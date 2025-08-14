# 🚀 TRAFFIC SIMULATOR MONITORING & AUTO-RESTART

## ✅ **Multiple Monitoring Solutions Available**

### **Problem:**
- Traffic simulator might stop unexpectedly
- Need automatic restart to maintain 24/7 activity
- Multiple monitoring options for different environments

### **Solutions Implemented:**
1. **PM2** (Recommended for Node.js)
2. **Systemd Service** (Linux systems)
3. **Watchdog Script** (Simple bash monitoring)
4. **Enhanced GitHub Actions** (Cloud-based monitoring)

---

## 🔧 **1. PM2 (Recommended)**

### **Features:**
- ✅ **Automatic restart** on failure
- ✅ **Process monitoring** and health checks
- ✅ **Log management** with rotation
- ✅ **Memory monitoring** and restart
- ✅ **Startup scripts** for system boot

### **Installation:**
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### **Usage:**
```bash
# Start the simulator
pm2 start lgfc-traffic-simulator

# Stop the simulator
pm2 stop lgfc-traffic-simulator

# Restart the simulator
pm2 restart lgfc-traffic-simulator

# View status
pm2 status

# View logs
pm2 logs lgfc-traffic-simulator

# Monitor in real-time
pm2 monit
```

---

## 🔧 **2. Systemd Service (Linux)**

### **Features:**
- ✅ **System-level service** management
- ✅ **Automatic restart** on failure
- ✅ **Boot-time startup**
- ✅ **Log integration** with journald

### **Installation:**
```bash
# Copy service file
sudo cp lgfc-traffic-simulator.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable lgfc-traffic-simulator.service
```

### **Usage:**
```bash
# Start the service
sudo systemctl start lgfc-traffic-simulator

# Stop the service
sudo systemctl stop lgfc-traffic-simulator

# Check status
sudo systemctl status lgfc-traffic-simulator

# View logs
sudo journalctl -u lgfc-traffic-simulator -f
```

---

## 🔧 **3. Watchdog Script (Simple)**

### **Features:**
- ✅ **Simple bash monitoring**
- ✅ **Automatic restart** on failure
- ✅ **Logging** to files
- ✅ **Configurable** check intervals

### **Usage:**
```bash
# Make executable
chmod +x watchdog_traffic_simulator.sh

# Start watchdog
./watchdog_traffic_simulator.sh

# Stop watchdog
pkill -f watchdog_traffic_simulator.sh

# View logs
tail -f logs/watchdog.log
```

### **Configuration:**
```bash
# Edit watchdog settings
CHECK_INTERVAL=30    # Check every 30 seconds
MAX_RESTARTS=10      # Maximum restart attempts
```

---

## 🔧 **4. Enhanced GitHub Actions**

### **Features:**
- ✅ **Cloud-based monitoring**
- ✅ **Process health checks**
- ✅ **Automatic restart** within workflow
- ✅ **Log artifacts** for debugging

### **Usage:**
- **Automatic**: Runs every 5 minutes via cron
- **Manual**: Trigger via GitHub Actions UI
- **Monitoring**: Built-in health checks and restart logic

---

## 🚀 **Quick Installation**

### **Run the installer:**
```bash
./install_monitoring.sh
```

### **This will:**
- ✅ Install PM2 if needed
- ✅ Create systemd service (Linux)
- ✅ Setup watchdog script
- ✅ Create status checking script
- ✅ Configure all monitoring options

---

## 📊 **Monitoring Commands**

### **Check Status:**
```bash
./check_status.sh
```

### **View Logs:**
```bash
# PM2 logs
pm2 logs lgfc-traffic-simulator

# Systemd logs
sudo journalctl -u lgfc-traffic-simulator -f

# Watchdog logs
tail -f logs/watchdog.log

# Simulator logs
tail -f logs/simulator.log
```

### **Restart Services:**
```bash
# PM2 restart
pm2 restart lgfc-traffic-simulator

# Systemd restart
sudo systemctl restart lgfc-traffic-simulator

# Watchdog restart
pkill -f watchdog_traffic_simulator.sh && ./watchdog_traffic_simulator.sh
```

---

## 🎯 **Recommended Setup**

### **For Production:**
1. **PM2** for process management
2. **Systemd** for system integration
3. **GitHub Actions** for cloud monitoring

### **For Development:**
1. **Watchdog script** for simple monitoring
2. **PM2** for process management

### **For Cloud:**
1. **GitHub Actions** with enhanced monitoring
2. **PM2** if running on cloud servers

---

## 📈 **Monitoring Features**

### **Health Checks:**
- ✅ **Process monitoring** - Check if simulator is running
- ✅ **Memory monitoring** - Restart if memory usage is high
- ✅ **Error monitoring** - Restart on fatal errors
- ✅ **Uptime monitoring** - Track successful operation time

### **Auto-Restart:**
- ✅ **Immediate restart** on process death
- ✅ **Delayed restart** to avoid rapid cycling
- ✅ **Maximum restart limits** to prevent infinite loops
- ✅ **Graceful shutdown** handling

### **Logging:**
- ✅ **Structured logs** with timestamps
- ✅ **Error logging** for debugging
- ✅ **Performance metrics** tracking
- ✅ **Log rotation** to manage disk space

---

## 🔍 **Troubleshooting**

### **Common Issues:**

**1. Process not starting:**
```bash
# Check Node.js installation
node --version

# Check script permissions
ls -la lgfc_enhanced_jwt_traffic_simulator.cjs

# Check logs
tail -f logs/simulator.log
```

**2. PM2 not working:**
```bash
# Reinstall PM2
npm uninstall -g pm2
npm install -g pm2

# Reset PM2
pm2 kill
pm2 start ecosystem.config.js
```

**3. Systemd service failing:**
```bash
# Check service status
sudo systemctl status lgfc-traffic-simulator

# Check service logs
sudo journalctl -u lgfc-traffic-simulator -n 50

# Test service manually
sudo systemctl start lgfc-traffic-simulator
```

---

## 🎉 **Status: Monitoring Ready!**

### **What We've Created:**
1. ✅ **PM2 ecosystem configuration**
2. ✅ **Systemd service file**
3. ✅ **Watchdog monitoring script**
4. ✅ **Enhanced GitHub Actions workflow**
5. ✅ **Installation and status scripts**

### **Next Steps:**
1. **Run installation**: `./install_monitoring.sh`
2. **Choose monitoring method**: PM2 (recommended)
3. **Start monitoring**: `pm2 start ecosystem.config.js`
4. **Verify operation**: `./check_status.sh`

**The traffic simulator now has robust monitoring and auto-restart capabilities!** 🚀