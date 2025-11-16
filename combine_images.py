import os
import shutil

# --- 1. Cấu hình Đường dẫn ---
# Đường dẫn TỚI thư mục gốc chứa tất cả các thư mục con (ví dụ: part_4, class_0, part_3, ...)
SOURCE_ROOT_DIR = r'C:\Users\W11\Desktop\part_3\part_3\class_3' # THAY THẾ bằng đường dẫn chính xác của bạn

# Đường dẫn ĐẾN thư mục đích sẽ chứa TẤT CẢ ảnh
# Script sẽ tạo thư mục này nếu nó chưa tồn tại
DESTINATION_DIR = r'C:\Users\W11\Desktop\part_3\part_3\class_3\images' # THAY THẾ bằng đường dẫn bạn muốn

# --- 2. Tạo Thư mục Đích ---
if not os.path.exists(DESTINATION_DIR):
    os.makedirs(DESTINATION_DIR)
    print(f"Đã tạo thư mục đích: {DESTINATION_DIR}")
else:
    print(f"Thư mục đích đã tồn tại: {DESTINATION_DIR}")

# Biến đếm số lượng ảnh đã được sao chép
copied_count = 0

# --- 3. Duyệt và Sao chép Ảnh ---
print("Bắt đầu duyệt qua các thư mục và di chuyển ảnh...")

# os.walk() sẽ duyệt qua tất cả thư mục con và file trong SOURCE_ROOT_DIR
for root, dirs, files in os.walk(SOURCE_ROOT_DIR):
    # Loại trừ thư mục đích khỏi quá trình duyệt (để tránh sao chép lặp)
    if DESTINATION_DIR in root:
        continue
        
    for file in files:
        # Kiểm tra xem file có phải là ảnh không (bạn có thể thêm các định dạng khác như .jpeg, .webp,...)
        if file.lower().endswith(('.png', '.jpg')):
            source_file_path = os.path.join(root, file)
            
            # Tạo tên file mới để tránh trùng lặp:
            # Sử dụng thư mục cha và tên file gốc (ví dụ: part_4_class_0_image_01.jpg)
            # Hoặc chỉ đơn giản là thêm số đếm để đảm bảo duy nhất
            
            # Lấy tên file mới (đơn giản nhất là sử dụng tên file gốc)
            destination_file_name = file
            destination_file_path = os.path.join(DESTINATION_DIR, destination_file_name)
            
            # Nếu tên file đã tồn tại, thêm số đếm vào để đảm bảo tên duy nhất
            if os.path.exists(destination_file_path):
                base, ext = os.path.splitext(file)
                counter = 1
                new_file_name = f"{base}_{counter}{ext}"
                destination_file_path = os.path.join(DESTINATION_DIR, new_file_name)
                while os.path.exists(destination_file_path):
                    counter += 1
                    new_file_name = f"{base}_{counter}{ext}"
                    destination_file_path = os.path.join(DESTINATION_DIR, new_file_name)
            
            try:
                # Thực hiện sao chép file
                shutil.move(source_file_path, destination_file_path)
                copied_count += 1
                # print(f"Đã sao chép: {source_file_path} -> {destination_file_path}") # Bỏ comment nếu muốn xem chi tiết
            except Exception as e:
                print(f"LỖI sao chép file {source_file_path}: {e}")

# --- 4. Kết thúc ---
print("-" * 50)
print(f"✅ Hoàn tất! Đã sao chép tổng cộng {copied_count} file ảnh.")
print(f"Tất cả ảnh đã được gom vào thư mục: {DESTINATION_DIR}")