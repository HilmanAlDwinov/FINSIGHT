#!/bin/bash
# Nagios Plugin: Check Docker Containers
# This script checks if Docker containers are running

CONTAINER_NAME=$1
STATE_OK=0
STATE_WARNING=1
STATE_CRITICAL=2
STATE_UNKNOWN=3

# Check if container name is provided
if [ -z "$CONTAINER_NAME" ]; then
    # Check if Docker service is running
    if command -v docker &> /dev/null; then
        if docker info &> /dev/null; then
            echo "OK - Docker service is running"
            exit $STATE_OK
        else
            echo "CRITICAL - Docker service is not responding"
            exit $STATE_CRITICAL
        fi
    else
        echo "UNKNOWN - Docker is not installed"
        exit $STATE_UNKNOWN
    fi
fi

# Check specific container
if command -v docker &> /dev/null; then
    # Check if container exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        # Check if container is running
        CONTAINER_STATUS=$(docker inspect -f '{{.State.Status}}' $CONTAINER_NAME 2>/dev/null)
        
        if [ "$CONTAINER_STATUS" == "running" ]; then
            # Get container uptime
            UPTIME=$(docker inspect -f '{{.State.StartedAt}}' $CONTAINER_NAME)
            echo "OK - Container '$CONTAINER_NAME' is running (Started: $UPTIME)"
            exit $STATE_OK
        elif [ "$CONTAINER_STATUS" == "exited" ]; then
            EXIT_CODE=$(docker inspect -f '{{.State.ExitCode}}' $CONTAINER_NAME)
            echo "CRITICAL - Container '$CONTAINER_NAME' is stopped (Exit code: $EXIT_CODE)"
            exit $STATE_CRITICAL
        elif [ "$CONTAINER_STATUS" == "restarting" ]; then
            echo "WARNING - Container '$CONTAINER_NAME' is restarting"
            exit $STATE_WARNING
        else
            echo "WARNING - Container '$CONTAINER_NAME' status: $CONTAINER_STATUS"
            exit $STATE_WARNING
        fi
    else
        echo "CRITICAL - Container '$CONTAINER_NAME' does not exist"
        exit $STATE_CRITICAL
    fi
else
    echo "UNKNOWN - Docker is not installed or not in PATH"
    exit $STATE_UNKNOWN
fi
