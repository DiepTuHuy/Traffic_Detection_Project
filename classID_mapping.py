def generate_class_id_mapping(input_file, output_file="mapping_id_result.txt"):
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        mapping_results = []
        
        # Dùng enumerate với start=0 để tạo Class ID
        for index, line in enumerate(lines):
            # 1. Làm sạch dữ liệu (xóa ngoặc, nháy, phẩy, khoảng trắng)
            clean_name = line.replace("[", "").replace("]", "") \
                             .replace("'", "").replace('"', "") \
                             .replace(",", "").strip()
            
            # 2. Nếu dòng không rỗng, lưu lại theo định dạng ID: Tên
            if clean_name:
                result = f"{index}: {clean_name}"
                mapping_results.append(result)
                print(result) # In ra màn hình để xem nhanh
        
        # 3. Xuất ra file txt
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("\n".join(mapping_results))
            
        print(f"\n✅ Đã xuất bảng tra cứu ID vào file: {output_file}")

    except FileNotFoundError:
        print(f"❌ Không tìm thấy file: {input_file}")

# --- SỬ DỤNG ---
generate_class_id_mapping("roboflow_labels.txt")