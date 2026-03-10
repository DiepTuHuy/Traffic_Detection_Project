import cv2
import os
import time
import pygame
from ultralytics import YOLO

# === KHỞI TẠO HỆ THỐNG ÂM THANH ===
pygame.mixer.init()

# === 1️⃣ Nạp model đã train ===
model = YOLO(r"C:\Users\Admin\Downloads\best.pt")

# === CẤU HÌNH HÌNH ẢNH & ÂM THANH ===
SIGN_DIR = "reference_signs"
AUDIO_DIR = "audio_warnings" # Thư mục chứa file âm thanh
OVERLAY_SIZE = (150, 150)

sign_images = {}
audio_files = {}

# Tải trước đường dẫn ảnh
if os.path.exists(SIGN_DIR):
    for filename in os.listdir(SIGN_DIR):
        name, _ = os.path.splitext(filename)
        img_path = os.path.join(SIGN_DIR, filename)
        img = cv2.imread(img_path)
        if img is not None:
            sign_images[name] = cv2.resize(img, OVERLAY_SIZE)

# Tải trước đường dẫn âm thanh
if os.path.exists(AUDIO_DIR):
    for filename in os.listdir(AUDIO_DIR):
        name, ext = os.path.splitext(filename)
        if ext.lower() in ['.mp3', '.wav']:
            audio_files[name] = os.path.join(AUDIO_DIR, filename)
else:
    print(f"⚠️ Chưa tìm thấy thư mục '{AUDIO_DIR}'.")

# === BIẾN KIỂM SOÁT SPAM ÂM THANH ===
last_played_time = 0
last_played_class = None
COOLDOWN_SECONDS = 5.0  # Chờ 5 giây mới phát lại âm thanh của cùng một loại biển báo

# === 2️⃣ Mở camera ===
cap = cv2.VideoCapture(0)

# === 3️⃣ Chạy vòng lặp realtime ===
while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame, imgsz=640, conf=0.5)
    annotated_frame = results[0].plot()
    
    current_time = time.time() # Lấy thời gian thực tại frame này

    boxes = results[0].boxes
    if len(boxes) > 0:
        best_cls_id = int(boxes.cls[0].item())
        class_name = model.names[best_cls_id]

        # 1. Xử lý hiển thị ảnh
        if class_name in sign_images:
            overlay_img = sign_images[class_name]
            h, w = overlay_img.shape[:2]
            if annotated_frame.shape[0] >= h and annotated_frame.shape[1] >= w:
                annotated_frame[0:h, 0:w] = overlay_img

        # 2. Xử lý phát âm thanh cảnh báo
        if class_name in audio_files:
            # Chỉ phát nếu khác biển báo vừa đọc HOẶC đã qua thời gian chờ (cooldown)
            if (class_name != last_played_class) or (current_time - last_played_time > COOLDOWN_SECONDS):
                pygame.mixer.music.load(audio_files[class_name])
                pygame.mixer.music.play()
                
                # Cập nhật lại thời gian và lưu lại biển báo vừa phát
                last_played_time = current_time
                last_played_class = class_name

    # === Hiển thị kết quả ===
    cv2.imshow("Traffic Sign Detection (YOLO) with Audio", annotated_frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()