#!/bin/sh
# Oracle XE Database Backup Script
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/oracle"
mkdir -p ${BACKUP_DIR}

echo "[INFO] Starting Oracle XE Database Backup at ${TIMESTAMP}..."
docker exec smarthostel-oracle expdp system/swathi_02@XEPDB1 FULL=Y DIRECTORY=DATA_PUMP_DIR DUMPFILE=oracle_backup_${TIMESTAMP}.dmp LOGFILE=oracle_backup_${TIMESTAMP}.log

if [ $? -eq 0 ]; then
  echo "[SUCCESS] Oracle Database backup completed successfully: ${BACKUP_DIR}/oracle_backup_${TIMESTAMP}.dmp"
else
  echo "[ERROR] Oracle Database backup failed."
  exit 1
fi
