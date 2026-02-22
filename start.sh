#!/bin/bash

# ── MP System startup script ──────────────────────────────────────────────────
# Starts PostgreSQL, sets up the database, applies schema/seed, then runs the
# backend in dev mode (nodemon).  Run once from the project root:
#   bash start.sh
# ─────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Prompt for sudo password upfront so later calls don't block
echo "🔑  Sudo access needed to start PostgreSQL (enter your password once):"
sudo -v

echo ""
echo "🔄  Starting PostgreSQL..."
sudo systemctl start postgresql@18-main

echo "⏳  Waiting for PostgreSQL to be ready..."
for i in $(seq 1 15); do
  if pg_isready -q 2>/dev/null; then break; fi
  sleep 1
done

if ! pg_isready -q 2>/dev/null; then
  echo "❌  PostgreSQL did not start. Check: sudo systemctl status postgresql@18-main"
  exit 1
fi
echo "✅  PostgreSQL is ready."

# 2. Create DB if missing
DB_EXISTS=$(psql -U mostafa -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='mp_system';" 2>/dev/null || echo "")
if [ "$DB_EXISTS" != "1" ]; then
  echo "📦  Creating database 'mp_system'..."
  psql -U mostafa -d postgres -c "CREATE DATABASE mp_system;"
else
  echo "📦  Database 'mp_system' already exists."
fi

# 3. Apply schema (idempotent — uses CREATE TABLE IF NOT EXISTS etc.)
echo "📋  Applying schema..."
psql -U mostafa -d mp_system -f backend/database/schema.sql

# 4. Apply seed data
echo "🌱  Applying seed data..."
psql -U mostafa -d mp_system -f backend/database/seed.sql

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀  Backend starting at http://localhost:5000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd backend && npm run dev
