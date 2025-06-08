#!/bin/bash

# Manual Backup Test Script
# Tests the backup system manually

echo "=== Fotek CRM Manual Backup Test ==="
echo "Starting manual backup test at: $(date)"

# Set environment variables for test
export DB_HOST=db
export DB_PORT=1433
export DB_USER=sa
export DB_PASSWORD=FotekCRM2025!
export DB_NAME=master
export BACKUP_PASSWORD=FotekCRM2025Backup!

# Run backup script
echo "Executing backup script..."
/scripts/backup-script.sh

if [ $? -eq 0 ]; then
    echo "✅ Manual backup test completed successfully!"
    
    # List created backup files
    echo "Created backup files:"
    ls -la /backup/enc_*.7z 2>/dev/null || echo "No backup files found"
    
else
    echo "❌ Manual backup test failed!"
    exit 1
fi

exit 0 