import shutil
from pathlib import Path

# === Cấu hình ===
part1 = Path(r"part1")
part2 = Path(r"part2")
output = Path(r"train")

# Tạo thư mục đích
(output / "images").mkdir(parents=True, exist_ok=True)
(output / "labels").mkdir(parents=True, exist_ok=True)

# === Hàm copy ảnh và nhãn tương ứng ===
def copy_with_label(src_folder, dst_folder):
    img_src = src_folder / "images"
    lbl_src = src_folder / "labels"

    img_dst = dst_folder / "images"
    lbl_dst = dst_folder / "labels"

    count = 0
    for img_file in img_src.glob("*.*"):
        if img_file.suffix.lower() not in [".jpg", ".png", ".jpeg"]:
            continue

        lbl_file = lbl_src / f"{img_file.stem}.txt"

        # copy ảnh
        shutil.copy(img_file, img_dst / img_file.name)

        # copy nhãn nếu có
        if lbl_file.exists():
            shutil.copy(lbl_file, lbl_dst / lbl_file.name)
        else:
            print(f"⚠️ Không tìm thấy nhãn cho: {img_file.name}")

        count += 1

    print(f"✅ Đã copy {count} ảnh từ {src_folder.name}")

# === Gộp 2 phần train ===
copy_with_label(part1, output)
copy_with_label(part2, output)


print("\n🎯 Hoàn tất combine 2 folder train vào train_combined!")