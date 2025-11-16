import os
from pathlib import Path

# --- 1. CẤU HÌNH ĐƯỜNG DẪN ---
# THAY THẾ bằng đường dẫn thư mục GỐC chứa tất cả các file nhãn (.txt) của bạn.
# Ví dụ: 'C:\Users\W11\Desktop\YOLO_Dataset_Split\train\labels'
LABELS_ROOT_DIR = Path('.') 

# Tên file TXT đầu ra sẽ chứa danh sách Class ID duy nhất
OUTPUT_FILE_NAME = 'unique_class_ids.txt' 

# --- 2. TRÍCH XUẤT VÀ XỬ LÝ ---

def extract_unique_class_ids(root_dir: Path, output_file: str):
    """
    Duyệt qua tất cả file .txt trong thư mục gốc và các thư mục con,
    trích xuất class ID duy nhất, và ghi ra file đầu ra.
    """
    if not root_dir.exists():
        print(f"LỖI: Thư mục nhãn không tồn tại tại {root_dir}")
        return

    unique_class_ids = set()
    total_files_scanned = 0

    print(f"Bắt đầu quét file nhãn trong: {root_dir}")

    # Sử dụng glob để tìm tất cả file .txt trong thư mục gốc và thư mục con
    for filepath in root_dir.rglob('*.txt'):
        total_files_scanned += 1
        
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    parts = line.strip().split()
                    if parts:
                        try:
                            # Class ID là phần tử đầu tiên (index 0)
                            class_id = int(parts[0])
                            unique_class_ids.add(class_id)
                        except ValueError:
                            # Bỏ qua nếu phần tử đầu tiên không phải là số
                            continue
        except Exception as e:
            print(f"CẢNH BÁO: Không thể đọc file {filepath}: {e}")
            continue

    # Sắp xếp các class ID theo thứ tự tăng dần
    sorted_ids = sorted(list(unique_class_ids))

    # Ghi kết quả ra file TXT
    output_path = root_dir / output_file
    with open(output_path, 'w') as f:
        f.write("# Danh sách Class ID duy nhất tìm thấy trong các file nhãn:\n")
        f.write(f"# Tổng số file nhãn đã quét: {total_files_scanned}\n\n")
        for class_id in sorted_ids:
            f.write(f"{class_id}\n")

    print("-" * 50)
    print("✅ HOÀN TẤT TRÍCH XUẤT!")
    print(f"  - Tổng số Class ID duy nhất tìm thấy: {len(sorted_ids)}")
    print(f"  - Các ID tìm thấy: {sorted_ids}")
    print(f"  - Kết quả đã được xuất ra file: {output_path}")

# --- 3. THỰC THI SCRIPT ---
if __name__ == '__main__':
    extract_unique_class_ids(LABELS_ROOT_DIR, OUTPUT_FILE_NAME)