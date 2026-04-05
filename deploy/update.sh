#!/usr/bin/env bash
set -euo pipefail

# RetroOS — Pull latest changes, rebuild frontend, update backend
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
echo "[1/5] Pulling latest changes..."
git pull origin main

# ── 2. Install frontend dependencies ───────────────────────────────────────
echo "[2/5] Installing frontend dependencies..."
npm install

# ── 3. Rebuild frontend ───────────────────────────────────────────────────
echo "[3/5] Building frontend for production..."
npm run build

# ── 4. Update backend dependencies ────────────────────────────────────────
echo "[4/5] Updating backend dependencies..."
cd "$INSTALL_DIR/backend"
source venv/bin/activate
pip install -r requirements.txt
deactivate

# ── 5. Restart backend service ─────────────────────────────────────────────
echo "[5/5] Restarting backend service..."
systemctl restart retroos-api

echo ""
echo "========================================="
echo "  Update complete!"
echo "========================================="
echo ""
echo "  Changes are live at: http://$(hostname -I | awk '{print $1}')"
echo ""
