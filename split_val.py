import os, random, shutil
from pathlib import Path

base_dir = Path(r'.')
train_dir = base_dir / 'train'
val_dir = base_dir / 'val'
val_ratio = 0.15   # lấy 15% từ train để làm val

for cls in train_dir.iterdir():
    if not cls.is_dir():
        continue

    imgs = list(cls.glob('*.*'))
    random.shuffle(imgs)
    n_val = int(len(imgs) * val_ratio)
    val_imgs = imgs[:n_val]

    out_dir = val_dir / cls.name
    out_dir.mkdir(parents=True, exist_ok=True)

    for img_path in val_imgs:
        shutil.move(str(img_path), str(out_dir / img_path.name))

print("✅ Đã tạo thư mục val (validation set) thành công.")
