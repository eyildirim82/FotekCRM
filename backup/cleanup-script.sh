#!/bin/bash

# Fotek CRM Backup Cleanup Script
# Removes old backup files to manage disk space

set -e

BACKUP_DIR="/backup"
RETENTION_DAYS=${RETENTION_DAYS:-30}

echo "=== Fotek CRM Backup Cleanup Started ==="
echo "Timestamp: $(date)"
echo "Backup directory: ${BACKUP_DIR}"
echo "Retention period: ${RETENTION_DAYS} days"

# Check if backup directory exists
if [ ! -d "${BACKUP_DIR}" ]; then
    echo "ERROR: Backup directory does not exist: ${BACKUP_DIR}"
    exit 1
fi

# Count total backup files before cleanup
TOTAL_BEFORE=$(find ${BACKUP_DIR} -name "enc_*.7z" -type f | wc -l)
echo "Total backup files before cleanup: ${TOTAL_BEFORE}"

# Calculate total size before cleanup
TOTAL_SIZE_BEFORE=$(du -sh ${BACKUP_DIR} 2>/dev/null | cut -f1 || echo "Unknown")
echo "Total backup size before cleanup: ${TOTAL_SIZE_BEFORE}"

# Find and list files to be deleted
echo "Finding backup files older than ${RETENTION_DAYS} days..."
OLD_FILES=$(find ${BACKUP_DIR} -name "enc_*.7z" -type f -mtime +${RETENTION_DAYS} 2>/dev/null)

if [ -z "$OLD_FILES" ]; then
    echo "No old backup files found for cleanup"
else
    echo "Files to be deleted:"
    find ${BACKUP_DIR} -name "enc_*.7z" -type f -mtime +${RETENTION_DAYS} -ls
    
    # Delete old backup files
    echo "Deleting old backup files..."
    find ${BACKUP_DIR} -name "enc_*.7z" -type f -mtime +${RETENTION_DAYS} -delete
    
    if [ $? -eq 0 ]; then
        echo "Old backup files deleted successfully"
    else
        echo "ERROR: Failed to delete some backup files"
        exit 1
    fi
fi

# Count total backup files after cleanup
TOTAL_AFTER=$(find ${BACKUP_DIR} -name "enc_*.7z" -type f | wc -l)
echo "Total backup files after cleanup: ${TOTAL_AFTER}"

# Calculate total size after cleanup
TOTAL_SIZE_AFTER=$(du -sh ${BACKUP_DIR} 2>/dev/null | cut -f1 || echo "Unknown")
echo "Total backup size after cleanup: ${TOTAL_SIZE_AFTER}"

# Calculate files removed
FILES_REMOVED=$((TOTAL_BEFORE - TOTAL_AFTER))
echo "Files removed: ${FILES_REMOVED}"

# List remaining backup files
echo "Remaining backup files:"
find ${BACKUP_DIR} -name "enc_*.7z" -type f -exec ls -lh {} \; 2>/dev/null | head -10

if [ $(find ${BACKUP_DIR} -name "enc_*.7z" -type f | wc -l) -gt 10 ]; then
    echo "... and $(($(find ${BACKUP_DIR} -name "enc_*.7z" -type f | wc -l) - 10)) more files"
fi

# Clean up any orphaned temporary files
echo "Cleaning up temporary files..."
find ${BACKUP_DIR} -name "temp_*" -type f -mtime +1 -delete 2>/dev/null || true
find ${BACKUP_DIR} -name "*.tmp" -type f -mtime +1 -delete 2>/dev/null || true

echo "=== Backup Cleanup Completed ==="
echo "Completed at: $(date)"

exit 0 