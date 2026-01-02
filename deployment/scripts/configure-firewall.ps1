# Windows Firewall Configuration for FINSIGHT Local Network Access
# This script configures Windows Firewall to allow incoming connections
# Run this script as Administrator

Write-Host "Configuring Windows Firewall for FINSIGHT..." -ForegroundColor Green

# Allow HTTP (Port 80)
Write-Host "Creating rule for HTTP (Port 80)..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "FINSIGHT - HTTP" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 80 `
    -Action Allow `
    -Profile Private,Domain `
    -Description "Allow HTTP access to FINSIGHT application"

# Allow HTTPS (Port 443)
Write-Host "Creating rule for HTTPS (Port 443)..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "FINSIGHT - HTTPS" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 443 `
    -Action Allow `
    -Profile Private,Domain `
    -Description "Allow HTTPS access to FINSIGHT application"

# Allow MySQL (Port 3306) - for Nagios monitoring
Write-Host "Creating rule for MySQL (Port 3306)..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "FINSIGHT - MySQL" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 3306 `
    -Action Allow `
    -Profile Private,Domain `
    -Description "Allow MySQL access for Nagios monitoring"

# Allow phpMyAdmin (Port 8080)
Write-Host "Creating rule for phpMyAdmin (Port 8080)..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "FINSIGHT - phpMyAdmin" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 8080 `
    -Action Allow `
    -Profile Private,Domain `
    -Description "Allow phpMyAdmin web interface access"

# Allow Nagios Web Interface (Port 80 - already covered above)
# Nagios runs on Apache which uses port 80

Write-Host ""
Write-Host "Firewall rules created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Allowed ports:" -ForegroundColor Cyan
Write-Host "  - Port 80  : HTTP (FINSIGHT Web App)" -ForegroundColor White
Write-Host "  - Port 443 : HTTPS (Secure access)" -ForegroundColor White
Write-Host "  - Port 3306: MySQL (Database monitoring)" -ForegroundColor White
Write-Host "  - Port 8080: phpMyAdmin (Database management)" -ForegroundColor White
Write-Host ""
Write-Host "To verify rules, run: Get-NetFirewallRule -DisplayName 'FINSIGHT*'" -ForegroundColor Yellow
Write-Host ""

# Optional: Display created rules
Write-Host "Created firewall rules:" -ForegroundColor Cyan
Get-NetFirewallRule -DisplayName "FINSIGHT*" | Format-Table DisplayName, Enabled, Direction, Action
