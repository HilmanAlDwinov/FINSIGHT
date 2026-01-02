#!/bin/bash
# Nagios Monitoring Configuration Script for FINSIGHT
# This script copies monitoring configs and restarts Nagios
# Run after install-nagios-wsl.sh

set -e

echo "========================================="
echo "  FINSIGHT - Nagios Configuration"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "ERROR: Please run as root (use sudo)"
    exit 1
fi

NAGIOS_ETC="/usr/local/nagios/etc"
NAGIOS_OBJECTS="$NAGIOS_ETC/objects"
MONITORING_DIR="/mnt/d/SMSTR 3/FINSIGHT/FINSIGHT/monitoring"

echo "[1/5] Backing up original Nagios configuration..."
cp "$NAGIOS_ETC/nagios.cfg" "$NAGIOS_ETC/nagios.cfg.backup"
echo "Backup created: $NAGIOS_ETC/nagios.cfg.backup"

echo "[2/5] Copying FINSIGHT monitoring configurations..."
# Copy host configurations
if [ -d "$MONITORING_DIR/nagios-configs/hosts" ]; then
    cp "$MONITORING_DIR/nagios-configs/hosts/"*.cfg "$NAGIOS_OBJECTS/"
    echo "  - Host configs copied"
fi

# Copy service configurations
if [ -d "$MONITORING_DIR/nagios-configs/services" ]; then
    cp "$MONITORING_DIR/nagios-configs/services/"*.cfg "$NAGIOS_OBJECTS/"
    echo "  - Service configs copied"
fi

# Copy contact configurations
if [ -d "$MONITORING_DIR/nagios-configs/contacts" ]; then
    cp "$MONITORING_DIR/nagios-configs/contacts/"*.cfg "$NAGIOS_OBJECTS/"
    echo "  - Contact configs copied"
fi

echo "[3/5] Copying custom check scripts..."
if [ -d "$MONITORING_DIR/checks" ]; then
    cp "$MONITORING_DIR/checks/"*.sh /usr/local/nagios/libexec/
    chmod +x /usr/local/nagios/libexec/check_*.sh
    echo "  - Custom checks installed"
fi

echo "[4/5] Updating nagios.cfg to include FINSIGHT configs..."
# Add FINSIGHT config files to nagios.cfg if not already present
if ! grep -q "finsight-local.cfg" $NAGIOS_ETC/nagios.cfg; then
    echo "" >> $NAGIOS_ETC/nagios.cfg
    echo "# FINSIGHT Monitoring Configurations" >> $NAGIOS_ETC/nagios.cfg
    echo "cfg_file=$NAGIOS_OBJECTS/finsight-local.cfg" >> $NAGIOS_ETC/nagios.cfg
    echo "cfg_file=$NAGIOS_OBJECTS/docker-services.cfg" >> $NAGIOS_ETC/nagios.cfg
    echo "cfg_file=$NAGIOS_OBJECTS/mysql-services.cfg" >> $NAGIOS_ETC/nagios.cfg
    echo "cfg_file=$NAGIOS_OBJECTS/web-services.cfg" >> $NAGIOS_ETC/nagios.cfg
    echo "cfg_file=$NAGIOS_OBJECTS/contacts.cfg" >> $NAGIOS_ETC/nagios.cfg
    echo "  - Configuration files registered"
fi

echo "[5/5] Verifying Nagios configuration..."
/usr/local/nagios/bin/nagios -v $NAGIOS_ETC/nagios.cfg

if [ $? -eq 0 ]; then
    echo ""
    echo "Configuration verification successful!"
    echo ""
    echo "Restarting Nagios..."
    service nagios restart
    service apache2 restart
    echo ""
    echo "========================================="
    echo "  Nagios Configuration Complete!"
    echo "========================================="
    echo ""
    echo "Access Nagios at: http://localhost/nagios"
    echo "Check FINSIGHT monitoring status in the web interface"
    echo ""
else
    echo ""
    echo "ERROR: Configuration verification failed!"
    echo "Please check the error messages above and fix the configuration."
    echo "Configuration NOT applied."
    exit 1
fi
