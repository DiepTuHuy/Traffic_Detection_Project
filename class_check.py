import os
from collections import defaultdict

# === Cấu hình Thư mục ===
# Đặt script này vào thư mục GỐC của dataset (chứa các folder train, test, valid)
base_dir = r"." 
splits = ["train", "test", "val"]
output_file = os.path.join(base_dir, "class_summary.txt")

# Lưu class -> set ảnh (Để đếm số ảnh chứa class đó)
class_to_images = defaultdict(set)
# Lưu class -> int (Để đếm tổng số lần xuất hiện của class)
class_to_count = defaultdict(int) 

missing_labels = []

# === 1. Quét và Thống kê Dữ liệu ===
print("Bắt đầu quét dữ liệu và thống kê class ID...")

for split in splits:
    label_dir = os.path.join(base_dir, split, "labels")
    img_dir = os.path.join(base_dir, split, "images")

    if not os.path.exists(label_dir):
        print(f"[CẢNH BÁO] Không tìm thấy thư mục labels cho {split}: {label_dir}")
        continue

    for label_file in os.listdir(label_dir):
        if not label_file.endswith(".txt"):
            continue

        label_path = os.path.join(label_dir, label_file)
        image_name = os.path.splitext(label_file)[0]

        # Tìm ảnh tương ứng (để ghi vào danh sách thống kê)
        img_path = None
        for ext in [".jpg", ".jpeg", ".png"]:
            test_path = os.path.join(img_dir, image_name + ext)
            if os.path.exists(test_path):
                # Lưu đường dẫn tương đối
                img_path = os.path.join(split, "images", image_name + ext)
                break

        try:
            with open(label_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        except Exception as e:
            print(f"[❌] Lỗi đọc file {label_path}: {e}")
            continue

        if not lines or all(len(line.strip()) == 0 for line in lines):
            missing_labels.append(os.path.join(split, "labels", label_file))
            continue

        for line in lines:
            parts = line.strip().split()
            if len(parts) == 0:
                continue
            
            # Class ID là phần tử đầu tiên
            cls_id = parts[0]
            
            # Cập nhật số lần xuất hiện
            class_to_count[cls_id] += 1 
            
            # Cập nhật set ảnh
            if img_path:
                class_to_images[cls_id].add(img_path)

# === 2. Ghi ra file TXT Thống kê ===
with open(output_file, "w", encoding="utf-8") as f:
    f.write("=== 📊 BÁO CÁO THỐNG KÊ CLASS ID ===\n")
    f.write("{:<10} {:<15} {:<10}\n".format("CLASS ID", "TỔNG COUNT", "TỔNG ẢNH"))
    f.write("-" * 60 + "\n")
    
    # Sắp xếp theo ID
    for cls_id, img_set in sorted(class_to_images.items(), key=lambda x: int(x[0])):
        count = class_to_count.get(cls_id, 0)
        f.write("{:<10} {:<15} {:<10}\n".format(cls_id, count, len(img_set)))
        
        f.write("\nDanh sách file ảnh chứa class này:\n")
        f.write("-" * 60 + "\n")
        for img_path in sorted(img_set):
            f.write(img_path + "\n")
        f.write("\n" + "=" * 60 + "\n")

    if missing_labels:
        f.write(f"\n⚠️ CẢNH BÁO: Có {len(missing_labels)} file label rỗng hoặc lỗi:\n")
        for path in missing_labels:
            f.write(path + "\n")
    else:
        f.write("\n✅ Không có file label nào bị rỗng hoặc lỗi nội dung!\n")

print(f"\n✅ Đã xuất kết quả chi tiết ra file: {output_file}")