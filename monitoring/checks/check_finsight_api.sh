#!/bin/bash
# Nagios Plugin: Check FINSIGHT API
# This script checks FINSIGHT API health and performance

CHECK_TYPE=$1
STATE_OK=0
STATE_WARNING=1
STATE_CRITICAL=2
STATE_UNKNOWN=3

# API endpoint
API_HOST="127.0.0.1"
API_PORT="80"
API_HEALTH_ENDPOINT="/backend/health.php"

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo "UNKNOWN - curl is not installed"
    exit $STATE_UNKNOWN
fi

case "$CHECK_TYPE" in
    "health")
        # Check API health endpoint
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$API_HOST:$API_PORT$API_HEALTH_ENDPOINT 2>/dev/null)
        
        if [ "$HTTP_CODE" == "200" ]; then
            echo "OK - API health check passed (HTTP $HTTP_CODE)"
            exit $STATE_OK
        elif [ "$HTTP_CODE" == "000" ]; then
            echo "CRITICAL - Cannot connect to API"
            exit $STATE_CRITICAL
        else
            echo "WARNING - API returned HTTP $HTTP_CODE"
            exit $STATE_WARNING
        fi
        ;;
        
    "performance")
        # Check API response time
        START_TIME=$(date +%s%N)
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$API_HOST:$API_PORT$API_HEALTH_ENDPOINT 2>/dev/null)
        END_TIME=$(date +%s%N)
        
        if [ "$HTTP_CODE" == "200" ]; then
            RESPONSE_TIME=$(( ($END_TIME - $START_TIME) / 1000000 )) # Convert to milliseconds
            
            # Warning if > 1000ms, Critical if > 2000ms
            if [ $RESPONSE_TIME -gt 2000 ]; then
                echo "CRITICAL - API response time: ${RESPONSE_TIME}ms (too slow)"
                exit $STATE_CRITICAL
            elif [ $RESPONSE_TIME -gt 1000 ]; then
                echo "WARNING - API response time: ${RESPONSE_TIME}ms (slow)"
                exit $STATE_WARNING
            else
                echo "OK - API response time: ${RESPONSE_TIME}ms"
                exit $STATE_OK
            fi
        else
            echo "CRITICAL - API health check failed (HTTP $HTTP_CODE)"
            exit $STATE_CRITICAL
        fi
        ;;
        
    *)
        # Default: Basic connectivity check
        if curl -s -f http://$API_HOST:$API_PORT/backend/ &> /dev/null; then
            echo "OK - API is accessible"
            exit $STATE_OK
        else
            echo "CRITICAL - Cannot access API"
            exit $STATE_CRITICAL
        fi
        ;;
esac
