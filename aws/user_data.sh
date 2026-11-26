#!/bin/bash
# user_data.sh — runs once on every EC2 instance the Auto Scaling Group launches.
# Installs Node 20, pulls the Library Management System, installs deps, and
# runs the backend with pm2.
# Fill in the three placeholders before creating the Launch Template.
#   REPO_URL   — https://github.com/mythicfication/library-management-system
#   MONGO_URI  — your MongoDB Atlas connection string, using the ROTATED
#                password (the old Atlas password was leaked in the public
#                repo — rotate it in Atlas Database Access first, then paste
#                the NEW connection string here, never in git).
#   JWT_SECRET — a long random string (generate: openssl rand -hex 32)
#   CLIENT_URL — the exact S3 static website URL of the frontend, no trailing
#                slash (CORS only allows this one origin).
set -e
exec > /var/log/user-data.log 2>&1
echo "=== user_data started $(date) ==="

# --- Node 20 + git ---
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git

# --- App code (backend only on EC2; the frontend is static on S3) ---
mkdir -p /opt/library-system
cd /opt/library-system
if [ ! -d .git ]; then
  git clone https://github.com/mythicfication/library-management-system .
else
  git pull
fi
cd backend
npm install --omit=dev

# --- Environment (no secrets in git — they live only here, on the instance) ---
cat > .env <<'EOF'
PORT=5000
NODE_ENV=production
MONGO_URI=<YOUR_ROTATED_MONGO_URI>
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://library-frontend-anmol.s3-website.ap-south-1.amazonaws.com
EOF
chmod 600 .env

# --- Run with pm2, restart on reboot ---
# NOTE: server.js only starts listening after MongoDB connects, so if the
# MONGO_URI above is wrong the process exits and pm2 will keep retrying.
# Check first on one instance: curl http://localhost:5000/health
npm install -g pm2
pm2 start server.js --name library-backend
pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save

echo "=== user_data done $(date) ==="
echo "Check: curl http://localhost:5000/health  -> {\"status\":\"ok\"}"
