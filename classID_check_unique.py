import os

def identify_unique_class_ids(classes_file, report_file, output_file="id_phan_doc_lap.txt"):
    try:
        # 1. Đọc file classes.txt gốc để lấy ID (thứ tự dòng)
        # Chúng ta cần làm sạch tên class giống như các bước trước
        original_classes = []
        with open(classes_file, 'r', encoding='utf-8') as f:
            for line in f:
                clean_name = line.replace("[", "").replace("]", "") \
                                 .replace("'", "").replace('"', "") \
                                 .replace(",", "").strip()
                if clean_name:
                    original_classes.append(clean_name)

        # 2. Đọc file báo cáo so sánh để lấy danh sách các phần độc lập
        # Chúng ta sẽ tìm phần dưới tiêu đề: ❌ CHỈ CÓ TRONG FILE 'classes.txt'
        unique_names = []
        is_target_section = False
        
        if not os.path.exists(report_file):
            print(f"❌ Không tìm thấy file báo cáo: {report_file}")
            return

        with open(report_file, 'r', encoding='utf-8') as f:
            for line in f:
                # Kiểm tra nếu bắt đầu vào phần "Chỉ có trong file classes.txt"
                if f"CHỈ CÓ TRONG FILE '{classes_file}'" in line:
                    is_target_section = True
                    continue
                
                # Nếu đang ở trong phần mục tiêu và gặp tiêu đề mới thì dừng lại
                if is_target_section and line.startswith("❌ CHỈ CÓ TRONG FILE"):
                    break
                
                # Lấy tên class (dòng bắt đầu bằng dấu "- ")
                if is_target_section and line.strip().startswith("- "):
                    name = line.strip().replace("- ", "")
                    unique_names.append(name)

        # 3. Tra cứu ID và xuất kết quả
        results = []
        results.append(f"=== CLASS ID CỦA CÁC PHẦN ĐỘC LẬP TRONG {classes_file} ===\n")
        
        found_any = False
        for name in unique_names:
            if name in original_classes:
                # Lấy index (Class ID) của nó trong file gốc
                class_id = original_classes.index(name)
                res_line = f"ID {class_id}: {name}"
                results.append(res_line)
                print(f"Tìm thấy: {res_line}")
                found_any = True

        if not found_any:
            results.append("(Không tìm thấy phần độc lập nào khớp với file gốc)")

        # Ghi ra file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("\n".join(results))
            
        print(f"\n✅ Đã hoàn thành! Kết quả lưu tại: {output_file}")

    except Exception as e:
        print(f"❌ Có lỗi xảy ra: {e}")

# --- SỬ DỤNG ---
# Đảm bảo tên file khớp với các file bạn đã tạo ở các bước trước
identify_unique_class_ids("class.txt", "roboflow_classes.txt")