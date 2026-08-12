#!/bin/sh
# Complete System Database Backup Orchestration Script
echo "=========================================================="
echo " Starting Full Smart Hostel System Backup"
echo "=========================================================="

sh ./scripts/backup_oracle.sh
sh ./scripts/backup_mongo.sh

echo "=========================================================="
echo " Full System Backup Complete."
echo "=========================================================="
