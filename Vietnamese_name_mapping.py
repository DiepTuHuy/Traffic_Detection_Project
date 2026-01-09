def process_roboflow_classes(roboflow_file, classes_en_file, classes_vi_file, output_file):
    try:
        # 1. Đọc và tạo bản đồ ánh xạ từ classes.txt sang classes_vie.txt
        with open(classes_en_file, 'r', encoding='utf-8') as f_en, \
             open(classes_vi_file, 'r', encoding='utf-8') as f_vi:
            
            # Loại bỏ khoảng trắng thừa ở đầu/cuối mỗi dòng
            en_list = [line.strip() for line in f_en if line.strip()]
            vi_list = [line.strip() for line in f_vi if line.strip()]

        # Tạo dictionary ánh xạ Anh -> Việt
        translation_map = dict(zip(en_list, vi_list))

        # 2. Xử lý file roboflow_classes.txt
        final_results = []
        with open(roboflow_file, 'r', encoding='utf-8') as f_robo:
            for line in f_robo:
                class_name = line.strip()
                if not class_name:
                    continue
                
                # Kiểm tra xem class có tồn tại trong file gốc không
                if class_name in translation_map:
                    # Nếu có: Định dạng [tên tiếng Anh]: [tên tiếng Việt]
                    vietnamese_name = translation_map[class_name]
                    final_results.append(f"{class_name}: {vietnamese_name}")
                else:
                    # Nếu không: Giữ nguyên tên gốc
                    final_results.append(class_name)

        # 3. Xuất kết quả ra file
        with open(output_file, 'w', encoding='utf-8') as f_out:
            for line in final_results:
                f_out.write(f"{line}\n")

        print(f"--- Hoàn thành ---")
        print(f"Đã lưu kết quả tại: {output_file}")

    except Exception as e:
        print(f"Có lỗi xảy ra: {e}")

# Gọi hàm thực hiện
process_roboflow_classes(
    'class.txt', 
    'class.txt', 
    'class_vie.txt', 
    'roboflow_classes_vie.txt'
)