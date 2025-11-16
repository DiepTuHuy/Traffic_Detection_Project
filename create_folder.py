import os

# === Cấu hình ===
output_root = r"C:\Users\W11\Desktop\class"

# Tạo thư mục từ class_0 đến class_57
for i in range(4):
    class_dir = os.path.join(output_root, f"class_{i}")
    images_dir = os.path.join(class_dir, "images")
    labels_dir = os.path.join(class_dir, "labels")

    # Tạo từng thư mục nếu chưa có
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(labels_dir, exist_ok=True)

print("✅ Đã tạo đầy đủ thư mục class_0 đến class_3.")