#!/bin/bash

sudo apt install v4l2loopback-dkms v4l2loopback-utils ffmpeg  

sudo modprobe -r v4l2loopback
sudo modprobe v4l2loopback video_nr=2 card_label="FakeCam" exclusive_caps=1

sudo modprobe v4l2loopback \
  exclusive_caps=1 \
  max_width=1920 max_height=1080 \
  video_nr=2 \
  card_label="FakeCam"  

ffmpeg -re -stream_loop -1 -i video.mp4 \
  -vcodec rawvideo -pix_fmt yuv420p \
  -f v4l2 /dev/video2
