import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO
import os

MODEL_PATH = r".\train\Yolo12m\best.pt" 
IMAGE_PATH = r".\test_image.jpg"
CONF_THRESHOLD = 0.4

def draw_text_pillow(img, text, pos, color=(255, 255, 255), bg_color=(0, 0, 0)):
    img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img_pil)
    
    try:
        font_size = 20 
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        print("⚠️ Không tìm thấy font Arial, dùng font mặc định (có thể lỗi tiếng Việt)")
        font = ImageFont.load_default()

    x, y = pos
    bbox = draw.textbbox((x, y), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    draw.rectangle([x, y - text_h - 5, x + text_w + 10, y + 5], fill=bg_color)
    
    draw.text((x + 5, y - text_h - 5), text, font=font, fill=color)
    
    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

def main():
    if not os.path.exists(MODEL_PATH):
        print("❌ Không tìm thấy file weights!")
        return
    model = YOLO(MODEL_PATH)

    img = cv2.imread(IMAGE_PATH)
    if img is None:
        print("❌ Không đọc được file ảnh.")
        return

    results = model(img, conf=CONF_THRESHOLD)

    for r in results:
        boxes = r.boxes
        
        for box in boxes:
            # Lấy tọa độ
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            conf = float(box.conf[0])
            
            label = f"{cls_name} ({conf:.2f})"
            
            color = (0, 255, 0) 
            
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
            
            img = draw_text_pillow(img, label, (x1, y1), bg_color=(0, 150, 0))

    output_path = "result_vietnamese.jpg"
    cv2.imwrite(output_path, img)
    print(f"✅ Đã lưu ảnh kết quả tại: {output_path}")
    
    try:
        cv2.imshow("Ket qua", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    except:
        pass

if __name__ == "__main__":
    main()