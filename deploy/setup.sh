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
echo "[1/11] Updating system packages..."
apt-get update -y
apt-get upgrade -y

# ── 2. Install Node.js 22 LTS ─────────────────────────────────────────────
echo "[2/11] Installing Node.js 22 LTS..."
if command -v node &>/dev/null; then
  echo "  Node.js already installed: $(node --version)"
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  echo "  Installed Node.js $(node --version)"
fi

# ── 3. Install Python 3 ───────────────────────────────────────────────────
echo "[3/11] Installing Python 3..."
apt-get install -y python3 python3-pip python3-venv

# ── 4. Install Nginx ──────────────────────────────────────────────────────
echo "[4/11] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx

# ── 5. Clone the repo ─────────────────────────────────────────────────────
echo "[5/11] Cloning repository..."
if [ -d "$INSTALL_DIR" ]; then
  echo "  $INSTALL_DIR already exists — pulling latest changes instead."
  cd "$INSTALL_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# ── 6. Install frontend dependencies and build ────────────────────────────
echo "[6/11] Installing npm dependencies..."
npm install

echo "[7/11] Building frontend for production..."
npm run build

# ── 8. Set up backend ─────────────────────────────────────────────────────
echo "[8/11] Setting up Python backend..."
cd "$INSTALL_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
mkdir -p data
deactivate

# ── 9. Generate secret key if not present ──────────────────────────────────
echo "[9/11] Configuring backend environment..."
if [ ! -f "$INSTALL_DIR/backend/.env" ]; then
  SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
  cat > "$INSTALL_DIR/backend/.env" <<ENVFILE
SECRET_KEY=$SECRET
DATABASE_URL=sqlite:///$INSTALL_DIR/backend/data/retroos.db
ENVFILE
  echo "  Generated new .env with secret key"
else
  echo "  .env already exists, skipping"
fi

# ── 10. Create systemd service ─────────────────────────────────────────────
echo "[10/11] Creating systemd service..."
cat > /etc/systemd/system/retroos-api.service <<SERVICE
[Unit]
Description=RetroOS FastAPI Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR/backend
Environment="PATH=$INSTALL_DIR/backend/venv/bin:/usr/bin:/bin"
EnvironmentFile=$INSTALL_DIR/backend/.env
ExecStart=$INSTALL_DIR/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable retroos-api
systemctl start retroos-api

# ── 11. Configure Nginx ───────────────────────────────────────────────────
echo "[11/11] Configuring Nginx..."

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

# Enable the site and disable the default
ln -sf /etc/nginx/sites-available/retroos /etc/nginx/sites-enabled/retroos
rm -f /etc/nginx/sites-enabled/default

# Test config and restart
nginx -t
systemctl restart nginx

echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo ""
echo "  RetroOS is now live at: http://$SERVER_IP"
echo "  Backend API running at: http://127.0.0.1:8000"
echo "  Install directory: $INSTALL_DIR"
echo ""
echo "  To update later, run:"
echo "    cd $INSTALL_DIR && bash deploy/update.sh"
echo ""
