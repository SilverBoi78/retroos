#!/usr/bin/env bash
set -euo pipefail

# RetroOS — Pull latest changes and rebuild
# Run from anywhere: bash /opt/retroos/deploy/update.sh

INSTALL_DIR="/opt/retroos"

# ── Check that the install exists ───────────────────────────────────────────
if [ ! -d "$INSTALL_DIR" ]; then
  echo "Error: $INSTALL_DIR not found. Run setup.sh first."
  exit 1
fi

cd "$INSTALL_DIR"

echo ""
echo "========================================="
echo "  RetroOS Update"
echo "========================================="
echo ""

# ── 1. Pull latest code ────────────────────────────────────────────────────
echo "[1/3] Pulling latest changes..."
git pull origin main

# ── 2. Install dependencies (in case they changed) ─────────────────────────
echo "[2/3] Installing dependencies..."
npm install

# ── 3. Rebuild ──────────────────────────────────────────────────────────────
echo "[3/3] Building for production..."
npm run build

echo ""
echo "========================================="
echo "  Update complete!"
echo "========================================="
echo ""
echo "  Changes are live at: http://$(hostname -I | awk '{print $1}')"
echo ""
