#!/bin/sh
# MongoDB Document Database Restore Script
BACKUP_FOLDER=$1

if [ -z "$BACKUP_FOLDER" ]; then
  echo "Usage: ./restore_mongo.sh <path_to_backup_folder>"
  exit 1
fi

echo "[INFO] Restoring MongoDB Database from ${BACKUP_FOLDER}..."
docker exec smarthostel-mongo mongorestore /data/db/${BACKUP_FOLDER}

if [ $? -eq 0 ]; then
  echo "[SUCCESS] MongoDB restore completed."
else
  echo "[ERROR] MongoDB restore failed."
  exit 1
fi
