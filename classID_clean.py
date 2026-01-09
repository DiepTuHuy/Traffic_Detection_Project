def clean_and_format_classes(file_path):
    try:
        # 1. Đọc toàn bộ nội dung file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 2. Xử lý logic
        # Thay thế các ký tự bao quanh (ngoặc vuông, dấu nháy) bằng rỗng
        chars_to_remove = "[]'\""
        for char in chars_to_remove:
            content = content.replace(char, "")
        
        # Thay thế dấu phẩy bằng dấu xuống dòng để tách các class
        # Sau đó tách nội dung thành danh sách các từ
        # Cách này xử lý được cả: "class1, class2" hoặc mỗi class 1 dòng
        raw_items = content.replace(",", "\n").split("\n")
        
        cleaned_lines = []
        for item in raw_items:
            clean_item = item.strip()
            # Chỉ thêm vào danh sách nếu item không rỗng
            if clean_item:
                cleaned_lines.append(clean_item)
        
        # 3. Ghi lại vào file, mỗi class chắc chắn nằm trên 1 dòng
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(cleaned_lines))
            
        print(f"✅ Đã xử lý xong: {file_path}")
        print(f"📝 Tổng cộng có {len(cleaned_lines)} class.")
        
    except FileNotFoundError:
        print(f"❌ Lỗi: Không tìm thấy file tại: {file_path}")

# --- SỬ DỤNG ---
clean_and_format_classes("roboflow_classes.txt")