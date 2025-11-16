import os
import shutil

# --- 1. Cấu hình Đường dẫn ---
# Đường dẫn TỚI thư mục gốc chứa tất cả các thư mục con (ví dụ: part_4, class_0, part_3, ...)
# Đây là nơi script sẽ bắt đầu tìm kiếm cả ảnh và file nhãn.
SOURCE_ROOT_DIR = r'C:\Users\W11\Desktop\part_3\part_3\class_0' # THAY THẾ bằng đường dẫn chính xác của bạn

# Đường dẫn ĐẾN thư mục gốc sẽ chứa các thư mục "images" và "labels" đã được gom
# Ví dụ: D:\Tệp Huy\combined_dataset
DESTINATION_ROOT_DIR = r'C:\Users\W11\Desktop\part3' # THAY THẾ bằng đường dẫn bạn muốn

# Tên thư mục con cho ảnh và nhãn bên trong DESTINATION_ROOT_DIR
IMAGES_DEST_DIR = os.path.join(DESTINATION_ROOT_DIR, 'images')
LABELS_DEST_DIR = os.path.join(DESTINATION_ROOT_DIR, 'labels')

# --- 2. Tạo Thư mục Đích ---
for path in [IMAGES_DEST_DIR, LABELS_DEST_DIR]:
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Đã tạo thư mục đích: {path}")
    else:
        print(f"Thư mục đích đã tồn tại: {path}")

# Biến đếm số lượng file đã được sao chép
copied_images_count = 0
copied_labels_count = 0
skipped_labels_count = 0 # Đếm các file nhãn không có ảnh tương ứng

# --- 3. Duyệt và Sao chép Ảnh & Nhãn ---
print("Bắt đầu duyệt qua các thư mục và sao chép ảnh & nhãn...")

# os.walk() sẽ duyệt qua tất cả thư mục con và file trong SOURCE_ROOT_DIR
for root, dirs, files in os.walk(SOURCE_ROOT_DIR):
    # Loại trừ thư mục đích khỏi quá trình duyệt (để tránh lỗi và sao chép lặp)
    if DESTINATION_ROOT_DIR in root:
        continue
        
    for file in files:
        base_name, ext = os.path.splitext(file)
        ext_lower = ext.lower()
        
        source_file_path = os.path.join(root, file)
        
        # --- Xử lý Ảnh ---
        if ext_lower in ('.png', '.jpg', '.jpeg'):
            destination_image_name = file
            destination_image_path = os.path.join(IMAGES_DEST_DIR, destination_image_name)
            
            # Xử lý tên file trùng lặp cho ảnh
            if os.path.exists(destination_image_path):
                counter = 1
                new_base_name = f"{base_name}_{counter}"
                destination_image_name = f"{new_base_name}{ext}"
                destination_image_path = os.path.join(IMAGES_DEST_DIR, destination_image_name)
                while os.path.exists(destination_image_path):
                    counter += 1
                    new_base_name = f"{base_name}_{counter}"
                    destination_image_name = f"{new_base_name}{ext}"
                    destination_image_path = os.path.join(IMAGES_DEST_DIR, destination_image_name)
            
            try:
                shutil.copy2(source_file_path, destination_image_path)
                copied_images_count += 1
                
                # --- SAO CHÉP NHÃN TƯƠNG ỨNG ---
                # Tìm file nhãn .txt có tên gốc tương ứng
                source_label_file_name = base_name + '.txt'
                source_label_path = os.path.join(root, source_label_file_name)
                
                # Tạo tên file nhãn mới phải khớp với tên ảnh mới
                destination_label_name = os.path.splitext(destination_image_name)[0] + '.txt'
                destination_label_path = os.path.join(LABELS_DEST_DIR, destination_label_name)

                if os.path.exists(source_label_path):
                    shutil.copy2(source_label_path, destination_label_path)
                    copied_labels_count += 1
                else:
                    # Rất quan trọng: Nếu không tìm thấy nhãn tương ứng, đây có thể là lỗi dữ liệu
                    print(f"CẢNH BÁO: Không tìm thấy file nhãn {source_label_file_name} cho ảnh {source_file_path}")
                    skipped_labels_count += 1
            except Exception as e:
                print(f"LỖI sao chép ảnh {source_file_path} hoặc nhãn tương ứng: {e}")

# --- 4. Kết thúc ---
print("-" * 50)
print(f"✅ Hoàn tất quá trình gom dữ liệu!")
print(f"  - Đã sao chép tổng cộng {copied_images_count} file ảnh.")
print(f"  - Đã sao chép tổng cộng {copied_labels_count} file nhãn (.txt).")
if skipped_labels_count > 0:
    print(f"  - Đã bỏ qua {skipped_labels_count} file nhãn vì không tìm thấy ảnh tương ứng.")
print(f"Tất cả ảnh đã được gom vào: {IMAGES_DEST_DIR}")
print(f"Tất cả nhãn đã được gom vào: {LABELS_DEST_DIR}")
print("\nKIỂM TRA LẠI: Đảm bảo số lượng ảnh và nhãn khớp nhau trong các thư mục đích.")