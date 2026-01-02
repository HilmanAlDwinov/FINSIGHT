#!/bin/bash
# Nagios Plugin: Check MySQL FINSIGHT Database
# This script checks MySQL database health for FINSIGHT

CHECK_TYPE=$1
STATE_OK=0
STATE_WARNING=1
STATE_CRITICAL=2
STATE_UNKNOWN=3

# MySQL connection details
MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
MYSQL_USER="root"
MYSQL_PASS="root"
MYSQL_DB="finsight_db"

# Check if mysql client is installed
if ! command -v mysql &> /dev/null; then
    echo "UNKNOWN - MySQL client is not installed"
    exit $STATE_UNKNOWN
fi

case "$CHECK_TYPE" in
    "size")
        # Check database size
        DB_SIZE=$(mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e \
            "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size_MB' \
            FROM information_schema.TABLES WHERE table_schema='$MYSQL_DB';" -sN 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            # Warning if DB > 500MB, Critical if > 1GB
            if (( $(echo "$DB_SIZE > 1024" | bc -l) )); then
                echo "CRITICAL - Database size: ${DB_SIZE}MB (exceeds 1GB)"
                exit $STATE_CRITICAL
            elif (( $(echo "$DB_SIZE > 500" | bc -l) )); then
                echo "WARNING - Database size: ${DB_SIZE}MB (approaching limit)"
                exit $STATE_WARNING
            else
                echo "OK - Database size: ${DB_SIZE}MB"
                exit $STATE_OK
            fi
        else
            echo "CRITICAL - Cannot connect to MySQL database"
            exit $STATE_CRITICAL
        fi
        ;;
        
    "performance")
        # Check query performance (simple ping test)
        START_TIME=$(date +%s%N)
        mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "SELECT 1;" &> /dev/null
        EXIT_CODE=$?
        END_TIME=$(date +%s%N)
        
        if [ $EXIT_CODE -eq 0 ]; then
            RESPONSE_TIME=$(( ($END_TIME - $START_TIME) / 1000000 )) # Convert to milliseconds
            
            # Warning if > 500ms, Critical if > 1000ms
            if [ $RESPONSE_TIME -gt 1000 ]; then
                echo "CRITICAL - MySQL response time: ${RESPONSE_TIME}ms (too slow)"
                exit $STATE_CRITICAL
            elif [ $RESPONSE_TIME -gt 500 ]; then
                echo "WARNING - MySQL response time: ${RESPONSE_TIME}ms (slow)"
                exit $STATE_WARNING
            else
                echo "OK - MySQL response time: ${RESPONSE_TIME}ms"
                exit $STATE_OK
            fi
        else
            echo "CRITICAL - Cannot connect to MySQL"
            exit $STATE_CRITICAL
        fi
        ;;
        
    *)
        # Default: Check connection only
        if mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "USE $MYSQL_DB;" &> /dev/null; then
            # Count tables
            TABLE_COUNT=$(mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e \
                "SELECT COUNT(*) FROM information_schema.TABLES WHERE table_schema='$MYSQL_DB';" -sN 2>/dev/null)
            
            echo "OK - MySQL connection successful | Database: $MYSQL_DB, Tables: $TABLE_COUNT"
            exit $STATE_OK
        else
            echo "CRITICAL - Cannot connect to MySQL database '$MYSQL_DB'"
            exit $STATE_CRITICAL
        fi
        ;;
esac
