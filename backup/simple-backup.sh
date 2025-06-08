#!/bin/bash

# Simple Demo Backup Script for Fotek CRM
set -e

# Configuration
BACKUP_DIR="/backup"
BACKUP_PASSWORD="FotekCRM2025Backup!"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y%m%d)

# Backup filenames
DEMO_BACKUP="fotek_crm_demo_${TIMESTAMP}.sql"
COMPRESSED_BACKUP="enc_${DATE_ONLY}.7z"

echo "=== Fotek CRM Demo Backup Started ==="
echo "Timestamp: $(date)"

# Create backup directory if not exists
mkdir -p ${BACKUP_DIR}

# Create demo backup file
echo "Creating demo backup file..."
SQL_FILE="${BACKUP_DIR}/${DEMO_BACKUP}"

cat > ${SQL_FILE} << 'EOF'
-- Fotek CRM Database Demo Backup
-- Created: $(date)
-- This is a demo backup file for testing the backup system

-- Database structure demo
CREATE TABLE demo_companies (
    id int PRIMARY KEY,
    name varchar(255),
    created_at datetime
);

CREATE TABLE demo_products (
    id int PRIMARY KEY,
    name varchar(255),
    price decimal(10,2),
    created_at datetime
);

-- Sample data
INSERT INTO demo_companies VALUES (1, 'Demo Company A', '2025-06-08 18:00:00');
INSERT INTO demo_companies VALUES (2, 'Demo Company B', '2025-06-08 18:01:00');

INSERT INTO demo_products VALUES (1, 'Demo Product 1', 100.50, '2025-06-08 18:00:00');
INSERT INTO demo_products VALUES (2, 'Demo Product 2', 200.75, '2025-06-08 18:01:00');

-- Backup completion
SELECT 'Fotek CRM Demo Backup Completed' as message;
EOF

# Replace $(date) with actual date
sed -i "s/\$(date)/$(date)/g" ${SQL_FILE}

if [ -f "${SQL_FILE}" ]; then
    echo "Demo backup file created successfully: ${SQL_FILE}"
    BACKUP_SIZE_BEFORE=$(du -h ${SQL_FILE} | cut -f1)
    echo "SQL file size: ${BACKUP_SIZE_BEFORE}"
else
    echo "ERROR: Demo backup creation failed"
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

7z a -t7z -m0=lzma2 -mx=9 -mfb=64 -md=32m -ms=on -p${BACKUP_PASSWORD} ${COMPRESSED_BACKUP} ${DEMO_BACKUP}

if [ $? -eq 0 ] && [ -f "${COMPRESSED_BACKUP}" ]; then
    echo "Backup compressed and encrypted successfully: ${COMPRESSED_BACKUP}"
    
    # Remove unencrypted backup file
    rm -f ${DEMO_BACKUP}
    echo "Unencrypted backup file removed"
    
    # Get file size
    BACKUP_SIZE=$(du -h ${COMPRESSED_BACKUP} | cut -f1)
    echo "Final backup size: ${BACKUP_SIZE}"
    
    # Verify backup
    echo "Verifying backup..."
    7z l ${COMPRESSED_BACKUP} -p${BACKUP_PASSWORD} > /dev/null
    if [ $? -eq 0 ]; then
        echo "Backup verification successful"
    else
        echo "WARNING: Backup verification failed"
    fi
    
else
    echo "ERROR: Backup compression/encryption failed"
    exit 1
fi

# Cleanup old backups (keep last 30 days)
echo "Cleaning up old backups..."
find ${BACKUP_DIR} -name "enc_*.7z" -type f -mtime +30 -delete 2>/dev/null || true

# Backup completion
echo "=== Demo Backup Completed Successfully ==="
echo "Backup file: ${BACKUP_DIR}/${COMPRESSED_BACKUP}"
echo "Backup size: ${BACKUP_SIZE}"
echo "Password: ${BACKUP_PASSWORD}"
echo "Completed at: $(date)"

exit 0 