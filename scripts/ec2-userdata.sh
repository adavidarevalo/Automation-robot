#!/bin/bash
# EC2 Ubuntu userdata script for Automation-robot
# This script runs on instance first boot

# Set up logging
LOG_FILE="/var/log/automation-robot.log"
touch $LOG_FILE
chmod 666 $LOG_FILE

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

sudo su
log_message "Starting system update"
apt update
apt upgrade -y
apt install -y git 
git clone https://github.com/adavidarevalo/Automation-robot.git $APP_DIR
cd Automation-robot/

sudo apt install v4l2loopback-dkms v4l2loopback-utils ffmpeg -y

sudo modprobe -r v4l2loopback
sudo modprobe v4l2loopback video_nr=2 card_label="FakeCam" exclusive_caps=1

sudo modprobe v4l2loopback \
  exclusive_caps=1 \
  max_width=1920 max_height=1080 \
  video_nr=2 \
  card_label="FakeCam"  

# Ejecutar ffmpeg en segundo plano para mantener el video en loop
nohup ffmpeg -re -stream_loop -1 -i "./public/video.mp4" \
  -vcodec rawvideo -pix_fmt yuv420p \
  -f v4l2 /dev/video2 > /dev/null 2>&1 &

# Esperar un momento para asegurarse de que ffmpeg inició correctamente
sleep 4
log_message "Webcam virtual con video en loop iniciada en segundo plano"

log_message "Installing Node.js and npm"
sudo apt install -y nodejs npm 
sudo npm i
sudo npx puppeteer browsers install chrome -y
# Retry mechanism for npm run start - up to 3 attempts
MAX_RETRIES=3
RETRY_COUNT=0
SUCCESS=false

log_message "Attempting to start the application (attempt 1 of $MAX_RETRIES)"
while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ $SUCCESS = false ]; do
  sudo npm run start >> $LOG_FILE 2>&1
  if [ $? -eq 0 ]; then
    log_message "Application started successfully"
    SUCCESS=true
  else
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      log_message "Start failed. Retrying (attempt $((RETRY_COUNT+1)) of $MAX_RETRIES)..."
      sleep 5
    else
      log_message "Failed to start application after $MAX_RETRIES attempts"
    fi
  fi
done
