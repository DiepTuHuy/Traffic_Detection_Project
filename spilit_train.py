import os
import shutil
import random
from pathlib import Path

# === Cấu hình ===
train_root = Path(r"train")  # đường dẫn thư mục train gốc
output_root = Path(r"train_split")  # nơi lưu kết quả
split_ratio = 0.5  # tỉ lệ chia 50 - 50

# === Tạo thư mục đầu ra ===
for part in ["part1", "part2"]:
    (output_root / part / "images").mkdir(parents=True, exist_ok=True)
    (output_root / part / "labels").mkdir(parents=True, exist_ok=True)

# === Lấy danh sách ảnh & nhãn ===
image_dir = train_root / "images"
label_dir = train_root / "labels"

image_files = sorted([f for f in image_dir.glob("*.*") if f.suffix.lower() in [".jpg", ".png", ".jpeg"]])
label_files = sorted([f for f in label_dir.glob("*.txt")])

# === Lọc ra các cặp khớp nhau ===
matched_pairs = []
for img in image_files:
    label = label_dir / (img.stem + ".txt")
    if label.exists():
        matched_pairs.append((img, label))

print(f"Tổng số ảnh có nhãn hợp lệ: {len(matched_pairs)}")

# === Chia tập ngẫu nhiên ===
random.shuffle(matched_pairs)
split_index = int(len(matched_pairs) * split_ratio)
part1 = matched_pairs[:split_index]
part2 = matched_pairs[split_index:]

# === Hàm copy ===
def copy_pairs(pairs, dest):
    for img, lbl in pairs:
        shutil.copy(img, dest / "images" / img.name)
        shutil.copy(lbl, dest / "labels" / lbl.name)

# === Copy dữ liệu ===
copy_pairs(part1, output_root / "part1")
copy_pairs(part2, output_root / "part2")

print(f"Đã chia thành:")
print(f"  Part1: {len(part1)} ảnh + nhãn ({split_ratio*100:.0f}%)")