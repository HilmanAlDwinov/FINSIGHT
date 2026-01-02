# Expo Preparation Guide

## Overview

Complete checklist and preparation guide for demonstrating FINSIGHT application at expo/presentation.

---

## 1 Week Before Expo

### Technical Preparation

- [ ] **Test complete setup end-to-end**
  - Deploy application on local network
  - Configure DNS
  - Setup Nagios monitoring
  - Test from multiple devices

- [ ] **Prepare demo data**
  - Create sample user accounts
  - Add realistic transaction data
  - Setup budgets and goals
  - Generate insights

- [ ] **Test with multiple concurrent users**
  - Simulate 5-10 users accessing simultaneously
  - Check performance and responsiveness
  - Identify and fix bottlenecks

- [ ] **Backup everything**
  - Export database
  - Backup source code
  - Save all configurations
  - Document current setup

### Hardware Preparation

- [ ] **Laptop maintenance**
  - Clean up disk space (minimum 20GB free)
  - Update Windows and drivers
  - Disable automatic updates during expo
  - Charge battery fully

- [ ] **Network equipment**
  - Portable WiFi router (backup if campus WiFi fails)
  - Ethernet cable (for stable connection)
  - Power extension cord
  - Laptop charger

### Documentation

- [ ] **Prepare presentation materials**
  - PowerPoint slides
  - Architecture diagrams
  - Feature demonstration flow
  - Technical documentation

- [ ] **Print handouts** (optional)
  - QR code for access
  - Feature list
  - Contact information

---

## 1 Day Before Expo

### Final Testing

```powershell
# Run complete verification
cd d:\SMSTR 3\FINSIGHT\FINSIGHT

# 1. Check Docker
docker ps
docker-compose -f deployment\docker\docker-compose.local.yml ps

# 2. Check Nagios
wsl -d Ubuntu sudo service nagios status
wsl -d Ubuntu sudo service apache2 status

# 3. Test access
curl http://localhost
curl http://localhost/nagios
```

### Network Setup

1. **Find your IP address**
   ```powershell
   .\deployment\scripts\get-local-ip.ps1
   ```

2. **Update configurations**
   - Update `deployment/dns/dnsmasq.conf` with IP
   - Update `deployment/docker/.env.local` with IP
   - Restart services

3. **Test DNS resolution**
   ```powershell
   nslookup finsight.local
   ping finsight.local
   ```

### Create Demo Accounts

```sql
-- Login to MySQL
docker exec -it finsight-mysql mysql -u root -p

USE finsight_db;

-- Create demo user
INSERT INTO users (username, email, password, created_at) 
VALUES ('demo', 'demo@finsight.local', 'hashed_password', NOW());

-- Add sample transactions, budgets, etc.
```

---

## Expo Day Morning

### Startup Checklist (30 minutes before)

```powershell
# 1. Start Docker containers
docker-compose -f deployment\docker\docker-compose.local.yml up -d

# 2. Start Nagios
wsl -d Ubuntu sudo service nagios start
wsl -d Ubuntu sudo service apache2 start

# 3. Configure firewall
.\deployment\scripts\configure-firewall.ps1

# 4. Start DNS (if using dnsmasq)
wsl -d Ubuntu sudo service dnsmasq start

# 5. Verify all services
docker ps
curl http://localhost
curl http://localhost/nagios
```

### Quick Verification

- [ ] ✅ FINSIGHT app accessible: `http://finsight.local`
- [ ] ✅ phpMyAdmin accessible: `http://finsight.local:8080`
- [ ] ✅ Nagios accessible: `http://localhost/nagios`
- [ ] ✅ Test from phone/another laptop
- [ ] ✅ Login works with demo account
- [ ] ✅ All features functional

### Setup Display

1. **Open browser tabs:**
   - Tab 1: FINSIGHT Dashboard (logged in)
   - Tab 2: Nagios monitoring dashboard
   - Tab 3: Architecture diagram (optional)

2. **Prepare terminal windows:**
   - PowerShell: For showing Docker commands
   - WSL Ubuntu: For showing Nagios logs

3. **Have backup ready:**
   - Note your IP address on paper
   - Have localhost demo ready if network fails

---

## During Expo

### Demonstration Flow

#### 1. Introduction (2 minutes)
- Explain FINSIGHT purpose
- Show architecture diagram
- Mention tech stack (PHP, MySQL, Docker, Nagios)

#### 2. Feature Demo (5-7 minutes)

**Authentication:**
```
1. Show login page
2. Login with demo account
3. Explain JWT authentication
```

**Dashboard:**
```
1. Show financial health score
2. Explain cash flow chart
3. Point out key metrics
```

**Transactions:**
```
1. Add new transaction
2. Show real-time balance update
3. Filter by category/date
```

**Budgets:**
```
1. Show budget status (Active/Warning/Over)
2. Explain budget tracking
3. Show budget warnings
```

**Insights:**
```
1. Show rule-based insights
2. Explain spending patterns
3. Demonstrate savings opportunities
```

**AI Advisor (if available):**
```
1. Ask financial question
2. Show AI response
3. Explain context awareness
```

#### 3. Technical Demo (3-5 minutes)

**Docker Deployment:**
```powershell
# Show running containers
docker ps

# Show container logs
docker logs finsight-app --tail 20
```

**Nagios Monitoring:**
```
1. Open Nagios dashboard
2. Show service status
3. Explain monitoring checks
4. Demonstrate alert (optional: stop a container)
```

**Network Architecture:**
```
1. Explain local DNS setup
2. Show access from multiple devices
3. Explain Docker networking
```

### Handling Visitors

**For Non-Technical Visitors:**
- Focus on features and UI/UX
- Show practical use cases
- Demonstrate mobile responsiveness

**For Technical Visitors:**
- Show code structure
- Explain architecture decisions
- Demonstrate monitoring and deployment
- Discuss scalability

**For Judges/Evaluators:**
- Highlight unique features
- Explain technical challenges solved
- Show comprehensive documentation
- Demonstrate best practices

### Common Questions & Answers

**Q: Can I access this from my phone?**
A: Yes! Connect to [WiFi name], then go to `http://finsight.local` or `http://[your_ip]`

**Q: Is this deployed to the cloud?**
A: Currently running on local network for demo. Can be deployed to cloud (AWS, DigitalOcean, etc.)

**Q: How do you handle security?**
A: JWT authentication, password hashing, SQL injection prevention, input validation

**Q: What's the monitoring for?**
A: Nagios monitors application health, database performance, and Docker containers in real-time

**Q: Can it handle multiple users?**
A: Yes! Docker containers are scalable. Currently tested with 10+ concurrent users

---

## Troubleshooting During Expo

### Application Not Accessible

**Quick Fix:**
```powershell
# Restart Docker containers
docker-compose -f deployment\docker\docker-compose.local.yml restart

# Check firewall
Get-NetFirewallRule -DisplayName "FINSIGHT*"
```

### DNS Not Working

**Fallback:**
```
Share your IP address instead:
"Please go to http://192.168.1.100"
```

### Nagios Not Showing Data

**Quick Fix:**
```bash
# Restart Nagios
wsl -d Ubuntu sudo service nagios restart
```

### Slow Performance

**Quick Fix:**
```powershell
# Close unnecessary applications
# Restart Docker Desktop
# Use localhost instead of domain name
```

---

## After Expo

### Data Collection

- [ ] Take photos/videos of setup
- [ ] Collect visitor feedback
- [ ] Note questions asked
- [ ] Document issues encountered

### Cleanup

```powershell
# Stop containers (optional)
docker-compose -f deployment\docker\docker-compose.local.yml down

# Stop Nagios
wsl -d Ubuntu sudo service nagios stop
wsl -d Ubuntu sudo service apache2 stop
```

### Follow-up

- [ ] Update documentation based on feedback
- [ ] Fix any bugs discovered
- [ ] Improve features based on suggestions
- [ ] Prepare final report/presentation

---

## Emergency Contacts

**Technical Support:**
- Your Name: [Your Phone]
- Team Member: [Phone]

**Campus IT:**
- IT Help Desk: [Phone]
- Network Admin: [Phone]

---

## Backup Plan

### If WiFi Completely Fails

1. **Use localhost demo**
   - Demo on your laptop screen only
   - Use HDMI to external monitor if available

2. **Use mobile hotspot**
   - Enable phone hotspot
   - Connect laptop to hotspot
   - Update IP address
   - Visitors connect to your hotspot

3. **Use pre-recorded video**
   - Have screen recording ready
   - Show video if live demo impossible

---

## Success Metrics

- [ ] ✅ Application runs smoothly for entire expo duration
- [ ] ✅ At least 10 visitors successfully access the app
- [ ] ✅ All features demonstrated without errors
- [ ] ✅ Monitoring dashboard impresses technical visitors
- [ ] ✅ Positive feedback from judges/evaluators

---

## Good Luck! 🚀

Remember:
- Stay calm and confident
- Explain clearly and enthusiastically
- Be honest about limitations
- Highlight your hard work and learning
- Have fun demonstrating your project!
