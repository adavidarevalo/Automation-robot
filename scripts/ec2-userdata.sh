#!/bin/bash
# EC2 Ubuntu userdata script for Automation-robot
# This script runs on instance first boot

echo "=== Starting Zoom Automation Setup ==="

# Ensure running as root
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

# Disable interactive prompts
export DEBIAN_FRONTEND=noninteractive

# Set timezone to America/Guatemala
echo "Setting timezone..."
ln -fs /usr/share/zoneinfo/America/Guatemala /etc/localtime
dpkg-reconfigure --frontend noninteractive tzdata

echo "=== Step 1: System Updates ==="
echo "Updating package lists..."
apt-get update -y

echo "=== Step 2: Installing Base Packages ==="
echo "Installing essential packages..."
apt-get install -y -q git
echo "✓ Base packages installed"

echo "=== Step 3: Installing Node.js ==="
echo "Installing Node.js and npm..."
apt-get install -y -q nodejs npm
echo "✓ Node.js $(node -v) installed"

echo "=== Step 4: Setting up Application ==="
APP_DIR="/home/ubuntu/automation-robot"
echo "Creating application directory at $APP_DIR"
mkdir -p $APP_DIR
echo "✓ Directory created"

echo "=== Step 5: Cloning Repository ==="
echo "Cloning Automation-robot repository..."
git clone https://github.com/adavidarevalo/Automation-robot.git $APP_DIR
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
cd $APP_DIR && npm install
echo "✓ NPM dependencies installed"

echo "=== Step 7: Setting up Chrome ==="
echo "Installing Chrome for Puppeteer..."
cd $APP_DIR && npx puppeteer browsers install chrome -y


echo "✓ Chrome installed and verified"

echo "=== Step 8: Installing Chrome Dependencies ==="
echo "Installing Chrome dependencies..."

# Install software-properties-common for add-apt-repository
apt-get install -y software-properties-common

# Add required repositories
apt-add-repository universe -y
apt-add-repository multiverse -y

# Update package lists
apt-get update -y

# Install base system dependencies
apt-get install -y -q \
    build-essential \
    pkg-config \
    libglib2.0-0t64 \
    libgtk-3-0t64

apt install -y \
  wget \
  curl \
  unzip \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libu2f-udev \
  libvulkan1 \
  libxcb-dri3-0 \
  ca-certificates

apt install -y \
  libxss1 \
  libappindicator3-1 \
  libgdk-pixbuf2.0-0 \
  libnss3 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libnspr4


wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
npm install puppeteer


echo "✓ Chrome dependencies installed"

echo "=== Step 9: Setting up Virtual Webcam ==="
echo "Installing webcam packages..."
apt-get install -y -q v4l2loopback-dkms v4l2loopback-utils ffmpeg
echo "✓ Webcam packages installed"

# Load v4l2loopback module
modprobe -r v4l2loopback || true
modprobe v4l2loopback video_nr=2 card_label="FakeCam" exclusive_caps=1

echo "=== Step 10: Starting Services ==="
echo "Starting video stream..."
ffmpeg -re -stream_loop -1 -i '$APP_DIR/public/video.mp4' \
  -vcodec rawvideo -pix_fmt yuv420p \
  -f v4l2 /dev/video2 > /dev/null 2>&1 &

# Install Chrome for Puppeteer and start the application
echo "✓ Chrome for Puppeteer installed"

echo "Starting the application..."
cd $APP_DIR && npm start

echo "=== Setup Complete! ==="
echo "✓ Video stream running"
echo "✓ Application started"
echo "=== You can now access the Zoom Automation! ==="