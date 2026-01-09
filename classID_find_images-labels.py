import os
import shutil

# --- CẤU HÌNH ĐƯỜNG DẪN (Bạn hãy thay đổi cho đúng máy của mình) ---
label_dir = r"D:\Study\NNLT-Python\Dataset_con\Vietnam-Traffic-Sign-Detection.v5i.yolov12\train\labels"            # Thư mục chứa các file .txt nhãn
image_dir = r"D:\Study\NNLT-Python\Dataset_con\Vietnam-Traffic-Sign-Detection.v5i.yolov12\train\images"               # Thư mục chứa các file ảnh
id_file_path = "id_phan_doc_lap_roboflow.txt" # File chứa danh sách ID bạn vừa lọc ra
output_dir = "ket_qua_loc"        # Thư mục sẽ chứa ảnh và nhãn sau khi lọc

def get_list_ids_from_file(path):
    """Đọc file id_phan_doc_lap.txt và lấy danh sách ID (số nguyên)."""
    target_ids = set()
    if not os.path.exists(path):
        print(f"❌ Không tìm thấy file: {path}")
        return target_ids

    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            # Chỉ xử lý các dòng bắt đầu bằng 'ID '
            if line.strip().startswith("ID "):
                try:
                    # Tách 'ID 5: truck' -> lấy '5'
                    parts = line.split(':')
                    id_str = parts[0].replace("ID ", "").strip()
                    target_ids.add(int(id_str))
                except (ValueError, IndexError):
                    continue
    return target_ids

def run_filter():
    # 1. Lấy danh sách ID mục tiêu
    target_ids = get_list_ids_from_file(id_file_path)
    if not target_ids:
        print("⚠️ Không tìm thấy ID nào để lọc trong file báo cáo.")
        return

    print(f"🔍 Đang tìm kiếm các file chứa Class ID: {target_ids}...")

    # 2. Tạo thư mục chứa kết quả
    img_out = os.path.join(output_dir, "images")
    lbl_out = os.path.join(output_dir, "labels")
    os.makedirs(img_out, exist_ok=True)
    os.makedirs(lbl_out, exist_ok=True)

    # 3. Quét các file label
    count = 0
    list_labels = [f for f in os.listdir(label_dir) if f.endswith('.txt')]

    for filename in list_labels:
        file_path = os.path.join(label_dir, filename)
        is_matched = False

        # Đọc nội dung file label để kiểm tra ID
        with open(file_path, 'r') as f:
            for line in f:
                parts = line.split()
                if parts:
                    class_id = int(parts[0])
                    if class_id in target_ids:
                        is_matched = True
                        break # Chỉ cần chứa ít nhất 1 ID trong danh sách là lấy luôn ảnh đó
        
        # 4. Nếu khớp, tiến hành copy
        if is_matched:
            base_name = os.path.splitext(filename)[0]
            # Thử tìm ảnh với các đuôi phổ biến
            found_image = False
            for ext in ['.jpg', '.png', '.jpeg', '.JPG', '.PNG']:
                img_name = base_name + ext
                img_path = os.path.join(image_dir, img_name)
                
                if os.path.exists(img_path):
                    shutil.copy2(img_path, os.path.join(img_out, img_name))
                    shutil.copy2(file_path, os.path.join(lbl_out, filename))
                    found_image = True
                    count += 1
                    break
            
            if not found_image:
                print(f"⚠️ Đã thấy label {filename} nhưng thiếu file ảnh tương ứng.")

    print("-" * 30)
    print(f"✅ Xong! Đã lọc được {count} bộ ảnh & nhãn.")
    print(f"📂 Kết quả tại: {os.path.abspath(output_dir)}")

if __name__ == "__main__":
    run_filter()