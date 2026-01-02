# Containerized Nagios Monitoring Setup Guide

## Overview

This guide explains how to use the containerized Nagios Core monitoring system that's included in the FINSIGHT local deployment stack. This approach eliminates the need for WSL2 installation by running Nagios in a Docker container.

---

## Prerequisites

- ✅ Windows 10/11 (64-bit) with Docker Desktop
- ✅ FINSIGHT application running on Docker
- ✅ Admin access to Windows (for firewall configuration)

---

## Containerized Monitoring Setup

### Step 1: Start the Containerized Stack

The Nagios monitoring server is included in the local deployment configuration:

```bash
# Start all services including DNS and Nagios
docker-compose -f deployment/docker/docker-compose.local.yml up -d
```

This will start:
- `finsight-app`: Main application server
- `finsight-mysql`: Database server
- `finsight-dns`: BIND9 DNS server
- `finsight-nagios`: Nagios monitoring server

### Step 2: Verify Container Status

```bash
# Check if all containers are running
docker ps
```

You should see all four containers running: `finsight-app`, `finsight-mysql`, `finsight-dns`, and `finsight-nagios`.

### Step 3: Access Nagios Web Interface

Open browser and navigate to:
```
http://localhost:8080/nagios
```

**Login credentials:**
- Username: `nagiosadmin`
- Password: `nagios123`

Alternatively, if using DNS resolution:
- `http://finsight.local:8080/nagios`

---

## Configure FINSIGHT Monitoring

### Monitoring Configuration

The containerized Nagios is pre-configured with monitoring for:
- **Docker containers**: finsight-app, finsight-mysql, finsight-dns, finsight-nagios
- **HTTP services**: Main application and API health checks
- **MySQL database**: Connection and performance monitoring
- **DNS service**: Port and query resolution monitoring

### Configuration Files

The monitoring configuration is defined in:
- `monitoring/nagios-configs/finsight.cfg` - Main monitoring definitions
- This file is automatically mounted into the Nagios container at startup

---

## Testing Monitoring

### Test 1: Stop a Container

```powershell
# Stop MySQL container to test alerting
docker stop finsight-mysql

# Wait 3-5 minutes
# Check Nagios dashboard - should show CRITICAL alert for MySQL container
```

Restart container:
```powershell
docker start finsight-mysql
# Alert should clear to OK after a few minutes
```

### Test 2: View Monitoring Dashboard

1. Open `http://localhost:8080/nagios` (or `http://finsight.local:8080/nagios`)
2. Click **Services** in left menu
3. You should see:
   - Docker containers (app, mysql, dns, nagios)
   - HTTP services (FINSIGHT web app and API health)
   - MySQL connection monitoring
   - DNS service monitoring

---

## Nagios Container Management

### Container Commands

```bash
# Check Nagios container status
docker ps | grep nagios

# View Nagios container logs
docker logs finsight-nagios

# Restart Nagios container
docker restart finsight-nagios

# Execute commands inside Nagios container
docker exec -it finsight-nagios bash
```

### Configuration Verification

```bash
# Enter the Nagios container
docker exec -it finsight-nagios bash

# Verify Nagios configuration
/usr/local/nagios/bin/nagios -v /usr/local/nagios/etc/nagios.cfg
```

Should show: "Things look okay - No serious problems were detected"

---

## Troubleshooting

### Nagios Container Won't Start

**Problem:** `docker-compose up` shows Nagios container failing

**Solutions:**
1. Check container logs:
   ```bash
   docker logs finsight-nagios
   ```
2. Check for port conflicts (port 80 in container maps to 8080 on host):
   ```powershell
   netstat -an | findstr :8080
   ```
3. Verify configuration file syntax:
   ```bash
   docker exec finsight-nagios /usr/local/nagios/bin/nagios -v /usr/local/nagios/etc/nagios.cfg
   ```

### Can't Access Web Interface

**Problem:** `http://localhost:8080/nagios` doesn't work

**Solutions:**
1. Check if container is running:
   ```bash
   docker ps | grep nagios
   ```
2. Check container logs:
   ```bash
   docker logs finsight-nagios
   ```
3. Verify port 8080 is not used by another service

### Authentication Failed

**Problem:** Wrong username/password

**Solutions:**
1. Default credentials are:
   - Username: `nagiosadmin`
   - Password: `nagios123`
2. If you've set environment variables, use those instead

### Services Show "PENDING"

**Problem:** Services stuck in PENDING state

**Solutions:**
1. Wait 5-10 minutes (initial checks take time)
2. Force check via web interface:
   - Go to service in web interface
   - Click "Re-schedule the next check"
3. Restart Nagios container:
   ```bash
   docker restart finsight-nagios
   ```

---

## Benefits of Containerized Approach

### Advantages over WSL2 Installation:
- ✅ No need to install WSL2 or Ubuntu
- ✅ No complex compilation process
- ✅ Easy to start/stop with Docker
- ✅ Consistent environment across systems
- ✅ Automatic configuration mounting
- ✅ Isolated from host system

### Maintenance:
- Updates: Simply pull new image version
- Backups: Container state is ephemeral, configurations are mounted from host
- Scaling: Can be extended to monitor multiple applications

---

## Next Steps

- [Monitoring Configuration Guide](nagios-monitoring-config.md)
- [Alert Setup Guide](nagios-alerting-setup.md)
- [Expo Preparation](../deployment/expo-preparation.md)
