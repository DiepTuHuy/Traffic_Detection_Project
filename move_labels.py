import os
import shutil

# 🔧 ĐƯỜNG DẪN — bạn chỉnh lại 3 dòng này cho đúng
temp_images = r"D:\Study\NNLT-Python\BTCK\Traffic_Detection_Project\test\images"     # ảnh đã move
temp_labels = r"D:\Study\NNLT-Python\BTCK\Traffic_Detection_Project\test\labels"     # nơi sẽ move label vào
original_labels = r"D:\Study\NNLT-Python\BTCK\Traffic_Detection_Project\temp_train\labels" # folder label gốc

# Tạo thư mục labels tạm nếu chưa có
os.makedirs(temp_labels, exist_ok=True)

moved = 0
missing = 0

for img_file in os.listdir(temp_images):
    if not img_file.lower().endswith((".jpg", ".jpeg", ".png")):
        continue

    base = os.path.splitext(img_file)[0]
    label_name = base + ".txt"

    src_label = os.path.join(original_labels, label_name)
    dst_label = os.path.join(temp_labels, label_name)

    if os.path.exists(src_label):
        shutil.move(src_label, dst_label)
        moved += 1
    else:
        print(f"⚠️ Không tìm thấy label cho ảnh: {img_file}")
        missing += 1

print(f"\n✅ Xong!")
print(f"Đã di chuyển {moved} label.")
print(f"Còn thiếu {missing} label (không tìm thấy).")
