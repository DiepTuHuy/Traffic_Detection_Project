import cv2
from pathlib import Path

# Cấu hình
dataset_dir = Path(r".")
target_size = (640, 640)   # có thể đổi 640x640 nếu dùng YOLO
padding_color = [0, 0, 0]  # nền đen, nếu muốn trắng: [255,255,255]

def resize_with_padding(img, target_size=(640,640), pad_color=[0,0,0]):
    h, w = img.shape[:2]
    scale = min(target_size[0]/h, target_size[1]/w)
    new_w, new_h = int(w*scale), int(h*scale)
    resized = cv2.resize(img, (new_w, new_h))
    delta_w = target_size[1] - new_w
    delta_h = target_size[0] - new_h
    top, bottom = delta_h//2, delta_h - delta_h//2
    left, right = delta_w//2, delta_w - delta_w//2
    new_img = cv2.copyMakeBorder(resized, top, bottom, left, right, cv2.BORDER_CONSTANT, value=pad_color)
    return new_img

# Resize tất cả ảnh trong train/val/test
for split in ['train','val','test']:
    split_dir = dataset_dir / split
    for cls in split_dir.iterdir():
        if not cls.is_dir():
            continue
        for img_path in cls.glob('*.*'):
            if img_path.suffix.lower() not in ['.jpg','.jpeg','.png','.bmp']:
                continue
            img = cv2.imread(str(img_path))
            if img is None:
                continue
            new_img = resize_with_padding(img, target_size, padding_color)
            cv2.imwrite(str(img_path), new_img)

print("✅ Resize toàn bộ ảnh xong, giữ tỷ lệ + padding.")
