#!/bin/bash

# Fotek CRM Database Backup Script
# Creates encrypted 7z backup of MSSQL database

set -e

# Configuration
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-1433}
DB_USER=${DB_USER:-sa}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME:-master}
BACKUP_DIR="/backup"
BACKUP_PASSWORD=${BACKUP_PASSWORD:-FotekCRM2025Backup!}

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y%m%d)

# Backup filenames
SQL_BACKUP="fotek_crm_${TIMESTAMP}.bak"
COMPRESSED_BACKUP="enc_${DATE_ONLY}.7z"

echo "=== Fotek CRM Database Backup Started ==="
echo "Timestamp: $(date)"
echo "Target: ${DB_HOST}:${DB_PORT}"
echo "Database: ${DB_NAME}"

# Create backup directory if not exists
mkdir -p ${BACKUP_DIR}

# Wait for database to be ready
echo "Waiting for database connection..."
for i in {1..30}; do
    if sqlcmd -S ${DB_HOST},${DB_PORT} -U ${DB_USER} -P ${DB_PASSWORD} -Q "SELECT 1" -C > /dev/null 2>&1; then
        echo "Database connection successful"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "ERROR: Could not connect to database after 30 attempts"
        exit 1
    fi
    echo "Attempt $i/30 failed, retrying in 5 seconds..."
    sleep 5
done

# Create SQL Server backup
echo "Creating SQL Server backup..."
BACKUP_PATH="/var/opt/mssql/data/${SQL_BACKUP}"

# SQL backup command
sqlcmd -S ${DB_HOST},${DB_PORT} -U ${DB_USER} -P ${DB_PASSWORD} -C -Q "
BACKUP DATABASE [${DB_NAME}] 
TO DISK = '${BACKUP_PATH}' 
WITH FORMAT, 
     INIT, 
     NAME = 'Fotek CRM Full Backup', 
     DESCRIPTION = 'Full backup of Fotek CRM database created on $(date)', 
     COMPRESSION;
"

if [ $? -eq 0 ]; then
    echo "SQL Server backup created successfully: ${BACKUP_PATH}"
else
    echo "ERROR: SQL Server backup failed"
    exit 1
fi

# Create backup directly to backup volume
echo "Creating backup to backup volume..."
BACKUP_PATH="/backup/${SQL_BACKUP}"

# SQL backup command - note: this runs on DB container, backup path must be accessible
sqlcmd -S ${DB_HOST},${DB_PORT} -U ${DB_USER} -P ${DB_PASSWORD} -C -Q "
BACKUP DATABASE [${DB_NAME}] 
TO DISK = '${BACKUP_PATH}' 
WITH FORMAT, 
     INIT, 
     NAME = 'Fotek CRM Full Backup', 
     DESCRIPTION = 'Full backup of Fotek CRM database created on $(date)', 
     COMPRESSION;
"

if [ $? -eq 0 ]; then
    echo "SQL Server backup created successfully: ${BACKUP_PATH}"
else
    echo "ERROR: SQL Server backup failed"
    exit 1
fi

# Compress and encrypt with 7z
echo "Compressing and encrypting backup..."
cd ${BACKUP_DIR}

7z a -t7z -m0=lzma2 -mx=9 -mfb=64 -md=32m -ms=on -p${BACKUP_PASSWORD} ${COMPRESSED_BACKUP} ${SQL_BACKUP}

if [ $? -eq 0 ]; then
    echo "Backup compressed and encrypted successfully: ${COMPRESSED_BACKUP}"
    
    # Remove unencrypted backup file
    rm -f ${SQL_BACKUP}
    echo "Unencrypted backup file removed"
    
    # Get file size
    BACKUP_SIZE=$(du -h ${COMPRESSED_BACKUP} | cut -f1)
    echo "Final backup size: ${BACKUP_SIZE}"
    
else
    echo "ERROR: Backup compression/encryption failed"
    exit 1
fi

# Cleanup old backups (keep last 30 days)
echo "Cleaning up old backups..."
find ${BACKUP_DIR} -name "enc_*.7z" -type f -mtime +30 -delete

# Backup completion
echo "=== Backup Completed Successfully ==="
echo "Backup file: ${BACKUP_DIR}/${COMPRESSED_BACKUP}"
echo "Backup size: ${BACKUP_SIZE}"
echo "Completed at: $(date)"

# Note: Backup file will be cleaned up by SQL Server backup retention policy

exit 0 