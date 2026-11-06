#!/usr/bin/env bash
# PEC Clearance Engine - One-Command Sync Script
set -e

echo "🔄 Fetching latest updates from GitHub..."
git pull --rebase origin code

echo "✅ Your local workspace is now synchronized with Karan's latest commits!"
