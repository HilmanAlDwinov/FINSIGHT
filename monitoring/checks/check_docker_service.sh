#!/bin/bash
# Nagios Plugin: Check Docker Service
# This script checks if Docker daemon is running

STATE_OK=0
STATE_WARNING=1
STATE_CRITICAL=2
STATE_UNKNOWN=3

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "CRITICAL - Docker is not installed"
    exit $STATE_CRITICAL
fi

# Check if Docker daemon is running
if docker info &> /dev/null 2>&1; then
    # Get Docker version and container count
    DOCKER_VERSION=$(docker version --format '{{.Server.Version}}' 2>/dev/null)
    RUNNING_CONTAINERS=$(docker ps -q | wc -l)
    TOTAL_CONTAINERS=$(docker ps -a -q | wc -l)
    
    echo "OK - Docker v$DOCKER_VERSION is running | Containers: $RUNNING_CONTAINERS/$TOTAL_CONTAINERS running"
    exit $STATE_OK
else
    echo "CRITICAL - Docker daemon is not running"
    exit $STATE_CRITICAL
fi
