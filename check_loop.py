import shutil
from pathlib import Path

dataset_root = Path(".")

folders = ["train", "val", "test"]

# Tạo thư mục tạm
temp_dirs = {f: dataset_root / f"temp_{f}" for f in folders}
for d in temp_dirs.values():
    (d / "images").mkdir(parents=True, exist_ok=True)
    (d / "labels").mkdir(parents=True, exist_ok=True)

# Lấy danh sách stem ảnh trong từng tập
stems = {}
for f in folders:
    img_dir = dataset_root / f / "images"
    stems[f] = {p.stem for p in img_dir.glob("*.*")}
    print(f"Found {len(stems[f])} images in {f}")

# ===== Tìm trùng lặp giữa các tập =====
duplicates = {
    ("train", "val"): stems["train"] & stems["val"],
    ("train", "test"): stems["train"] & stems["test"],
    ("val", "test"): stems["val"] & stems["test"]
}

total_dups = sum(len(v) for v in duplicates.values())
print(f"\nTotal duplicate images found: {total_dups}\n")

# ===== Hàm di chuyển ảnh + label =====
def move_pair(stem, src_folder):
    img_src_jpg = dataset_root / src_folder / "images" / f"{stem}.jpg"
    img_src_png = dataset_root / src_folder / "images" / f"{stem}.png"

    lbl_src = dataset_root / src_folder / "labels" / f"{stem}.txt"

    # Chọn đúng định dạng ảnh
    if img_src_jpg.exists():
        img_src = img_src_jpg
    elif img_src_png.exists():
        img_src = img_src_png
    else:
        print(f"⚠ Không tìm thấy ảnh {stem} trong {src_folder}")
        return

    # Đường dẫn đích
    img_dst = temp_dirs[src_folder] / "images" / img_src.name
    lbl_dst = temp_dirs[src_folder] / "labels" / f"{stem}.txt"

    # Di chuyển ảnh
    shutil.move(str(img_src), str(img_dst))

    # Di chuyển label nếu có
    if lbl_src.exists():
        shutil.move(str(lbl_src), str(lbl_dst))


# ===== Xử lý di chuyển cho từng cặp trùng =====
for (a, b), dups in duplicates.items():
    print(f"Duplicates between {a} & {b}: {len(dups)}")
    for stem in dups:
        move_pair(stem, a)
        move_pair(stem, b)

print("\n✔ Done! All duplicates moved to temp_train/, temp_val/, temp_test/")
