import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO
import os

# ================= CẤU HÌNH =================
MODEL_PATH = r"C:\Users\Admin\Desktop\Study\PL_Python\Traffic_Detection_Project\best.pt" 
IMAGE_PATH = r"C:\Users\Admin\Downloads\archive\archive\images\1704.jpg" # Thay đổi đường dẫn ảnh của bạn
CONF_THRESHOLD = 0.4
# ============================================

def draw_text_pillow(img, text, pos, color=(255, 255, 255), bg_color=(0, 0, 0)):
    """
    Hàm vẽ chữ tiếng Việt lên ảnh OpenCV bằng thư viện Pillow
    """
    # Chuyển từ OpenCV (BGR) sang Pillow (RGB)
    img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img_pil)
    
    # Load Font chữ (Dùng Arial có sẵn trên Windows để hỗ trợ tiếng Việt)
    try:
        font_size = 20 # Bạn có thể chỉnh cỡ chữ to nhỏ ở đây
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        print("⚠️ Không tìm thấy font Arial, dùng font mặc định (có thể lỗi tiếng Việt)")
        font = ImageFont.load_default()

    # Tính toán kích thước khung nền cho chữ
    x, y = pos
    bbox = draw.textbbox((x, y), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    # Vẽ khung nền chữ (Background)
    draw.rectangle([x, y - text_h - 5, x + text_w + 10, y + 5], fill=bg_color)
    
    # Vẽ chữ
    draw.text((x + 5, y - text_h - 5), text, font=font, fill=color)
    
    # Chuyển ngược lại từ Pillow về OpenCV
    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

def main():
    # 1. Load Model
    if not os.path.exists(MODEL_PATH):
        print("❌ Không tìm thấy file weights!")
        return
    model = YOLO(MODEL_PATH)

    # 2. Đọc ảnh
    img = cv2.imread(IMAGE_PATH)
    if img is None:
        print("❌ Không đọc được file ảnh.")
        return

    # 3. Dự đoán
    results = model(img, conf=CONF_THRESHOLD)

    # 4. Vẽ kết quả thủ công (để hỗ trợ tiếng Việt)
    for r in results:
        boxes = r.boxes
        
        for box in boxes:
            # Lấy tọa độ
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            
            # Lấy thông tin class
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id] # Tên class tiếng Việt
            conf = float(box.conf[0])
            
            # Tạo nội dung hiển thị: Tên + Độ tin cậy
            label = f"{cls_name} ({conf:.2f})"
            
            # Chọn màu sắc ngẫu nhiên cho bounding box (hoặc cố định)
            color = (0, 255, 0) # Màu xanh lá (BGR)
            
            # Vẽ hình chữ nhật bao quanh vật thể (Dùng OpenCV cho nhanh)
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
            
            # Vẽ chữ Tiếng Việt (Dùng hàm Pillow viết ở trên)
            # Vị trí vẽ chữ: Ngay trên góc trái của hộp
            img = draw_text_pillow(img, label, (x1, y1), bg_color=(0, 150, 0))

    # 5. Lưu và hiển thị
    output_path = "result_vietnamese.jpg"
    cv2.imwrite(output_path, img)
    print(f"✅ Đã lưu ảnh kết quả tại: {output_path}")
    
    # Mở ảnh lên (nếu không chạy headless)
    try:
        cv2.imshow("Ket qua", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    except:
        pass

if __name__ == "__main__":
    main()