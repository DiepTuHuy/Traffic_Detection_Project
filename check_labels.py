from pathlib import Path

dataset_root = Path(r"C:\Users\W11\Desktop\part_1")
folders = ["train", "valid", "test"]

for folder in folders:
    img_count = len(list((dataset_root / folder / "images").glob("*.*")))
    lbl_count = len(list((dataset_root / folder / "labels").glob("*.txt")))
    print(f"{folder}: {img_count} ảnh, {lbl_count} label")
