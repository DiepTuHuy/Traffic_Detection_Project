import os
from pathlib import Path

# === Cấu hình dataset ===
dataset_root = Path(".")  # thư mục gốc dataset YOLO
folders = ["train", "val", "test"]

total_deleted = 0

for folder in folders:
    img_folder = dataset_root / folder / "images"
    lbl_folder = dataset_root / folder / "labels"

    if not img_folder.exists() or not lbl_folder.exists():
        print(f"\n⚠ Bỏ qua folder {folder} (thiếu images hoặc labels)")
        continue

    img_files = list(img_folder.glob("*.*"))
    lbl_files = list(lbl_folder.glob("*.txt"))

    img_stems = {f.stem for f in img_files}
    lbl_stems = {f.stem for f in lbl_files}

    labels_no_img = lbl_stems - img_stems

    print(f"\n=== Folder: {folder} ===")
    print(f"Số label không có ảnh: {len(labels_no_img)}")

    # Tiến hành xoá
    for stem in labels_no_img:
        lbl_path = lbl_folder / f"{stem}.txt"
        if lbl_path.exists():
            os.remove(lbl_path)
            total_deleted += 1
            print(f"❌ Deleted: {lbl_path}")

print(f"\n➡ Hoàn tất! Tổng số label bị xoá: {total_deleted}")
