# Hệ Thống Nhận Diện Biển Báo, Người Đi Bộ và Cảnh Báo Thông Minh Trong Giao Thông

Dự án này cung cấp hệ thống nhận diện biển báo sử dụng các mô hình YOLO (YOLOv8, YOLOv11, YOLOv12). Hệ thống được thiết kế để phát hiện biển báo theo thời gian thực, sau đó tự động phát âm thanh cảnh báo và hiển thị hình ảnh biển báo tham chiếu trực quan lên màn hình.

## 🗂 Cấu Trúc Repository

Repository này được chia thành 3 thư mục chính, phục vụ cho việc lưu trữ tài nguyên cảnh báo và quá trình huấn luyện mô hình:

* **`audio/`**: Lưu trữ các file âm thanh. Các file này chứa thông tin cảnh báo, được hệ thống gọi và phát ra khi phát hiện biển báo nguy hiểm tương ứng.
* **`references/`**: Chứa các hình ảnh chuẩn của biển báo. Khi mô hình nhận diện thành công một biển báo trên camera, hình ảnh mẫu từ thư mục này sẽ được trích xuất để hiển thị lên giao diện màn hình cho người dùng dễ quan sát.
* **`train/`**: Thư mục chứa toàn bộ dữ liệu về quá trình huấn luyện các phiên bản YOLO. Bao gồm 3 thư mục con:
  * `Yolo8n/`
  * `Yolo11n/`
  * `Yolo12m/`

### Chi tiết bên trong mỗi thư mục mô hình (`Yolo8n`, `Yolo11n`, `Yolo12m`):
Mỗi thư mục con này đều chứa 3 thành phần quan trọng sau:
1. **File trọng số:** Các file model đã được huấn luyện xong `best.pt`, sẵn sàng để tích hợp vào hệ thống nhận diện.
2. **Kết quả huấn luyện:** Các file `.csv` ghi nhận lại chỉ số đánh giá của mô hình qua từng vòng lặp (epoch) như độ chính xác (mAP, precision, recall) và hàm mất mát (loss).
3. **Mã nguồn huấn luyện:** Các file định dạng `.ipynb` chứa script chi tiết quá trình thiết lập, tải dữ liệu và huấn luyện mô hình.

## 📊 Dataset (Dữ liệu huấn luyện)

Dữ liệu hình ảnh và nhãn (labels) sử dụng để huấn luyện cho dự án được chia làm 3 bộ riêng biệt, tối ưu cho từng phiên bản mô hình YOLO. Bạn có thể tải trực tiếp dữ liệu thông qua các link Google Drive dưới đây:

* 🔗 **[Dataset dành cho mô hình YOLO12m](https://drive.google.com/file/d/1w96o2FKinrIKgN4tcoXGrbtahbLBW_sl/view?usp=drive_link)**
* 🔗 **[Dataset dành cho mô hình YOLO11n](https://drive.google.com/file/d/14y5CRRBv-hb1uV3ZN1TZDYRlTo4a-uTw/view?usp=drive_link)**
* 🔗 **[Dataset dành cho mô hình YOLO8n](https://drive.google.com/file/d/1o-YoYNe1gkA2GVFglH2fuG0TzdIE8bBG/view?usp=drive_link)**

*(Lưu ý: Sau khi tải các bộ dataset từ link trên về máy, hãy giải nén và đảm bảo cập nhật đúng đường dẫn thư mục dataset bên trong các file `.ipynb` tương ứng trước khi bạn muốn chạy lại quá trình huấn luyện).*
