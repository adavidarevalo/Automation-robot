#!/bin/bash
# EC2 Ubuntu userdata script for Automation-robot
# This script runs on instance first boot
sudo su
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
  -f v4l2 /dev/video2 > /dev/null

# Esperar un momento para asegurarse de que ffmpeg inició correctamente
sleep 4
echo "Webcam virtual con video en loop iniciada en segundo plano"

sudo apt install -y nodejs npm 
sudo npm i
sudo npx puppeteer browsers install chrome -y
# Retry mechanism for npm run start - up to 3 attempts
MAX_RETRIES=3
RETRY_COUNT=0
SUCCESS=false

echo "Attempting to start the application (attempt 1 of $MAX_RETRIES)"
while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ $SUCCESS = false ]; do
  sudo npm run start
  if [ $? -eq 0 ]; then
    echo "Application started successfully"
    SUCCESS=true
  else
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "Start failed. Retrying (attempt $((RETRY_COUNT+1)) of $MAX_RETRIES)..."
      sleep 5
    else
      echo "Failed to start application after $MAX_RETRIES attempts"
    fi
  fi
done
