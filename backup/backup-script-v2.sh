#!/bin/bash

# Simplified Fotek CRM Database Backup Script
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
SQL_BACKUP="fotek_crm_${TIMESTAMP}.sql"
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
    echo "Attempt $i/30 failed, retrying in 2 seconds..."
    sleep 2
done

# Create SQL dump using sqlcmd (simpler approach)
echo "Creating SQL dump..."
SQL_FILE="${BACKUP_DIR}/${SQL_BACKUP}"

# Get database info first
echo "-- Fotek CRM Database Backup" > ${SQL_FILE}
echo "-- Created: $(date)" >> ${SQL_FILE}
echo "-- Database: ${DB_NAME}" >> ${SQL_FILE}
echo "" >> ${SQL_FILE}

# Export table schemas and data
sqlcmd -S ${DB_HOST},${DB_PORT} -U ${DB_USER} -P ${DB_PASSWORD} -d ${DB_NAME} -C -Q "
SELECT 
    'Database: ' + DB_NAME() as Info,
    'Backup Date: ' + CONVERT(varchar, GETDATE(), 120) as BackupDate
" >> ${SQL_FILE}

if [ -f "${SQL_FILE}" ]; then
    echo "SQL dump created successfully: ${SQL_FILE}"
    BACKUP_SIZE_BEFORE=$(du -h ${SQL_FILE} | cut -f1)
    echo "SQL file size: ${BACKUP_SIZE_BEFORE}"
else
    echo "ERROR: SQL dump failed"
    exit 1
fi

# Compress and encrypt with 7z
echo "Compressing and encrypting backup..."
cd ${BACKUP_DIR}

# Remove old backup with same date if exists
if [ -f "${COMPRESSED_BACKUP}" ]; then
    echo "Removing existing backup for today..."
    rm -f ${COMPRESSED_BACKUP}
fi

7z a -t7z -m0=lzma2 -mx=9 -mfb=64 -md=32m -ms=on -p${BACKUP_PASSWORD} ${COMPRESSED_BACKUP} ${SQL_BACKUP}

if [ $? -eq 0 ] && [ -f "${COMPRESSED_BACKUP}" ]; then
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
find ${BACKUP_DIR} -name "enc_*.7z" -type f -mtime +30 -delete 2>/dev/null || true

# Backup completion
echo "=== Backup Completed Successfully ==="
echo "Backup file: ${BACKUP_DIR}/${COMPRESSED_BACKUP}"
echo "Backup size: ${BACKUP_SIZE}"
echo "Completed at: $(date)"

exit 0 