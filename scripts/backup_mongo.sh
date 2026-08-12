#!/bin/sh
# MongoDB Document Database Backup Script
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/mongo/${TIMESTAMP}"
mkdir -p ${BACKUP_DIR}

echo "[INFO] Starting MongoDB Backup at ${TIMESTAMP}..."
docker exec smarthostel-mongo mongodump --out /data/db/mongo_backup_${TIMESTAMP}

if [ $? -eq 0 ]; then
  echo "[SUCCESS] MongoDB backup created successfully at ${BACKUP_DIR}"
else
  echo "[ERROR] MongoDB backup failed."
  exit 1
fi
