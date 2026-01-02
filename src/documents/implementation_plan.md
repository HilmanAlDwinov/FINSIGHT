Local DNS and Nagios Monitoring Implementation Plan (Containerized)
Goal Description
This plan outlines the setup for deploying the FINSIGHT application on a local network for an expo/demo presentation using a fully containerized architecture. This approach, inspired by the professional setup in eduflip-main, integrates Web, Database, DNS (BIND9), and Monitoring (Nagios) into a single Docker Compose stack.

User Review Required
IMPORTANT

Refined Deployment Architecture

All services run as Docker containers.
BIND9 handles local DNS resolution (finsight.local).
Nagios Core (via jasonrivers/nagios) handles real-time monitoring on port 8080.
Replaces the need for manual WSL2 installations or host-based dnsmasq.
WARNING

Network Configuration

For DNS resolution to work on the host or other devices, they must either point their DNS settings to the laptop's IP or use manual hosts file entries.
Host port 53 (DNS) and 8080 (Nagios) must be free.
Proposed Changes
Component 1: Docker Orchestration
[MODIFY] 
docker-compose.local.yml
Integration of dns (BIND9) and nagios services.
Unified network: finsight-network.
Component 2: DNS Configuration (BIND9)
[NEW] 
named.conf
BIND9 main configuration setting up the finsight.local zone.
[NEW] 
db.finsight.local
Zone file defining A records for finsight.local, www, db, and nagios.
Component 3: Monitoring Configuration (Nagios)
[NEW] 
finsight.cfg
Host and service definitions for FINSIGHT components within the Docker network.
Monitors finsight-app, finsight-mysql, and the DNS container.
Component 4: Documentation
[MODIFY] 
README.md
Simplified setup instructions for the unified Docker stack.
[MODIFY] 
local-dns-setup.md
Updated to focus on the BIND9 container approach.
[MODIFY] 
nagios-windows-installation.md
Updated to focus on the Nagios container approach.
Verification Plan
Automated Tests
Container Check: docker-compose -f deployment/docker/docker-compose.local.yml ps
DNS Check: nslookup finsight.local 127.0.0.1
Nagios Check: Access http://localhost:8080 and verify service health.
Manual Verification
Scenario Test: Disconnect/stop the database container and verify Nagios triggers an alert.
Device Test: Connect a smartphone to the same WiFi and access http://finsight.local.