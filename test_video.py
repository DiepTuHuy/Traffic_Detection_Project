import cv2
import os
import time
import pygame
from ultralytics import YOLO

pygame.mixer.init()

model = YOLO(r".\train\Yolo12m\best.pt")

VIDEO_PATH = "video_test_day.mp4"       
OUTPUT_PATH = "video_ket_qua_day.mp4"   
SIGN_DIR = "reference"
AUDIO_DIR = "audio"
OVERLAY_SIZE = (150, 150)

sign_images = {}
audio_files = {}

if os.path.exists(SIGN_DIR):
    for filename in os.listdir(SIGN_DIR):
        name, _ = os.path.splitext(filename)
        img_path = os.path.join(SIGN_DIR, filename)
        img = cv2.imread(img_path)
        if img is not None:
            sign_images[name] = cv2.resize(img, OVERLAY_SIZE)

if os.path.exists(AUDIO_DIR):
    for filename in os.listdir(AUDIO_DIR):
        name, ext = os.path.splitext(filename)
        if ext.lower() in ['.mp3', '.wav']:
            audio_files[name] = os.path.join(AUDIO_DIR, filename)

last_played_time = 0
last_played_class = None
COOLDOWN_SECONDS = 3.0  

cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    print(f"❌ Không mở được video tại: {VIDEO_PATH}")
    exit()

frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps_video = int(cap.get(cv2.CAP_PROP_FPS))

fourcc = cv2.VideoWriter_fourcc(*'mp4v') 
out = cv2.VideoWriter(OUTPUT_PATH, fourcc, fps_video, (frame_width, frame_height))

print(f"⏳ Đang xử lý và xuất video ra file: {OUTPUT_PATH}...")

prev_time = 0

while True:
    ret, frame = cap.read()
    
    if not ret:
        print("✅ Đã xử lý xong toàn bộ video!")
        break

    results = model(frame, imgsz=640, conf=0.5)
    annotated_frame = results[0].plot()
    
    current_time = time.time()

    boxes = results[0].boxes
    if len(boxes) > 0:
        best_cls_id = int(boxes.cls[0].item())
        class_name = model.names[best_cls_id]

        if class_name in sign_images:
            overlay_img = sign_images[class_name]
            h, w = overlay_img.shape[:2]
            if annotated_frame.shape[0] >= h and annotated_frame.shape[1] >= w:
                annotated_frame[0:h, 0:w] = overlay_img

        if class_name in audio_files:
            if (class_name != last_played_class) or (current_time - last_played_time > COOLDOWN_SECONDS):
                pygame.mixer.music.load(audio_files[class_name])
                pygame.mixer.music.play()
                last_played_time = current_time
                last_played_class = class_name

    fps_display = 0
    if (current_time - prev_time) > 0:
        fps_display = 1.0 / (current_time - prev_time)
    prev_time = current_time

    x_fps = frame_width - 160
    y_fps = 40
    cv2.putText(annotated_frame, f"FPS: {int(fps_display)}", (x_fps, y_fps), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

    out.write(annotated_frame)

    cv2.imshow("Processing Video...", annotated_frame)

    if cv2.waitKey(1) & 0xFF == 27:
        print("⚠️ Đã dừng xử lý giữa chừng!")
        break

cap.release()
out.release() 
cv2.destroyAllWindows()
print(f"🎉 Hoàn tất! Hãy kiểm tra file {OUTPUT_PATH}")