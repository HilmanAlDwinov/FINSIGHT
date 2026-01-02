# Local Network Deployment Guide

## Overview

This guide explains how to deploy FINSIGHT application on your local network for expo/demo purposes using Docker.

---

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ FINSIGHT source code
- ✅ Local DNS configured (see [local-dns-setup.md](local-dns-setup.md))
- ✅ Windows Firewall configured

---

## Deployment Steps

### Step 1: Prepare Environment Variables

```powershell
# Navigate to deployment folder
cd deployment\docker

# Copy environment template
copy .env.local.example .env.local

# Edit .env.local with your settings
notepad .env.local
```

Update these values:
```env
LOCAL_IP=192.168.1.100  # Your actual WiFi IP
DB_PASSWORD=your_secure_password
OPENAI_API_KEY=your_api_key
```

### Step 2: Start Docker Containers

```powershell
# Navigate to project root
cd d:\SMSTR 3\FINSIGHT\FINSIGHT

# Start containers using local network configuration
docker-compose -f deployment\docker\docker-compose.local.yml --env-file deployment\docker\.env.local up -d
```

### Step 3: Verify Containers are Running

```powershell
# Check container status
docker ps

# You should see:
# - finsight-app (PHP application)
# - finsight-mysql (MySQL database)
# - finsight-phpmyadmin (Database management)
```

### Step 4: Check Container Logs

```powershell
# View application logs
docker logs finsight-app

# View database logs
docker logs finsight-mysql
```

### Step 5: Test Local Access

Open browser and test:
- `http://localhost` - Should show FINSIGHT
- `http://localhost:8080` - Should show phpMyAdmin
- `http://finsight.local` - Should show FINSIGHT (if DNS configured)

### Step 6: Configure Windows Firewall

```powershell
# Run as Administrator
.\deployment\scripts\configure-firewall.ps1
```

This opens ports:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3306 (MySQL - for monitoring)
- Port 8080 (phpMyAdmin)

### Step 7: Test Network Access

From another device on the same WiFi:

```
# Using DNS (if configured)
http://finsight.local

# Using IP directly
http://192.168.1.100
```

---

## Network Configuration

### Finding Your IP Address

```powershell
# Use helper script
.\deployment\scripts\get-local-ip.ps1
```

Or manually:
```powershell
ipconfig
# Look for "IPv4 Address" under WiFi adapter
```

### Changing Network

If you switch WiFi networks:

1. Find new IP address
2. Update `deployment/dns/dnsmasq.conf`
3. Update `deployment/docker/.env.local`
4. Restart dnsmasq: `sudo service dnsmasq restart`
5. Restart Docker containers:
   ```powershell
   docker-compose -f deployment\docker\docker-compose.local.yml restart
   ```

---

## Container Management

### Start Containers
```powershell
docker-compose -f deployment\docker\docker-compose.local.yml up -d
```

### Stop Containers
```powershell
docker-compose -f deployment\docker\docker-compose.local.yml down
```

### Restart Containers
```powershell
docker-compose -f deployment\docker\docker-compose.local.yml restart
```

### View Logs
```powershell
# All containers
docker-compose -f deployment\docker\docker-compose.local.yml logs -f

# Specific container
docker logs -f finsight-app
```

### Rebuild Containers (after code changes)
```powershell
docker-compose -f deployment\docker\docker-compose.local.yml up -d --build
```

---

## Troubleshooting

### Can't Access from Other Devices

**Problem:** Other devices can't reach the application

**Solutions:**
1. Check firewall rules:
   ```powershell
   Get-NetFirewallRule -DisplayName "FINSIGHT*"
   ```
2. Verify all devices on same WiFi
3. Check Docker containers are running: `docker ps`
4. Try IP address instead of domain name
5. Ensure WiFi profile is "Private" not "Public":
   ```powershell
   Get-NetConnectionProfile
   # If Public, change to Private:
   Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
   ```

### Database Connection Failed

**Problem:** Application can't connect to database

**Solutions:**
1. Check MySQL container is running:
   ```powershell
   docker ps | findstr mysql
   ```
2. Check database logs:
   ```powershell
   docker logs finsight-mysql
   ```
3. Verify credentials in `.env.local`
4. Restart containers:
   ```powershell
   docker-compose -f deployment\docker\docker-compose.local.yml restart
   ```

### Port Already in Use

**Problem:** `Error: port is already allocated`

**Solutions:**
1. Check what's using the port:
   ```powershell
   netstat -ano | findstr :80
   ```
2. Stop the conflicting service
3. Or change port in `docker-compose.local.yml`:
   ```yaml
   ports:
     - "8000:80"  # Use port 8000 instead
   ```

### Slow Performance

**Problem:** Application is slow or unresponsive

**Solutions:**
1. Check Docker resource usage:
   ```powershell
   docker stats
   ```
2. Increase Docker Desktop resources:
   - Open Docker Desktop → Settings → Resources
   - Increase CPU and Memory allocation
3. Check network speed
4. Restart Docker Desktop

---

## Performance Optimization

### For Expo Day

1. **Close unnecessary applications** to free up resources
2. **Disable Windows updates** during expo
3. **Keep laptop plugged in** (don't rely on battery)
4. **Use wired connection** if available (more stable than WiFi)
5. **Test with multiple concurrent users** before expo

### Docker Resource Limits

Edit `docker-compose.local.yml` to set resource limits:

```yaml
services:
  php-app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

---

## Security Considerations

### For Local Network Only

Since this is for expo/demo:
- ✅ Use simple passwords (easier to demo)
- ✅ Don't expose to internet
- ✅ Only accessible on campus WiFi
- ⚠️ Not for production use

### If Exposing to Internet (NOT Recommended)

If you must expose to internet:
- ❌ Don't use default passwords
- ❌ Enable HTTPS with SSL certificates
- ❌ Use strong database passwords
- ❌ Enable rate limiting
- ❌ Use VPN or firewall rules

---

## Next Steps

- [Nagios Monitoring Setup](../monitoring/nagios-windows-installation.md)
- [Expo Preparation Guide](expo-preparation.md)
- [Troubleshooting Guide](../troubleshooting/network-issues.md)
