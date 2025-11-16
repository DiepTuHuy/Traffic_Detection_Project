import os
import shutil
import random
from pathlib import Path
from tqdm import tqdm
import re

# === 1. CẤU HÌNH ĐƯỜNG DẪN VÀ LOGIC ===

# THAY THẾ: Đường dẫn GỐC chứa các folder train, valid, test bị rò rỉ
SOURCE_SPLIT_ROOT = Path(r'.') 

# THƯ MỤC ĐÍCH MỚI để lưu kết quả chia lại SẠCH
DESTINATION_ROOT = Path(r'C:\Users\Admin\Desktop\data_new')

# CÁC TẬP CẦN QUÉT
SPLITS_TO_SCAN = ['train', 'val', 'test'] 

# TỈ LỆ CHIA (Chia các NHÓM TIỀN TỐ)
TRAIN_RATIO = 0.8
VAL_RATIO = 0.1
TEST_RATIO = 0.1

IMAGE_EXTENSIONS = ('.jpg', '.png', '.jpeg')

# === 2. HÀM TRÍCH XUẤT TIỀN TỐ (LOGIC CHỐNG RÒ RỈ) ===

def extract_scene_prefix(filename_stem: str):
    """
    Hàm này phải trích xuất phần tên file đại diện cho CẢNH (Scene ID) 
    bằng cách loại bỏ chuỗi số (Frame Counter) 2 chữ số trở lên ở cuối.
    """
    # Thay đổi logic: Tìm kiếm chuỗi số (2 chữ số trở lên) ở cuối tên file
    match = re.search(r'(\d{2,})$', filename_stem) 
    
    if match:
        # Trả về phần còn lại của tên file (Scene ID)
        # Ví dụ: 'part1_class_0_00' -> 'part1_class_0'
        return filename_stem[:match.start()].rstrip('_')
    
    # Nếu không tìm thấy số, trả về toàn bộ tên file làm tiền tố
    return filename_stem

def gather_all_files(source_root: Path):
    """
    Quét tất cả folder train/valid/test hiện tại và gom file lại theo Prefix.
    """
    grouped_data = {} # prefix -> list of (full_path_img, full_path_lbl, file_name)
    total_files_found = 0
    
    for split_name in SPLITS_TO_SCAN:
        img_dir = source_root / split_name / 'images'
        lbl_dir = source_root / split_name / 'labels'
        
        if not img_dir.exists():
            print(f"[CẢNH BÁO] Không tìm thấy folder ảnh cho tập {split_name}.")
            continue
            
        for img_file_path in img_dir.glob('*.*'):
            if img_file_path.suffix.lower() in IMAGE_EXTENSIONS:
                
                lbl_file_path = lbl_dir / f"{img_file_path.stem}.txt"
                
                if lbl_file_path.exists():
                    
                    prefix = extract_scene_prefix(img_file_path.stem)
                    
                    if prefix not in grouped_data:
                        grouped_data[prefix] = []
                        
                    grouped_data[prefix].append({
                        'img_src': img_file_path,
                        'lbl_src': lbl_file_path,
                        'name': img_file_path.name
                    })
                    total_files_found += 1
                
    print(f"-> Đã thu thập {total_files_found} file và {len(grouped_data)} nhóm Scene ID.")
    return grouped_data

# === 3. HÀM CHIA VÀ SAO CHÉP ===

def split_and_copy(grouped_data, dest_root_dir, ratios):
    
    # 1. Chuẩn bị danh sách các TIỀN TỐ để chia ngẫu nhiên
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
    
    # 4. Tạo thư mục đích SẠCH
    for folder in ['train', 'valid', 'test']:
        (dest_root_dir / folder / "images").mkdir(parents=True, exist_ok=True)
        (dest_root_dir / folder / "labels").mkdir(parents=True, exist_ok=True)
        # Khởi tạo lại thư mục để đảm bảo sạch (Optional: xóa folder cũ nếu cần)

    # 5. Sao chép file dựa trên nhóm tiền tố
    total_copied = 0
    
    for prefix, data_list in tqdm(grouped_data.items(), desc="Chia lại dữ liệu theo nhóm"):
        
        # Xác định tập đích (train/valid/test)
        if prefix in train_prefixes:
            split_name = 'train'
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
                shutil.copy(item['img_src'], img_dst / item['name'])
                shutil.copy(item['lbl_src'], lbl_dst / item['name'].replace(item['img_src'].suffix, '.txt'))
                total_copied += 1
            except Exception as e:
                print(f"LỖI copy file {item['name']}: {e}")

    return total_prefixes, total_copied

# === 4. THỰC THI SCRIPT ===

if __name__ == '__main__':
    
    print("--- Bắt đầu thu thập và chia lại dữ liệu ---")
    
    # Bước 1: Thu thập toàn bộ file từ các tập bị rò rỉ
    grouped_data = gather_all_files(SOURCE_SPLIT_ROOT)
    
    if not grouped_data:
        print("LỖI: Không tìm thấy file nào. Vui lòng kiểm tra lại đường dẫn và cấu trúc train/valid/test.")
        exit()

    ratios = {'train': TRAIN_RATIO, 'val': VAL_RATIO, 'test': TEST_RATIO}
    
    # Bước 2: Chia và sao chép SẠCH
    total_prefixes, total_copied = split_and_copy(grouped_data, DESTINATION_ROOT, ratios)

    print("\n" + "=" * 50)
    print("✅ HOÀN TẤT CHIA LẠI DỮ LIỆU (ĐÃ SỬA LỖI RÒ RỈ)!")
    print(f"Tổng số file đã được sao chép: {total_copied}")
    print(f"Dữ liệu SẠCH đã được lưu tại: {DESTINATION_ROOT}")
    print("=" * 50)