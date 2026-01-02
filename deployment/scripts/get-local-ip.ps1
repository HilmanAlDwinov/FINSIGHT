# Get Local IP Address Script
# This script helps you find your laptop's IP address on the local network

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FINSIGHT - Local IP Address Finder  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get all network adapters
$adapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual"
}

if ($adapters.Count -eq 0) {
    Write-Host "No active network connections found!" -ForegroundColor Red
    Write-Host "Please connect to WiFi and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found the following network connections:" -ForegroundColor Green
Write-Host ""

$index = 1
foreach ($adapter in $adapters) {
    $interfaceAlias = (Get-NetAdapter -InterfaceIndex $adapter.InterfaceIndex).Name
    Write-Host "[$index] Interface: $interfaceAlias" -ForegroundColor Yellow
    Write-Host "    IP Address: $($adapter.IPAddress)" -ForegroundColor White
    Write-Host "    Subnet Mask: $($adapter.PrefixLength)" -ForegroundColor White
    Write-Host ""
    $index++
}

# Recommend the most likely WiFi adapter
$wifiAdapter = $adapters | Where-Object {
    $interfaceName = (Get-NetAdapter -InterfaceIndex $_.InterfaceIndex).Name
    $interfaceName -like "*Wi-Fi*" -or $interfaceName -like "*Wireless*" -or $interfaceName -like "*WLAN*"
} | Select-Object -First 1

if ($wifiAdapter) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "RECOMMENDED IP ADDRESS FOR EXPO:" -ForegroundColor Green
    Write-Host "$($wifiAdapter.IPAddress)" -ForegroundColor Yellow -NoNewline
    Write-Host " (WiFi Connection)" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update deployment/dns/dnsmasq.conf with this IP" -ForegroundColor White
    Write-Host "2. Update deployment/docker/.env.local with this IP" -ForegroundColor White
    Write-Host "3. Share this IP with expo visitors for access" -ForegroundColor White
    Write-Host ""
    Write-Host "Access URLs:" -ForegroundColor Cyan
    Write-Host "  - FINSIGHT App: http://$($wifiAdapter.IPAddress)" -ForegroundColor White
    Write-Host "  - phpMyAdmin:   http://$($wifiAdapter.IPAddress):8080" -ForegroundColor White
    Write-Host "  - With DNS:     http://finsight.local" -ForegroundColor White
} else {
    Write-Host "Could not automatically detect WiFi adapter." -ForegroundColor Yellow
    Write-Host "Please manually select the IP address from the list above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
