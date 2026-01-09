import os
import shutil
import re

def update_labels_by_mapping_file(new_class_file, input_images_dir, input_labels_dir, output_root):
    # 1. Đọc file new_class.txt để tạo dictionary mapping {oldID: newID}
    mapping = {}
    try:
        with open(new_class_file, 'r', encoding='utf-8') as f:
            for line in f:
                # Sử dụng Regex để tìm số sau 'old:' và 'new:'
                # Định dạng mong đợi: "... - old: 31 - new: 58"
                match = re.search(r'old:\s*(\d+)\s*-\s*new:\s*(\d+)', line)
                if match:
                    old_id = match.group(1)
                    new_id = match.group(2)
                    mapping[old_id] = new_id
        
        if not mapping:
            print("Không tìm thấy dữ liệu mapping trong file new_class.txt!")
            return
        
        print(f"Đã nạp bảng ánh xạ: {mapping}")

    except Exception as e:
        print(f"Lỗi khi đọc file mapping: {e}")
        return

    # 2. Tạo cấu trúc thư mục đầu ra
    output_images_dir = os.path.join(output_root, 'images')
    output_labels_dir = os.path.join(output_root, 'labels')
    
    os.makedirs(output_images_dir, exist_ok=True)
    os.makedirs(output_labels_dir, exist_ok=True)

    # 3. Lấy danh sách các file nhãn
    if not os.path.exists(input_labels_dir):
        print(f"Lỗi: Thư mục nhãn '{input_labels_dir}' không tồn tại.")
        return
        
    label_files = [f for f in os.listdir(input_labels_dir) if f.endswith('.txt')]
    print(f"Bắt đầu xử lý {len(label_files)} file nhãn...")

    count_updated = 0
    for label_file in label_files:
        src_label_path = os.path.join(input_labels_dir, label_file)
        
        # --- XỬ LÝ NỘI DUNG FILE NHÃN ---
        new_lines = []
        with open(src_label_path, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if not parts:
                    continue
                
                old_id = parts[0]
                # Nếu ID nằm trong phần [old] thì đổi sang [new], ngược lại giữ nguyên
                if old_id in mapping:
                    parts[0] = mapping[old_id]
                
                new_lines.append(" ".join(parts))

        # Ghi file nhãn mới
        dst_label_path = os.path.join(output_labels_dir, label_file)
        with open(dst_label_path, 'w') as f:
            f.write("\n".join(new_lines) + "\n")

        # --- SAO CHÉP ẢNH TƯƠNG ỨNG ---
        file_name_no_ext = os.path.splitext(label_file)[0]
        image_found = False
        # Thử các định dạng ảnh phổ biến
        for ext in ['.jpg', '.jpeg', '.png', '.JPG', '.PNG']:
            src_image_path = os.path.join(input_images_dir, file_name_no_ext + ext)
            if os.path.exists(src_image_path):
                shutil.copy(src_image_path, output_images_dir)
                image_found = True
                break
        
        count_updated += 1

    print(f"--- Hoàn thành! ---")
    print(f"Đã xử lý: {count_updated} file.")
    print(f"Kết quả lưu tại: {output_root}")

# Cấu hình đường dẫn
CONFIG = {
    'mapping_file': 'new_class.txt',
    'images_src': r"D:\Study\NNLT-Python\Dataset_con\archive\images",    # Thư mục ảnh gốc
    'labels_src': r"D:\Study\NNLT-Python\Dataset_con\archive\labels",    # Thư mục nhãn gốc
    'output_folder': 'ket_qua_loc'
}

if __name__ == "__main__":
    update_labels_by_mapping_file(
        CONFIG['mapping_file'],
        CONFIG['images_src'],
        CONFIG['labels_src'],
        CONFIG['output_folder']
    )