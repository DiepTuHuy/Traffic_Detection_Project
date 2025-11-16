import cv2
from ultralytics import YOLO

# === 1️⃣ Nạp model đã train ===
model = YOLO(r"runs/detect/train-60%/weights/best.pt")  # đổi đường dẫn nếu cần

# === 2️⃣ Mở camera ===
cap = cv2.VideoCapture(0)  # 0 là webcam mặc định, có thể đổi sang đường dẫn video

if not cap.isOpened():
    print("❌ Không mở được camera.")
    exit()

# === 3️⃣ Chạy vòng lặp realtime ===
while True:
    ret, frame = cap.read()
    if not ret:
        break

    # === 4️⃣ Dự đoán bằng model YOLO ===
    results = model(frame, imgsz=640, conf=0.5)  # conf=0.5 là ngưỡng tin cậy

    # === 5️⃣ Vẽ bounding box lên ảnh ===
    annotated_frame = results[0].plot()  # YOLO tự vẽ box và label

    # === 6️⃣ Hiển thị kết quả ===
    cv2.imshow("Traffic Sign Detection (YOLO)", annotated_frame)

    # Nhấn 'q' để thoát
    if cv2.waitKey(1) & 0xFF == 27:
        break

# === 7️⃣ Dọn dẹp ===
cap.release()
cv2.destroyAllWindows()
