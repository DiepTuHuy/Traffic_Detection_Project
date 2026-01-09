def generate_class_mapping(old_classes_file, new_classes_file, output_file):
    try:
        # 1. Đọc file classes.txt (Old) và tạo dictionary {tên_class: index}
        old_mapping = {}
        with open(old_classes_file, 'r', encoding='utf-8') as f_old:
            for index, line in enumerate(f_old):
                class_name = line.strip()
                if class_name:
                    old_mapping[class_name] = index

        # 2. Đọc file class.txt (New) và so sánh
        results = []
        with open(new_classes_file, 'r', encoding='utf-8') as f_new:
            for new_index, line in enumerate(f_new):
                class_name = line.strip()
                if not class_name:
                    continue
                
                # Nếu class này cũng có trong file cũ
                if class_name in old_mapping:
                    old_index = old_mapping[class_name]
                    # Định dạng theo yêu cầu: [tên class] - old: [old ID] - new: [new ID]
                    results.append(f"{class_name} - old: {old_index} - new: {new_index}")

        # 3. Xuất ra file new_class.txt
        with open(output_file, 'w', encoding='utf-8') as f_out:
            for item in results:
                f_out.write(f"{item}\n")

        print(f"--- Hoàn thành tạo file mapping ---")
        print(f"Đã lưu kết quả vào: {output_file}")
        print(f"Tìm thấy {len(results)} class chung giữa hai file.")

    except FileNotFoundError as e:
        print(f"Lỗi: Không tìm thấy file. ({e})")
    except Exception as e:
        print(f"Đã xảy ra lỗi: {e}")

# Thực thi
generate_class_mapping(
    'classes.txt',       # File gốc (Old)
    'class.txt',         # File mới (New)
    'new_class.txt'      # File kết quả
)