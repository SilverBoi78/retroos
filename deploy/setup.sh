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
echo "[1/7] Updating system packages..."
apt-get update -y
apt-get upgrade -y

# ── 2. Install Node.js 22 LTS ──────────────────────────────────────────────
echo "[2/7] Installing Node.js 22 LTS..."
if command -v node &>/dev/null; then
  echo "  Node.js already installed: $(node --version)"
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  echo "  Installed Node.js $(node --version)"
fi

# ── 3. Install Nginx ───────────────────────────────────────────────────────
echo "[3/7] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx

# ── 4. Clone the repo ──────────────────────────────────────────────────────
echo "[4/7] Cloning repository..."
if [ -d "$INSTALL_DIR" ]; then
  echo "  $INSTALL_DIR already exists — pulling latest changes instead."
  cd "$INSTALL_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# ── 5. Install dependencies and build ──────────────────────────────────────
echo "[5/7] Installing npm dependencies..."
npm install

echo "[6/7] Building for production..."
npm run build

# ── 7. Configure Nginx ─────────────────────────────────────────────────────
echo "[7/7] Configuring Nginx..."

SERVER_IP=$(hostname -I | awk '{print $1}')

cat > /etc/nginx/sites-available/retroos <<NGINX
server {
    listen 80;
    server_name $SERVER_IP _;

    root $INSTALL_DIR/dist;
    index index.html;

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
echo "  Install directory: $INSTALL_DIR"
echo ""
echo "  To update later, run:"
echo "    cd $INSTALL_DIR && bash deploy/update.sh"
echo ""
