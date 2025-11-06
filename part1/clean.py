import os
import shutil

# 🛠️ Đường dẫn đến 2 thư mục gốc
images_dir = "part1/images"   # ví dụ: "train_split/part1/images"
labels_dir = "part1/labels"   # ví dụ: "train_split/part1/labels"

# ✅ Tạo thư mục mới để lưu kết quả sạch (tùy chọn)
clean_images = images_dir + "_clean"
clean_labels = labels_dir + "_clean"

os.makedirs(clean_images, exist_ok=True)
os.makedirs(clean_labels, exist_ok=True)

# 🔍 Lấy danh sách file (không đuôi mở rộng)
image_names = {os.path.splitext(f)[0] for f in os.listdir(images_dir) if f.lower().endswith(('.jpg', '.png', '.jpeg'))}
label_names = {os.path.splitext(f)[0] for f in os.listdir(labels_dir) if f.endswith('.txt')}

# 🧠 Lấy giao giữa 2 tập (các file có cả ảnh và nhãn)
common = image_names & label_names

print(f"Tổng ảnh: {len(image_names)}")
print(f"Tổng nhãn: {len(label_names)}")
print(f"Giữ lại {len(common)} cặp hợp lệ ✅")

# 📦 Copy các file hợp lệ sang thư mục clean
for name in common:
    img_file = None
    for ext in ['.jpg', '.png', '.jpeg']:
        path = os.path.join(images_dir, name + ext)
        if os.path.exists(path):
            img_file = path
            break

    lbl_file = os.path.join(labels_dir, name + '.txt')

    if img_file and os.path.exists(lbl_file):
        shutil.copy(img_file, clean_images)
        shutil.copy(lbl_file, clean_labels)

print("🧹 Hoàn tất đồng bộ. Ảnh và nhãn sạch nằm trong thư mục *_clean")
