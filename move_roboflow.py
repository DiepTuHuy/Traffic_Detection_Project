import os
import shutil

def move_dataset_files(src_root, dst_root):
    # Cấu hình map tên thư mục: { 'tên_nguồn': 'tên_đích' }
    split_map = {
        'train': 'train',
        'test': 'test',
        'valid': 'val'  # Đổi valid thành val theo yêu cầu của bạn
    }

    # Các thư mục con bên trong mỗi split
    sub_folders = ['images', 'labels']

    print("--- Bắt đầu di chuyển dữ liệu ---")

    for src_split, dst_split in split_map.items():
        for folder_type in sub_folders:
            # Đường dẫn đầy đủ của nguồn và đích
            current_src_dir = os.path.join(src_root, src_split, folder_type)
            current_dst_dir = os.path.join(dst_root, dst_split, folder_type)

            # Kiểm tra xem thư mục nguồn có tồn tại không
            if not os.path.exists(current_src_dir):
                print(f"[Bỏ qua] Không tìm thấy: {current_src_dir}")
                continue

            # Tạo thư mục đích nếu chưa có
            os.makedirs(current_dst_dir, exist_ok=True)

            # Lấy danh sách file
            files = os.listdir(current_src_dir)
            if not files:
                print(f"[Trống] Thư mục {src_split}/{folder_type} không có file.")
                continue

            print(f"Đang di chuyển {len(files)} file từ {src_split}/{folder_type}...")

            for file_name in files:
                src_path = os.path.join(current_src_dir, file_name)
                dst_path = os.path.join(current_dst_dir, file_name)
                
                # Thực hiện di chuyển file
                try:
                    shutil.move(src_path, dst_path)
                except Exception as e:
                    print(f"Lỗi khi di chuyển {file_name}: {e}")

    print("--- Hoàn thành di chuyển! ---")

# --- CẤU HÌNH ĐƯỜNG DẪN TẠI ĐÂY ---
SOURCE_DIR = r"D:\Study\NNLT-Python\Dataset_con\Vietnam-Traffic-Sign-Detection.v6i.yolov12"  # Folder chứa train, test, valid gốc
DEST_DIR = r"D:\Study\NNLT-Python\BTCK\Traffic_Detection_Project\DATASET_MASTER_FINAL" # Folder đích muốn chuyển đến (đã chia sẵn train, test, val)

if __name__ == "__main__":
    # Lưu ý: Thay đổi đường dẫn thực tế của bạn trước khi chạy
    move_dataset_files(SOURCE_DIR, DEST_DIR)