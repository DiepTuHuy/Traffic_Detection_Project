"""
Script kiểm tra API YOLO - Gửi ảnh biển báo trực tiếp tới server để xác minh nhận diện.
"""
import base64
import requests
import os
import sys

API_URL = "http://127.0.0.1:5000/predict"
REFERENCE_DIR = "reference"

def test_image(image_path):
    """Gửi 1 ảnh tới API và in kết quả"""
    if not os.path.exists(image_path):
        print(f"❌ Không tìm thấy file: {image_path}")
        return
    
    with open(image_path, "rb") as f:
        img_bytes = f.read()
    
    base64_str = "data:image/png;base64," + base64.b64encode(img_bytes).decode("utf-8")
    
    try:
        resp = requests.post(API_URL, json={"image": base64_str}, timeout=30)
        data = resp.json()
        
        filename = os.path.basename(image_path)
        if data.get("detected"):
            print(f"✅ [{filename}]")
            print(f"   → Nhận diện: {data['code']}")
            print(f"   → Độ tin cậy: {data['confidence']}%")
            match = "ĐÚNG ✓" if data['code'].lower().replace(" ", "") in filename.lower().replace(" ", "").replace(".png", "").replace(".jpg", "") else "CẦN KIỂM TRA"
            print(f"   → So sánh tên file: {match}")
        else:
            print(f"❌ [{filename}] → Không phát hiện biển báo nào!")
        print()
    except requests.exceptions.ConnectionError:
        print("❌ Không kết nối được tới server! Hãy chắc chắn 'python yolo_api.py' đang chạy.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Lỗi: {e}")

def main():
    # Trước tiên kiểm tra server có chạy không
    try:
        resp = requests.get("http://127.0.0.1:5000/", timeout=5)
        info = resp.json()
        print("=" * 60)
        print(f"Server đang chạy!")
        print(f"  Model: {info.get('model', 'N/A')}")
        print(f"  Confidence: {info.get('confidence_threshold', 'N/A')}")
        print(f"  Image size: {info.get('image_size', 'N/A')}")
        print("=" * 60)
        print()
    except:
        print("❌ Server chưa chạy! Hãy chạy: python yolo_api.py")
        return

    # Test 5 ảnh mẫu từ thư mục reference
    test_files = [
        "Cam di nguoc chieu.png",
        "Cam dung va do xe.png",
        "Gioi han toc do 60km-h.png",
        "Gioi han toc do 80km-h.png",
        "Duong nguoi di bo cat ngang.png",
    ]
    
    print("--- BẮT ĐẦU KIỂM TRA NHẬN DIỆN ---\n")
    for filename in test_files:
        path = os.path.join(REFERENCE_DIR, filename)
        test_image(path)

if __name__ == "__main__":
    main()
