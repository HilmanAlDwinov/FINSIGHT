#!/bin/bash

# Add zone configurations to named.conf.local
cat >> /etc/bind/named.conf.local << 'EOF'
zone "finsight.local" {
    type master;
    file "/var/lib/bind/db.finsight.local";
};

zone "0.168.192.in-addr.arpa" {
    type master;
    file "/var/lib/bind/db.192.168.0";
};
EOF

# Create the finsight.local zone file
cat > /var/lib/bind/db.finsight.local << 'EOF'
$TTL    600
@       IN      SOA     ns1.finsight.local. admin.finsight.local. (
                              2025010101         ; Serial
                              604800             ; Refresh
                              86400              ; Retry
                              2419200            ; Expire
                              600 )              ; Negative Cache TTL

@       IN      NS      ns1.finsight.local.

@       IN      A       172.20.0.10
www     IN      A       172.20.0.10
api     IN      A       172.20.0.10
app     IN      A       172.20.0.10
db      IN      A       172.20.0.11
nagios  IN      A       172.20.0.12
phpmyadmin IN   A       172.20.0.11
EOF

# Create the reverse lookup zone file
cat > /var/lib/bind/db.192.168.0 << 'EOF'
$TTL    600
@       IN      SOA     ns1.finsight.local. admin.finsight.local. (
                              2025010101         ; Serial
                              604800             ; Refresh
                              86400              ; Retry
                              2419200            ; Expire
                              600 )              ; Negative Cache TTL

@       IN      NS      ns1.finsight.local.
14.1    IN      PTR     finsight.local.
100.1   IN      PTR     laptop.finsight.local.
EOF

# Start the BIND service
exec /sbin/entrypoint.sh