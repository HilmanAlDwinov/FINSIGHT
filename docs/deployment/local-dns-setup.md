# Local DNS Setup Guide - Containerized Approach

## Overview

This guide explains how to configure local DNS for FINSIGHT application using a containerized BIND9 DNS server, allowing access via `finsight.local` domain name on your campus WiFi network.

## Prerequisites

- Windows 10/11 with Docker Desktop installed
- FINSIGHT application running on Docker
- Admin/root access to your laptop
- All devices connected to the same WiFi network

---

## Method 1: Using Containerized BIND9 DNS Server (Recommended for Multiple Devices)

### Step 1: Start the Containerized Stack

The DNS server is included in the local deployment configuration:

```bash
# Start all services including DNS and Nagios
docker-compose -f deployment/docker/docker-compose.local.yml up -d
```

This will start:
- `finsight-app`: Main application server
- `finsight-mysql`: Database server
- `finsight-dns`: BIND9 DNS server
- `finsight-nagios`: Nagios monitoring server

### Step 2: Find Your Laptop's IP Address

```powershell
# Run the helper script
.\deployment\scripts\get-local-ip.ps1
```

Note the WiFi IP address (e.g., `192.168.1.100`)

### Step 3: Configure DNS on Client Devices

#### For Each Device That Needs Access:

**Option A: Configure Device DNS Settings (Recommended)**
1. Go to Network Settings on the device
2. Find WiFi network properties/settings
3. Change DNS settings to use your laptop's IP as primary DNS
4. Example: Set DNS to `192.168.1.100` (your laptop's IP)

**Option B: Manual Hosts File (Windows)**
1. Open Notepad as **Administrator**
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add this line (replace with your IP):
   ```
   192.168.1.100  finsight.local
   ```
4. Save the file

**Option C: Manual Hosts File (Mac/Linux)**
```bash
sudo nano /etc/hosts
```
Add:
```
192.168.1.100  finsight.local
```

---

## Verification

### Test DNS Resolution

```bash
# Should return the Docker container IP (typically in 172.20.x.x range)
nslookup finsight.local 192.168.1.100
```

### Access FINSIGHT

Open browser and navigate to:
- `http://finsight.local` - Main application
- `http://finsight.local:8080` - phpMyAdmin
- `http://finsight.local:8080/nagios` - Nagios monitoring (username: nagiosadmin, password: nagios123)

---

## Troubleshooting

### DNS Not Resolving

**Problem:** `nslookup finsight.local` fails

**Solutions:**
1. Check if DNS container is running:
   ```bash
   docker ps | grep dns
   ```
2. Check DNS container logs:
   ```bash
   docker logs finsight-dns
   ```
3. Verify IP address is correct
4. Flush DNS cache:
   ```powershell
   ipconfig /flushdns
   ```

### Can't Access from Other Devices

**Problem:** Other devices can't reach `finsight.local`

**Solutions:**
1. Check Windows Firewall (run `configure-firewall.ps1`)
2. Verify all devices on same WiFi network
3. Ensure DNS is configured on client devices
4. Check if laptop's WiFi has "Public" profile (should be "Private")
5. Use IP address directly as fallback: `http://192.168.1.100`

### DNS Container Won't Start

**Problem:** `docker-compose up` shows DNS container failing

**Solutions:**
1. Check for port conflicts (port 53 must be free):
   ```powershell
   netstat -an | findstr :53
   ```
2. Stop conflicting services (like Windows DNS Client service)
3. Check configuration files in `deployment/dns/` directory

---

## For Expo Day

### Quick Setup Checklist:

1. ✅ Find your WiFi IP: Run `get-local-ip.ps1`
2. ✅ Start all containers: `docker-compose -f deployment\docker\docker-compose.local.yml up -d`
3. ✅ Configure firewall: Run `configure-firewall.ps1` as Admin
4. ✅ Test from your laptop: `http://finsight.local`
5. ✅ Test DNS resolution: `nslookup finsight.local`
6. ✅ Test from another device (phone/laptop)

### Backup Plan:

If DNS fails, share your IP address directly:
- Access via: `http://192.168.1.100` (your actual IP)
- Write IP on whiteboard for visitors

---

## Next Steps

- [Local Network Deployment Guide](local-network-deployment.md)
- [Expo Preparation Guide](expo-preparation.md)
