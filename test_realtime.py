import cv2
import os
import time
import pygame
from ultralytics import YOLO

pygame.mixer.init()

model = YOLO(r".\train\Yolo12m\best.pt")

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
else:
    print(f"⚠️ Chưa tìm thấy thư mục '{AUDIO_DIR}'.")

last_played_time = 0
last_played_class = None
COOLDOWN_SECONDS = 5.0

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
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

    cv2.imshow("He Thong Nhan Dien Bien Bao Va Canh Bao Thong Minh", annotated_frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()