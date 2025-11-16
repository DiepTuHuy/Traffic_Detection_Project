import os
from pathlib import Path

# === CẤU HÌNH ===
dataset_root = Path(r".")  # thư mục gốc chứa train/valid/test
folders = ["train", "valid", "test"]

# === HÀM KIỂM TRA ===
def check_missing(folder_path):
    img_dir = folder_path / "images"
    lbl_dir = folder_path / "labels"

    # lấy danh sách file
    img_files = {f.stem for f in img_dir.glob("*.*") if f.suffix.lower() in [".jpg", ".png", ".jpeg"]}
    lbl_files = {f.stem for f in lbl_dir.glob("*.txt")}

    # tìm file thiếu
    missing_labels = img_files - lbl_files
    missing_images = lbl_files - img_files

    # in kết quả
    print(f"\n📁 Kiểm tra thư mục: {folder_path.name}")
    print(f"  Tổng ảnh: {len(img_files)}, Tổng nhãn: {len(lbl_files)}")

    if missing_labels:
        print(f"  ⚠️  {len(missing_labels)} ảnh KHÔNG có nhãn:")
        for name in sorted(missing_labels):
            print(f"     - {name}")
    else:
        print("  ✅ Tất cả ảnh đều có nhãn.")

    if missing_images:
        print(f"  ⚠️  {len(missing_images)} nhãn KHÔNG có ảnh:")
        for name in sorted(missing_images):
            print(f"     - {name}")
    else:
        print("  ✅ Tất cả nhãn đều có ảnh.")

# === CHẠY KIỂM TRA 3 FOLDER ===
for f in folders:
    folder_path = dataset_root / f
    if (folder_path / "images").exists() and (folder_path / "labels").exists():
        check_missing(folder_path)
    else:
        print(f"❌ Bỏ qua {f}: thiếu thư mục images/labels.")
