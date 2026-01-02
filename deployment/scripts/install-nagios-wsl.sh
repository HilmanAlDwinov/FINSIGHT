#!/bin/bash
# Nagios Core Installation Script for WSL2 Ubuntu
# This script installs Nagios Core 4.x with plugins on WSL2
# Run this script with: sudo bash install-nagios-wsl.sh

set -e  # Exit on error

echo "========================================="
echo "  FINSIGHT - Nagios Installation (WSL2)"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "ERROR: Please run as root (use sudo)"
    exit 1
fi

# Variables
NAGIOS_VERSION="4.4.14"
NAGIOS_PLUGINS_VERSION="2.4.6"
NAGIOS_USER="nagios"
NAGIOS_GROUP="nagcmd"

echo "[1/8] Updating system packages..."
apt-get update
apt-get upgrade -y

echo "[2/8] Installing dependencies..."
apt-get install -y \
    autoconf \
    gcc \
    libc6 \
    make \
    wget \
    unzip \
    apache2 \
    php \
    libapache2-mod-php \
    libgd-dev \
    libssl-dev \
    libmcrypt-dev \
    bc \
    gawk \
    dc \
    build-essential \
    snmp \
    libnet-snmp-perl \
    gettext

echo "[3/8] Creating Nagios user and group..."
useradd -m -s /bin/bash $NAGIOS_USER || echo "User already exists"
groupadd $NAGIOS_GROUP || echo "Group already exists"
usermod -a -G $NAGIOS_GROUP $NAGIOS_USER
usermod -a -G $NAGIOS_GROUP www-data

echo "[4/8] Downloading Nagios Core ${NAGIOS_VERSION}..."
cd /tmp
wget https://github.com/NagiosEnterprises/nagioscore/releases/download/nagios-${NAGIOS_VERSION}/nagios-${NAGIOS_VERSION}.tar.gz
tar xzf nagios-${NAGIOS_VERSION}.tar.gz
cd nagios-${NAGIOS_VERSION}

echo "[5/8] Compiling and installing Nagios Core..."
./configure --with-httpd-conf=/etc/apache2/sites-enabled
make all
make install
make install-init
make install-commandmode
make install-config
make install-webconf

echo "[6/8] Setting up Nagios admin user..."
echo "Creating nagiosadmin user (password: nagios123)"
htpasswd -cb /usr/local/nagios/etc/htpasswd.users nagiosadmin nagios123

echo "[7/8] Downloading and installing Nagios Plugins ${NAGIOS_PLUGINS_VERSION}..."
cd /tmp
wget https://github.com/nagios-plugins/nagios-plugins/releases/download/release-${NAGIOS_PLUGINS_VERSION}/nagios-plugins-${NAGIOS_PLUGINS_VERSION}.tar.gz
tar xzf nagios-plugins-${NAGIOS_PLUGINS_VERSION}.tar.gz
cd nagios-plugins-${NAGIOS_PLUGINS_VERSION}

./configure --with-nagios-user=$NAGIOS_USER --with-nagios-group=$NAGIOS_GROUP
make
make install

echo "[8/8] Configuring Apache and Nagios..."
# Enable Apache modules
a2enmod rewrite
a2enmod cgi

# Configure Apache to work in WSL2
echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Set permissions
chown -R $NAGIOS_USER:$NAGIOS_GROUP /usr/local/nagios
chmod -R 755 /usr/local/nagios

echo ""
echo "========================================="
echo "  Nagios Installation Complete!"
echo "========================================="
echo ""
echo "To start Nagios:"
echo "  sudo service nagios start"
echo "  sudo service apache2 start"
echo ""
echo "Access Nagios web interface:"
echo "  URL: http://localhost/nagios"
echo "  Username: nagiosadmin"
echo "  Password: nagios123"
echo ""
echo "Useful commands:"
echo "  Check Nagios status: sudo service nagios status"
echo "  Restart Nagios: sudo service nagios restart"
echo "  Verify config: /usr/local/nagios/bin/nagios -v /usr/local/nagios/etc/nagios.cfg"
echo ""
echo "Next steps:"
echo "  1. Copy monitoring configs to /usr/local/nagios/etc/objects/"
echo "  2. Run configure-monitoring.sh to setup FINSIGHT monitoring"
echo "  3. Restart Nagios to apply changes"
echo ""
