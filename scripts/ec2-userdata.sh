#!/bin/bash
# EC2 Ubuntu userdata script for Automation-robot
# This script runs on instance first boot

echo "=== Starting Zoom Automation Setup ==="

# Ensure running as root
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

echo "=== Step 1: System Updates ==="
echo "Updating package lists..."
apt-get update -y

echo "=== Step 2: Installing Base Packages ==="
echo "Installing essential packages..."
apt-get install -y git
echo "✓ Base packages installed"

echo "=== Step 3: Installing Node.js ==="
echo "Installing Node.js and npm..."
apt-get install -y nodejs npm
echo "✓ Node.js $(node -v) installed"

echo "=== Step 4: Setting up Application ==="
APP_DIR="/home/ubuntu/automation-robot"
echo "Creating application directory at $APP_DIR"
mkdir -p $APP_DIR
chown ubuntu:ubuntu $APP_DIR
echo "✓ Directory created"

echo "=== Step 5: Cloning Repository ==="
echo "Cloning Automation-robot repository..."
su - ubuntu -c "git clone https://github.com/adavidarevalo/Automation-robot.git $APP_DIR"
echo "✓ Repository cloned"

# The video should be in the repository's public folder
echo "Verifying video file exists..."
if [ ! -f "$APP_DIR/public/video.mp4" ]; then
    echo "Error: video.mp4 not found in public directory"
    exit 1
fi

echo "=== Step 6: Installing Dependencies ==="
echo "Installing npm dependencies..."
cd $APP_DIR
su - ubuntu -c "cd $APP_DIR && npm install"
echo "✓ NPM dependencies installed"

echo "=== Step 7: Setting up Chrome ==="
echo "Installing Chrome for Puppeteer..."
su - ubuntu -c "cd $APP_DIR && npx puppeteer browsers install chrome"
echo "✓ Chrome installed"

echo "=== Step 8: Installing Chrome Dependencies ==="
echo "Installing Chrome dependencies..."
apt-get install -y \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libpango-1.0-0 \
  libxss1 \
  libnss3 \
  libx11-xcb1 \
  libxshmfence1 \
  libxinerama1 \
  libjpeg-dev \
  libxtst6 \
  fonts-liberation \
  libappindicator3-1 \
  libu2f-udev \
  libvulkan1 \
  xdg-utils

echo "=== Step 9: Setting up Virtual Webcam ==="
echo "Installing webcam packages..."
apt-get install -y v4l2loopback-dkms v4l2loopback-utils ffmpeg
echo "✓ Webcam packages installed"

# Load v4l2loopback module
modprobe -r v4l2loopback || true
modprobe v4l2loopback video_nr=2 card_label="FakeCam" exclusive_caps=1

echo "=== Step 10: Starting Services ==="
echo "Starting video stream..."
su - ubuntu -c "ffmpeg -re -stream_loop -1 -i '$APP_DIR/public/video.mp4' \
  -vcodec rawvideo -pix_fmt yuv420p \
  -f v4l2 /dev/video2 > /dev/null 2>&1 &"

# Start the application
echo "Starting the application..."
su - ubuntu -c "cd $APP_DIR && npm start &"

echo "=== Setup Complete! ==="
echo "✓ Video stream running"
echo "✓ Application started"
echo "=== You can now access the Zoom Automation! ==="