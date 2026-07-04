import base64
import io
import cv2
import numpy as np
import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO

# Cấu hình log
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
# Cho phép yêu cầu từ Frontend (CORS)
CORS(app, resources={r"/*": {"origins": "*"}})

# ============================================================
# CẤU HÌNH MODEL - Chọn model phù hợp với phần cứng của bạn
# ============================================================
# Yolo11n (nano, 5.5MB)  → Nhanh nhất, phù hợp CPU        → ~0.5-2 giây/frame
# Yolo8n  (nano, 6MB)    → Nhanh, phù hợp CPU              → ~0.5-2 giây/frame  
# Yolo12m (medium, 40MB) → Chính xác nhất, CẦN GPU (CUDA)  → ~8-13 giây/frame trên CPU!
# ============================================================

# Ưu tiên model nhẹ cho CPU, đổi sang model nặng nếu có GPU
MODEL_PATHS = [
    r"train\Yolo11n\best.pt",   # Ưu tiên 1: Trở lại model nhẹ để chạy siêu nhanh
    r"train\Yolo8n\best.pt",    
    r"train\Yolo12m\best.pt",   
]

model = None
active_model_path = ""

for path in MODEL_PATHS:
    if os.path.exists(path):
        print(f"Loading YOLO model from {path}...")
        try:
            model = YOLO(path)
            active_model_path = path
            print(f"YOLO model loaded successfully from: {path}")
            break
        except Exception as e:
            print(f"Failed to load {path}: {e}")

if model is None:
    print("CRITICAL: No YOLO model found! Please check train/ directory.")

# Cấu hình inference 
CONFIDENCE_THRESHOLD = 0.25  # Hạ thấp nhất để tăng độ nhạy tối đa
IMAGE_SIZE = 640             # Tăng kích thước ảnh để nhận diện biển báo từ xa tốt hơn

@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Kiểm tra trạng thái ping từ Frontend (để test kết nối)
    if data.get("ping"):
        return jsonify({
            "status": "ok",
            "message": f"Python Server is running. Model: {active_model_path}",
            "model": active_model_path
        }), 200

    if "image" not in data:
        return jsonify({"detected": False, "error": "No image data"}), 400

    try:
        # Xử lý chuỗi Base64
        img_data_str = data["image"]
        # Cắt bỏ phần header nếu có (ví dụ: "data:image/jpeg;base64,...")
        if "," in img_data_str:
            img_data_str = img_data_str.split(",", 1)[1]
            
        img_bytes = base64.b64decode(img_data_str)
        image_pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_cv2 = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)

        # Chạy dự đoán bằng YOLO
        if model is None:
            return jsonify({"detected": False, "error": "Model not loaded"})

        # ===============================================================
        # TIỀN XỬ LÝ ẢNH SIÊU NHANH - Chỉ dùng CLAHE (~5ms)
        # ===============================================================
        # CLAHE - Tăng tương phản cục bộ (hiệu quả cho ảnh tối/chói)
        lab = cv2.cvtColor(img_cv2, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        img_enhanced = cv2.merge([l, a, b])
        img_enhanced = cv2.cvtColor(img_enhanced, cv2.COLOR_LAB2BGR)

        # Chạy model 1 lần duy nhất trên ảnh đã tăng cường
        results = model(img_enhanced, imgsz=IMAGE_SIZE, conf=CONFIDENCE_THRESHOLD, verbose=False)
        
        # Tìm box có độ tin cậy cao nhất
        best_box = None
        best_conf = 0.0
        best_label = ""
        
        for r in results:
            for box in r.boxes:
                conf = float(box.conf[0])
                if conf > best_conf:
                    best_conf = conf
                    best_box = box
                    class_id = int(box.cls[0])
                    best_label = model.names[class_id]

        if best_box is not None:
            logging.info(f"Detected: {best_label} ({best_conf*100:.1f}%)")
            return jsonify({
                "detected": True,
                "code": best_label,
                "name": f"Nhận diện: {best_label}",
                "confidence": round(best_conf * 100, 1),
                "distance": 35
            })

        return jsonify({"detected": False})

    except Exception as e:
        logging.error(f"Error processing image: {e}")
        return jsonify({"detected": False, "error": str(e)}), 500

# Endpoint kiểm tra sức khỏe server
@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "running",
        "model": active_model_path,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "image_size": IMAGE_SIZE
    })

if __name__ == "__main__":
    print(f"Active model: {active_model_path}")
    print(f"Confidence threshold: {CONFIDENCE_THRESHOLD}")
    print(f"Image size: {IMAGE_SIZE}")
    print("Starting Flask API Server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, threaded=True)
