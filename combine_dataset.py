import os
import shutil
import random
from pathlib import Path
from tqdm import tqdm
import re

# === 1. CẤU HÌNH ĐƯỜNG DẪN và TỈ LỆ CHIA ===

# THAY THẾ: Đường dẫn GỐC chứa folder 'images' và 'labels' đã được gom
SOURCE_ROOT_DIR = Path(r'C:\Users\W11\Desktop\Traffic_Detection_Project') 

# THƯ MỤC ĐÍCH sẽ chứa cấu trúc train/valid/test CUỐI CÙNG
DESTINATION_ROOT_DIR = Path(r'C:\Users\W11\Desktop\Traffic_Detection_Project\Final_Split_NoLeakage')

# TỈ LỆ CHIA DỮ LIỆU (Chia các NHÓM TIỀN TỐ)
TRAIN_RATIO = 0.8
VAL_RATIO = 0.1
TEST_RATIO = 0.1

IMAGE_EXTENSIONS = ('.jpg', '.png', '.jpeg')

# === 2. HÀM TRÍCH XUẤT TIỀN TỐ (LOGIC CHỐNG RÒ RỈ) ===

def extract_scene_prefix(filename_stem: str):
    """
    Trích xuất phần tên file đại diện cho CẢNH (Scene ID) bằng cách loại bỏ
    chuỗi số (Frame Counter) dài nhất ở cuối.
    
    Ví dụ: 'class_0_0001' -> 'class_0_' (giả định 0001 là frame counter)
    """
    # Tìm kiếm chuỗi số (4 chữ số trở lên) ở cuối tên file
    match = re.search(r'(\d{4,})$', filename_stem) 
    
    if match:
        # Trả về phần còn lại của tên file (Scene ID)
        # Loại bỏ ký tự phân tách (như gạch dưới) nếu nó nằm ngay trước số
        return filename_stem[:match.start()].rstrip('_')
    
    # Nếu không tìm thấy chuỗi số dài, sử dụng toàn bộ tên file làm nhóm duy nhất
    return filename_stem


def group_data_by_prefix(source_img_dir: Path, source_lbl_dir: Path):
    """
    Quét thư mục ảnh và nhóm các cặp (ảnh, nhãn) theo tiền tố cảnh.
    """
    grouped_data = {} # prefix -> list of (full_path_img, full_path_lbl)
    
    for img_file in source_img_dir.glob('*.*'):
        if img_file.suffix.lower() in IMAGE_EXTENSIONS:
            
            lbl_file = source_lbl_dir / f"{img_file.stem}.txt"
            
            if lbl_file.exists():
                
                # Trích xuất Scene ID (Tiền tố)
                prefix = extract_scene_prefix(img_file.stem)
                
                if prefix not in grouped_data:
                    grouped_data[prefix] = []
                    
                grouped_data[prefix].append({
                    'img_src': img_file,
                    'lbl_src': lbl_file,
                })
            else:
                print(f"Cảnh báo: Thiếu nhãn cho ảnh: {img_file.name}")
    
    print(f"Đã thu thập {len(grouped_data)} nhóm cảnh (scene) duy nhất.")
    return grouped_data


def split_and_copy(grouped_data, dest_root_dir, ratios):
    """
    Chia các nhóm tiền tố thành train/val/test và sao chép toàn bộ file.
    """
    all_prefixes = list(grouped_data.keys())
    random.shuffle(all_prefixes)
    total_prefixes = len(all_prefixes)
    
    # 2. Tính toán kích thước các tập
    train_size = int(ratios['train'] * total_prefixes)
    val_size = int(ratios['val'] * total_prefixes)
    test_size = total_prefixes - train_size - val_size 
    
    # 3. Chia các TIỀN TỐ thành 3 tập
    train_prefixes = set(all_prefixes[:train_size])
    val_prefixes = set(all_prefixes[train_size:train_size + val_size])
    test_prefixes = set(all_prefixes[train_size + val_size:])
    
    # 4. Tạo thư mục đích
    for folder in ['train', 'valid', 'test']:
        (dest_root_dir / folder / "images").mkdir(parents=True, exist_ok=True)
        (dest_root_dir / folder / "labels").mkdir(parents=True, exist_ok=True)

    # 5. Sao chép file dựa trên nhóm tiền tố
    total_copied = 0
    
    for prefix, data_list in tqdm(grouped_data.items(), desc="Sao chép dữ liệu"):
        
        # Xác định tập đích (train/valid/test)
        if prefix in train_prefixes:
            split_name = 'train'
        # [Remaining split logic, omitted for brevity]
        elif prefix in val_prefixes:
            split_name = 'valid'
        elif prefix in test_prefixes:
            split_name = 'test'
        else:
            continue
            
        img_dst = dest_root_dir / split_name / 'images'
        lbl_dst = dest_root_dir / split_name / 'labels'
        
        # Sao chép tất cả các file trong nhóm tiền tố này
        for item in data_list:
            try:
                # Sao chép file với tên gốc
                shutil.copy(item['img_src'], img_dst / item['img_src'].name)
                shutil.copy(item['lbl_src'], lbl_dst / item['lbl_src'].name)
                total_copied += 1
            except Exception as e:
                print(f"LỖI copy file {item['img_src'].name}: {e}")

    return total_prefixes, total_copied

# === 3. THỰC THI SCRIPT ===

if __name__ == '__main__':
    
    # Giả định folder đã được gom: SOURCE_ROOT_DIR / images VÀ SOURCE_ROOT_DIR / labels
    source_img_dir = SOURCE_ROOT_DIR / 'images'
    source_lbl_dir = SOURCE_ROOT_DIR / 'labels'
    
    if not source_img_dir.exists() or not source_lbl_dir.exists():
        print("LỖI CẤU TRÚC: Vui lòng kiểm tra đã gom ảnh/nhãn vào folder 'images' và 'labels' trong thư mục gốc chưa.")
        exit()
    
    # Bước 1: Thu thập dữ liệu theo tiền tố
    grouped_data = group_data_by_prefix(source_img_dir, source_lbl_dir)
    
    if not grouped_data:
        print("LỖI: Không tìm thấy cặp ảnh/nhãn nào.")
        exit()

    ratios = {'train': TRAIN_RATIO, 'val': VAL_RATIO, 'test': TEST_RATIO}
    
    # Bước 2: Chia và sao chép
    total_prefixes, total_copied = split_and_copy(grouped_data, DESTINATION_ROOT_DIR, ratios)

    print("\n" + "=" * 50)
    print("✅ HOÀN TẤT GỘP VÀ CHIA DỮ LIỆU THEO NHÓM CẢNH (CHỐNG RÒ RỈ)!")
    print(f"Tổng số nhóm cảnh (scene) đã xử lý: {total_prefixes}")
    print(f"Tổng số file đã được sao chép: {total_copied} (Ảnh và Nhãn)")
    print(f"Dữ liệu đã sẵn sàng tại: {DESTINATION_ROOT_DIR}")
    print("=" * 50)