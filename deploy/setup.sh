#!/usr/bin/env bash
set -euo pipefail

# RetroOS — First-time server setup
# Run as root: sudo bash setup.sh
# Optional: sudo bash setup.sh <repo-url>

INSTALL_DIR="/opt/retroos"
REPO_URL="${1:-}"

# ── Check root ──────────────────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root (sudo bash setup.sh)"
  exit 1
fi

# ── Prompt for repo URL if not provided ─────────────────────────────────────
if [ -z "$REPO_URL" ]; then
  read -rp "Enter the Git repo URL (e.g. https://github.com/user/retroos.git): " REPO_URL
fi

if [ -z "$REPO_URL" ]; then
  echo "Error: Repo URL is required."
  exit 1
fi

echo ""
echo "========================================="
echo "  RetroOS Server Setup"
echo "========================================="
echo ""

# ── 1. Update system packages ──────────────────────────────────────────────
echo "[1/10] Updating system packages..."
apt-get update -y
apt-get upgrade -y

# ── 2. Install Node.js 22 LTS ─────────────────────────────────────────────
echo "[2/10] Installing Node.js 22 LTS..."
if command -v node &>/dev/null; then
  echo "  Node.js already installed: $(node --version)"
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  echo "  Installed Node.js $(node --version)"
fi

# ── 3. Install build tools (needed by better-sqlite3) ────────────────────
echo "[3/10] Installing build tools..."
apt-get install -y build-essential python3

# ── 4. Install Nginx ──────────────────────────────────────────────────────
echo "[4/10] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx

# ── 5. Clone the repo ─────────────────────────────────────────────────────
echo "[5/10] Cloning repository..."
if [ -d "$INSTALL_DIR" ]; then
  echo "  $INSTALL_DIR already exists — pulling latest changes instead."
  cd "$INSTALL_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# ── 6. Install frontend dependencies and build ────────────────────────────
echo "[6/10] Installing npm dependencies..."
npm install

echo "[7/10] Building frontend for production..."
npm run build

# ── 8. Set up Node.js backend ────────────────────────────────────────────
echo "[8/10] Setting up Node.js backend..."
cd "$INSTALL_DIR/backend"
npm install --production
mkdir -p data

# ── 9. Generate secret key if not present ──────────────────────────────────
echo "[9/10] Configuring backend environment..."
SERVER_IP=$(hostname -I | awk '{print $1}')

if [ ! -f "$INSTALL_DIR/backend/.env" ]; then
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
  cat > "$INSTALL_DIR/backend/.env" <<ENVFILE
SECRET_KEY=$SECRET
DATABASE_PATH=$INSTALL_DIR/backend/data/retroos.db
CORS_ORIGINS=["http://$SERVER_IP"]
PORT=8000
ENVFILE
  echo "  Generated new .env with secret key"
else
  echo "  .env already exists, skipping"
fi

# ── 10. Create systemd service and configure Nginx ─────────────────────────
echo "[10/10] Creating systemd service and configuring Nginx..."

cat > /etc/systemd/system/retroos-api.service <<SERVICE
[Unit]
Description=RetroOS Node.js Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR/backend
EnvironmentFile=$INSTALL_DIR/backend/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable retroos-api

# Configure Nginx
cat > /etc/nginx/sites-available/retroos <<NGINX
server {
    listen 80;
    server_name $SERVER_IP _;

    root $INSTALL_DIR/dist;
    index index.html;

    # API reverse proxy to Node.js backend
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

# Enable the site and disable the default
ln -sf /etc/nginx/sites-available/retroos /etc/nginx/sites-enabled/retroos
rm -f /etc/nginx/sites-enabled/default

# Test config and restart
nginx -t
systemctl restart nginx

# Start backend service
BACKEND_FAILED=false
if ! systemctl start retroos-api; then
  BACKEND_FAILED=true
  echo ""
  echo "  WARNING: Backend service failed to start."
  echo "  Nginx is configured and will proxy /api when the backend is running."
  echo "  Debug with: journalctl -u retroos-api -n 50"
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
echo "  Setup complete!"
echo "========================================="
echo ""
echo "  RetroOS is now live at: http://$SERVER_IP"
echo "  Backend API running at: http://127.0.0.1:8000"
echo "  Install directory: $INSTALL_DIR"
echo ""
if [ "$BACKEND_FAILED" = true ]; then
  echo "  WARNING: Backend is NOT running. Fix the issue, then:"
  echo "    systemctl start retroos-api"
  echo "    journalctl -u retroos-api -n 50"
  echo ""
fi
echo "  To update later, run:"
echo "    cd $INSTALL_DIR && bash deploy/update.sh"
echo ""
