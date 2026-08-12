#!/bin/sh
# Oracle XE Database Restore Script
DUMP_FILE=$1

if [ -z "$DUMP_FILE" ]; then
  echo "Usage: ./restore_oracle.sh <path_to_dumpfile>"
  exit 1
fi

echo "[INFO] Restoring Oracle Database from ${DUMP_FILE}..."
docker exec smarthostel-oracle impdp system/swathi_02@XEPDB1 FULL=Y DIRECTORY=DATA_PUMP_DIR DUMPFILE=${DUMP_FILE} TABLE_EXISTS_ACTION=REPLACE

if [ $? -eq 0 ]; then
  echo "[SUCCESS] Oracle Database restore completed."
else
  echo "[ERROR] Oracle Database restore failed."
  exit 1
fi
