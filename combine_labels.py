import os
import shutil
import re

# === Đường dẫn gốc ===
base_dir = r"C:\Users\W11\Desktop\class"
labels_source = os.path.join(base_dir, "labels")

# === File log để ghi kết quả ===
log_path = os.path.join(base_dir, "distribute_labels_log.txt")
log = open(log_path, "w", encoding="utf-8")

# === Duyệt qua từng class_X ===
for class_folder in [f for f in os.listdir(base_dir) if f.startswith("class_")]:
    class_path = os.path.join(base_dir, class_folder)
    images_dir = os.path.join(class_path, "images")
    labels_dest = os.path.join(class_path, "labels")
    os.makedirs(labels_dest, exist_ok=True)

    found_count = 0
    miss_count = 0

    if not os.path.exists(images_dir):
        print(f"⚠️ Không tìm thấy thư mục: {images_dir}")
        continue

    for img_file in os.listdir(images_dir):
        if img_file.lower().endswith((".jpg", ".jpeg", ".png")):
            img_name = os.path.splitext(img_file)[0]

            # Lấy phần số cuối (nếu có), ví dụ IMG_001 -> 001
            match = re.search(r"(\d+)$", img_name)
            number_part = match.group(1) if match else img_name

            # Các khả năng tên label
            candidates = [
                f"{img_name}.txt",
                f"{number_part}.txt",
                f"IMG_{number_part}.txt",
                f"img_{number_part}.txt"
            ]

            label_found = False
            for lbl in candidates:
                label_path = os.path.join(labels_source, lbl)
                if os.path.exists(label_path):
                    shutil.copy(label_path, os.path.join(labels_dest, lbl))
                    log.write(f"[OK] {class_folder}/Images/{img_file} → {lbl}\n")
                    found_count += 1
                    label_found = True
                    break

            if not label_found:
                log.write(f"[MISS] {class_folder}/Images/{img_file}\n")
                miss_count += 1

    log.write(f"\n--- {class_folder}: {found_count} labels OK, {miss_count} thiếu ---\n\n")
    print(f"✅ {class_folder}: {found_count} OK, {miss_count} thiếu")

log.close()
print(f"\n🎯 Hoàn tất! Xem chi tiết log tại: {log_path}")
