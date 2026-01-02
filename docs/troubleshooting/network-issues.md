# Network Issues Troubleshooting Guide

## Common Network Problems and Solutions

---

## Can't Access Application from Other Devices

### Symptoms
- Application works on `localhost` but not from other devices
- Other devices can't reach `http://finsight.local` or IP address

### Solutions

#### 1. Check Windows Firewall

```powershell
# Verify firewall rules exist
Get-NetFirewallRule -DisplayName "FINSIGHT*"

# If missing, run configuration script
.\deployment\scripts\configure-firewall.ps1
```

#### 2. Verify Network Profile

```powershell
# Check current network profile
Get-NetConnectionProfile

# Should be "Private" not "Public"
# If Public, change to Private:
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
```

#### 3. Check All Devices on Same WiFi

- Verify laptop and test device connected to same network
- Check WiFi SSID matches
- Some campus WiFi have device isolation - try different network

#### 4. Test with IP Address Directly

```powershell
# Find your IP
.\deployment\scripts\get-local-ip.ps1

# Test from other device
http://192.168.1.100  # Use your actual IP
```

---

## DNS Resolution Fails

### Symptoms
- `ping finsight.local` fails
- `nslookup finsight.local` returns error

### Solutions

#### 1. Check Dnsmasq Status

```bash
# In WSL2
sudo service dnsmasq status

# If not running, start it
sudo service dnsmasq start
```

#### 2. Verify DNS Configuration

```bash
# Check dnsmasq config
cat /etc/dnsmasq.conf | grep finsight

# Should show:
# address=/finsight.local/192.168.1.100
```

#### 3. Update IP Address

```bash
# Edit dnsmasq config
sudo nano /etc/dnsmasq.conf

# Update IP address to match current WiFi IP
# Save and restart
sudo service dnsmasq restart
```

#### 4. Flush DNS Cache

```powershell
# Windows
ipconfig /flushdns

# Then test
nslookup finsight.local
```

#### 5. Fallback to Hosts File

If dnsmasq doesn't work, use manual hosts file:

```
# Windows: C:\Windows\System32\drivers\etc\hosts
192.168.1.100  finsight.local
```

---

## Slow Network Performance

### Symptoms
- Application loads slowly
- High latency
- Timeouts

### Solutions

#### 1. Check Network Speed

```powershell
# Test ping to laptop
ping 192.168.1.100

# Should be < 10ms on local network
```

#### 2. Reduce Docker Resource Usage

```powershell
# Check Docker stats
docker stats

# If high CPU/memory, restart containers
docker-compose -f deployment\docker\docker-compose.local.yml restart
```

#### 3. Close Unnecessary Applications

- Close browser tabs
- Stop background applications
- Disable Windows updates

#### 4. Use Wired Connection

- Connect laptop via Ethernet cable
- More stable than WiFi
- Lower latency

---

## Port Already in Use

### Symptoms
- Docker fails to start: "port is already allocated"
- Error on port 80, 3306, or 8080

### Solutions

#### 1. Find Process Using Port

```powershell
# Check port 80
netstat -ano | findstr :80

# Note the PID (last column)
```

#### 2. Kill Process

```powershell
# Kill process by PID
taskkill /PID <PID> /F
```

#### 3. Common Port Conflicts

**Port 80 (HTTP):**
- IIS (Internet Information Services)
- Skype
- Other web servers

**Port 3306 (MySQL):**
- Local MySQL installation
- XAMPP/WAMP

**Port 8080 (phpMyAdmin):**
- Other development servers

#### 4. Change Docker Ports

Edit `deployment/docker/docker-compose.local.yml`:

```yaml
ports:
  - "8000:80"  # Use 8000 instead of 80
  - "3307:3306"  # Use 3307 instead of 3306
  - "8081:80"  # Use 8081 instead of 8080
```

---

## WiFi Disconnects

### Symptoms
- WiFi connection drops randomly
- Application becomes inaccessible

### Solutions

#### 1. Disable Power Saving

```powershell
# Disable WiFi adapter power saving
# Device Manager → Network Adapters → WiFi → Properties
# Power Management → Uncheck "Allow computer to turn off this device"
```

#### 2. Keep Laptop Plugged In

- Battery mode may throttle WiFi
- Keep laptop connected to power

#### 3. Use Mobile Hotspot Backup

```powershell
# Enable phone hotspot
# Connect laptop to hotspot
# Update IP address in configs
# Visitors connect to your hotspot
```

---

## IP Address Changes

### Symptoms
- Application worked yesterday, doesn't work today
- Different WiFi network

### Solutions

#### 1. Find New IP Address

```powershell
.\deployment\scripts\get-local-ip.ps1
```

#### 2. Update Configurations

```bash
# Update dnsmasq
sudo nano /etc/dnsmasq.conf
# Change IP address
sudo service dnsmasq restart
```

```powershell
# Update Docker environment
notepad deployment\docker\.env.local
# Update LOCAL_IP variable
docker-compose -f deployment\docker\docker-compose.local.yml restart
```

---

## Campus WiFi Restrictions

### Symptoms
- Can't access from other devices on campus WiFi
- Firewall rules don't help

### Solutions

#### 1. Check WiFi Type

- Some campus WiFi have **device isolation**
- Devices can't communicate with each other
- Contact campus IT to confirm

#### 2. Use Different Network

- Try different WiFi network (guest network, etc.)
- Use mobile hotspot
- Request special network access from IT

#### 3. Use Eduroam or Enterprise WiFi

- Enterprise WiFi usually allows device communication
- Configure laptop and test devices on same enterprise network

---

## Quick Diagnostic Commands

```powershell
# Check laptop IP
ipconfig

# Check WiFi connection
Get-NetConnectionProfile

# Check firewall rules
Get-NetFirewallRule -DisplayName "FINSIGHT*"

# Test local access
curl http://localhost

# Check Docker containers
docker ps

# Test DNS
nslookup finsight.local
ping finsight.local
```

```bash
# In WSL2
# Check dnsmasq
sudo service dnsmasq status

# Check Nagios
sudo service nagios status

# Test DNS config
sudo dnsmasq --test
```

---

## Still Having Issues?

1. **Restart everything:**
   ```powershell
   # Restart Docker
   docker-compose -f deployment\docker\docker-compose.local.yml restart
   
   # Restart WSL
   wsl --shutdown
   
   # Restart Windows
   ```

2. **Use localhost demo:**
   - Demo on laptop screen only
   - Connect to external monitor via HDMI

3. **Contact support:**
   - Check documentation
   - Review error logs
   - Ask for help from team/instructor
