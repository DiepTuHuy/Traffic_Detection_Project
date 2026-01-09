import os
import shutil

def move_dataset_files(train_list_file, test_list_file, src_img_dir, src_label_dir, output_root):
    # 1. Định nghĩa cấu trúc thư mục đích
    folders = {
        'train': {
            'images': os.path.join(output_root, 'train', 'images'),
            'labels': os.path.join(output_root, 'train', 'labels')
        },
        'test': {
            'images': os.path.join(output_root, 'test', 'images'),
            'labels': os.path.join(output_root, 'test', 'labels')
        }
    }

    # Tạo các thư mục nếu chưa tồn tại
    for split in folders.values():
        os.makedirs(split['images'], exist_ok=True)
        os.makedirs(split['labels'], exist_ok=True)

    def process_file_list(list_path, target_dirs):
        if not os.path.exists(list_path):
            print(f"Cảnh báo: Không tìm thấy file danh sách {list_path}")
            return

        with open(list_path, 'r', encoding='utf-8') as f:
            # Đọc từng dòng, loại bỏ khoảng trắng và dòng trống
            filenames = [line.strip() for line in f if line.strip()]

        print(f"Đang xử lý {len(filenames)} file từ {list_path}...")
        
        count = 0
        for img_name in filenames:
            # --- Xử lý Ảnh ---
            src_img_path = os.path.join(src_img_dir, img_name)
            dst_img_path = os.path.join(target_dirs['images'], img_name)
            
            # --- Xử lý Nhãn (đổi đuôi thành .txt) ---
            label_name = os.path.splitext(img_name)[0] + '.txt'
            src_label_path = os.path.join(src_label_dir, label_name)
            dst_label_path = os.path.join(target_dirs['labels'], label_name)

            # Thực hiện di chuyển ảnh
            if os.path.exists(src_img_path):
                shutil.copy2(src_img_path, dst_img_path) # Dùng copy2 để giữ nguyên metadata
                img_ok = True
            else:
                print(f"  [!] Không tìm thấy ảnh: {img_name}")
                img_ok = False

            # Thực hiện di chuyển nhãn
            if os.path.exists(src_label_path):
                shutil.copy2(src_label_path, dst_label_path)
                label_ok = True
            else:
                label_ok = False

            if img_ok and label_ok:
                count += 1
        
        print(f"Done! Đã sao chép thành công {count} cặp file.")

    # 2. Chạy xử lý cho Train và Test
    process_file_list(train_list_file, folders['train'])
    process_file_list(test_list_file, folders['test'])

# --- CẤU HÌNH ĐƯỜNG DẪN CỦA BẠN ---
CONFIG = {
    'train_list': 'train_files.txt',
    'test_list': 'test_files.txt',
    'src_images': r"D:\classes\ket_qua_loc\images",    # Thư mục chứa toàn bộ ảnh gốc
    'src_labels': r"D:\classes\ket_qua_loc\labels",    # Thư mục chứa toàn bộ nhãn gốc
    'output_dir': r"D:\Study\NNLT-Python\BTCK\Traffic_Detection_Project\DATASET_MASTER_FINAL" # Thư mục kết quả
}

if __name__ == "__main__":
    move_dataset_files(
        CONFIG['train_list'],
        CONFIG['test_list'],
        CONFIG['src_images'],
        CONFIG['src_labels'],
        CONFIG['output_dir']
    )