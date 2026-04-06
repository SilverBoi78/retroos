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
echo "[1/6] Pulling latest changes..."
git pull origin main

# ── 2. Install frontend dependencies ───────────────────────────────────────
echo "[2/6] Installing frontend dependencies..."
npm install

# ── 3. Rebuild frontend ───────────────────────────────────────────────────
echo "[3/6] Building frontend for production..."
npm run build

# ── 4. Update backend dependencies ────────────────────────────────────────
echo "[4/6] Updating backend dependencies..."
cd "$INSTALL_DIR/backend"
source venv/bin/activate
pip install -r requirements.txt
deactivate

# ── 5. Regenerate Nginx config ────────────────────────────────────────────
echo "[5/6] Updating Nginx configuration..."
SERVER_IP=$(hostname -I | awk '{print $1}')

cat > /etc/nginx/sites-available/retroos <<NGINX
server {
    listen 80;
    server_name $SERVER_IP _;

    root $INSTALL_DIR/dist;
    index index.html;

    # API reverse proxy to FastAPI backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # SPA fallback — all routes serve index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 256;
    gzip_vary on;
}
NGINX

ln -sf /etc/nginx/sites-available/retroos /etc/nginx/sites-enabled/retroos
nginx -t && systemctl reload nginx

# ── 6. Restart backend service ─────────────────────────────────────────────
echo "[6/6] Restarting backend service..."
BACKEND_FAILED=false
if ! systemctl restart retroos-api; then
  BACKEND_FAILED=true
  echo ""
  echo "  WARNING: Backend service failed to restart."
  echo "  Nginx config is updated. Debug with: journalctl -u retroos-api -n 50"
  echo ""
else
  echo "  Waiting for backend to become ready..."
  for i in $(seq 1 10); do
    if curl -sf http://127.0.0.1:8000/api/health >/dev/null 2>&1; then
      echo "  Backend is healthy."
      break
    fi
    if [ "$i" -eq 10 ]; then
      echo "  WARNING: Backend started but /api/health not responding."
      echo "  Check: journalctl -u retroos-api -n 50"
    fi
    sleep 1
  done
fi

echo ""
echo "========================================="
echo "  Update complete!"
echo "========================================="
echo ""
echo "  Changes are live at: http://$SERVER_IP"
if [ "$BACKEND_FAILED" = true ]; then
  echo ""
  echo "  WARNING: Backend is NOT running. Fix the issue, then:"
  echo "    systemctl restart retroos-api"
  echo "    journalctl -u retroos-api -n 50"
fi
echo ""
