import os
import re

# --- 1. CẤU HÌNH ĐƯỜNG DẪN GỐC ---
# Đường dẫn TỚI thư mục gốc chứa các folder nhãn (ví dụ: class_1/labels, class_2/labels, ...)
# Script sẽ duyệt qua tất cả các thư mục con trong đường dẫn này.
LABELS_ROOT_DIR = r'C:\Users\W11\Desktop\part_4\class\class_3\labels' 

# --- 2. HÀM TRỢ GIÚP ---

def get_class_index_from_path(path):
    """
    Trích xuất chỉ số lớp (số) từ tên thư mục bất kỳ trong đường dẫn.
    Ví dụ: '.../class_1/labels' -> 1
    """
    # Lấy tên thư mục cha
    parent_dir_name = os.path.basename(os.path.dirname(path))
    
    # Nếu file nằm ngay trong thư mục gốc, thử trích xuất từ tên thư mục gốc
    if not parent_dir_name:
         parent_dir_name = os.path.basename(path)
         
    # Sử dụng regex để tìm số cuối cùng trong tên thư mục
    match = re.search(r'(\d+)$', parent_dir_name) 
    if match:
        return int(match.group(1))
    
    return None

def update_label_file(filepath, new_class_index):
    """
    Đọc file nhãn, thay thế chỉ số lớp đầu tiên bằng chỉ số mới, và ghi đè.
    """
    lines_updated_count = 0
    
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    is_updated = False
    
    for line in lines:
        parts = line.strip().split()
        if not parts:
            new_lines.append(line) # Giữ nguyên dòng trống
            continue
            
        try:
            old_index = int(parts[0])
            
            if old_index != new_class_index:
                parts[0] = str(new_class_index)
                is_updated = True
                lines_updated_count += 1
            
            new_lines.append(" ".join(parts) + "\n")
            
        except ValueError:
            # Giữ nguyên dòng nếu không bắt đầu bằng số
            new_lines.append(line)
            continue
            
    # Ghi đè file nếu có bất kỳ sự thay đổi nào
    if is_updated:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)
            
    return lines_updated_count

# --- 3. TIẾN HÀNH XỬ LÝ ---
if not os.path.exists(LABELS_ROOT_DIR):
    print(f"LỖI: Thư mục gốc nhãn không tồn tại tại {LABELS_ROOT_DIR}")
    exit()

total_files_processed = 0
total_lines_updated = 0

print(f"Bắt đầu cập nhật chỉ số lớp dựa trên tên thư mục trong: {LABELS_ROOT_DIR}")
print("-" * 50)

# Duyệt qua tất cả các thư mục con và file
for root, dirs, files in os.walk(LABELS_ROOT_DIR):
    # Lấy chỉ số lớp dựa trên tên thư mục cha chứa file .txt
    new_index = get_class_index_from_path(root)
    
    if new_index is not None:
        print(f"-> Thư mục: {os.path.basename(root)}. Gán chỉ số lớp: **{new_index}**")
        
        for file in files:
            if file.endswith('.txt'):
                filepath = os.path.join(root, file)
                
                # Cập nhật file nhãn
                lines_updated = update_label_file(filepath, new_index)
                
                if lines_updated > 0:
                    total_files_processed += 1
                    total_lines_updated += lines_updated
                    # print(f"    - Đã sửa {lines_updated} dòng trong file {file}") # Bỏ comment nếu muốn xem chi tiết

# --- 4. KẾT QUẢ ---
print("-" * 50)
print("✅ HOÀN TẤT CẬP NHẬT NHÃN!")
print(f"  - Tổng số file nhãn đã được sửa: {total_files_processed} file.")
print(f"  - Tổng số dòng (đối tượng) đã được thay đổi chỉ số: {total_lines_updated}.")