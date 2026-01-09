import os

def compare_and_export(file_path1, file_path2, output_path="ket_qua_so_sanh.txt"):
    def get_content(path):
        """Đọc file và trả về danh sách các dòng đã làm sạch."""
        if not os.path.exists(path):
            return set()
        with open(path, 'r', encoding='utf-8') as f:
            # Loại bỏ khoảng trắng và ký tự xuống dòng
            return {line.strip() for line in f if line.strip()}

    # 1. Đọc nội dung 2 file
    set1 = get_content(file_path1)
    set2 = get_content(file_path2)

    if not set1 and not set2:
        print("Lỗi: Cả hai file đều rỗng hoặc không tìm thấy.")
        return

    # 2. Thực hiện so sánh
    common = sorted(list(set1.intersection(set2)))    # Giống nhau
    only_in_1 = sorted(list(set1 - set2))             # Chỉ có trong file 1
    only_in_2 = sorted(list(set2 - set1))             # Chỉ có trong file 2

    # 3. Ghi kết quả ra file .txt
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("=== BÁO CÁO SO SÁNH HAI FILE ===\n")
        f.write(f"File 1: {file_path1} ({len(set1)} dòng)\n")
        f.write(f"File 2: {file_path2} ({len(set2)} dòng)\n")
        f.write("="*30 + "\n\n")

        # Ghi phần giống nhau
        f.write(f"✅ PHẦN GIỐNG NHAU ({len(common)} dòng):\n")
        if common:
            for item in common:
                f.write(f"- {item}\n")
        else:
            f.write("(Không có dòng nào giống nhau)\n")

        # Ghi phần chỉ có ở file 1
        f.write(f"\n❌ CHỈ CÓ TRONG FILE '{file_path1}' ({len(only_in_1)} dòng):\n")
        if only_in_1:
            for item in only_in_1:
                f.write(f"- {item}\n")
        else:
            f.write("(Không có dòng nào khác biệt)\n")

        # Ghi phần chỉ có ở file 2
        f.write(f"\n❌ CHỈ CÓ TRONG FILE '{file_path2}' ({len(only_in_2)} dòng):\n")
        if only_in_2:
            for item in only_in_2:
                f.write(f"- {item}\n")
        else:
            f.write("(Không có dòng nào khác biệt)\n")

    print(f"--- ĐÃ XUẤT KẾT QUẢ RA FILE: {output_path} ---")

# --- SỬ DỤNG ---
# Thay tên 2 file đầu vào và tên file đầu ra của bạn ở đây
compare_and_export("class.txt", "roboflow_classes.txt", "bao_cao_so_sanh.txt")