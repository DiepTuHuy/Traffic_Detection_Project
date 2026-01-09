def split_roboflow_classes(input_file, output_en_file, output_vi_file):
    en_classes = []
    vi_classes = []

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                
                # Kiểm tra xem dòng có chứa dấu ": " hay không
                if ": " in line:
                    # Tách đôi tại dấu ": " đầu tiên tìm thấy
                    parts = line.split(": ", 1)
                    en_classes.append(parts[0])
                    vi_classes.append(parts[1])
                else:
                    # Nếu không có dấu ": " (trường hợp không khớp ở bước trước)
                    # Giữ nguyên tên gốc cho cả hai file hoặc xử lý tùy ý
                    en_classes.append(line)
                    vi_classes.append(line)

        # Ghi ra file class.txt (Tiếng Anh)
        with open(output_en_file, 'w', encoding='utf-8') as f_en:
            for item in en_classes:
                f_en.write(f"{item}\n")

        # Ghi ra file class_vie.txt (Tiếng Việt)
        with open(output_vi_file, 'w', encoding='utf-8') as f_vi:
            for item in vi_classes:
                f_vi.write(f"{item}\n")

        print("--- Hoàn thành tách file ---")
        print(f"Đã tạo: {output_en_file}")
        print(f"Đã tạo: {output_vi_file}")
        print(f"Tổng số dòng: {len(en_classes)}")

    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file {input_file}")
    except Exception as e:
        print(f"Đã xảy ra lỗi: {e}")

# Thực thi
split_roboflow_classes(
    'roboflow_classes_vie.txt', 
    'class.txt', 
    'class_vie.txt'
)