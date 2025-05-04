#!/bin/bash
# EC2 Ubuntu userdata script for Automation-robot
# This script runs on instance first boot

sudo su

# Update package lists
echo "Updating package lists..."
apt-get update -y

# Upgrade installed packages
echo "Upgrading packages..."
apt-get upgrade -y

# Install common packages
echo "Installing common packages..."
apt-get install -y git

# Install Node.js and npm
apt-get install -y nodejs
apt-get install -y npm

# Verify installations
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo "Git version: $(git --version)"

# Create application directory
APP_DIR="/home/ubuntu/automation-robot"
echo "Creating application directory at $APP_DIR"
mkdir -p $APP_DIR
chown ubuntu:ubuntu $APP_DIR

# Clone repository
echo "Cloning Automation-robot repository..."
su - ubuntu -c "git clone https://github.com/adavidarevalo/Automation-robot.git $APP_DIR"

# Install dependencies
echo "Installing npm dependencies..."
cd $APP_DIR
su - ubuntu -c "cd $APP_DIR && npm install"

npx puppeteer browsers install chrome

sudo apt install -y \
  libatk-bridge2.0-0t64 \
  libatk1.0-0t64 \
  libcups2t64 \
  libdbus-1-3 \
  libdrm2 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2t64 \
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

apt-get install -y tmux

tmux new-session -d -s automation "sudo bash -c 'cd $APP_DIR/scripts/webcam && ./index.sh'"
tmux split-window -v -t automation "sudo bash -c 'cd $APP_DIR && npm start'"
tmux select-layout -t automation even-vertical
tmux attach -t automation