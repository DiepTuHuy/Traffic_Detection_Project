import os
from pathlib import Path

# === Cấu hình dataset của bạn ===
dataset_root = Path(".")  # thư mục gốc dataset YOLO
folders = ["train", "val", "test"]

for folder in folders:
    img_folder = dataset_root / folder / "images"
    lbl_folder = dataset_root / folder / "labels"

    img_files = list(img_folder.glob("*.*"))
    lbl_files = list(lbl_folder.glob("*.txt"))

    print(f"\n=== Folder: {folder} ===")
    print(f"Số ảnh: {len(img_files)}")
    print(f"Số label: {len(lbl_files)}")

    # Ảnh không có label
    img_stems = {f.stem for f in img_files}
    lbl_stems = {f.stem for f in lbl_files}

    imgs_no_label = img_stems - lbl_stems
    labels_no_img = lbl_stems - img_stems

    print(f"Số ảnh không có label: {len(imgs_no_label)}")
    if imgs_no_label:
        print("Ví dụ ảnh không label:", list(imgs_no_label)[:10])

    print(f"Số label không có ảnh: {len(labels_no_img)}")
    if labels_no_img:
        print("Ví dụ label không ảnh:", list(labels_no_img)[:10])
