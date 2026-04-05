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
echo "[5/6] Restarting backend service..."
systemctl restart retroos-api

# ── 6. Regenerate Nginx config ────────────────────────────────────────────
echo "[6/6] Updating Nginx configuration..."
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

echo ""
echo "========================================="
echo "  Update complete!"
echo "========================================="
echo ""
echo "  Changes are live at: http://$SERVER_IP"
echo ""
