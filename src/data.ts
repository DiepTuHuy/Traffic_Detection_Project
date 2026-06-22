import { RoadSign, RouteOption } from "./types";

export const VIETNAM_ROAD_SIGNS: RoadSign[] = [
  // === [0] Ben xe buyt ===
  {
    id: "BenXeBuyt",
    name: "Bến xe buýt",
    code: "I.434",
    category: "chi-dan",
    description: "Chỉ dẫn vị trí bến xe buýt dành cho xe buýt dừng đón, trả khách.",
    imageUrl: "",
    yoloLabel: "Ben xe buyt"
  },
  // === [1] Bien gop lan duong theo phuong tien ===
  {
    id: "BienGopLan",
    name: "Biển gộp làn đường theo phương tiện",
    code: "R.415",
    category: "hieu-lenh",
    description: "Chỉ dẫn các phương tiện đi theo làn đường được quy định riêng cho từng loại xe.",
    imageUrl: "",
    yoloLabel: "Bien gop lan duong theo phuong tien"
  },
  // === [2] Cac xe chi duoc re trai ===
  {
    id: "ChiReTrai",
    name: "Các xe chỉ được rẽ trái",
    code: "R.301e",
    category: "hieu-lenh",
    description: "Báo hiệu tất cả các xe chỉ được phép rẽ trái tại nút giao thông phía trước.",
    imageUrl: "",
    yoloLabel: "Cac xe chi duoc re trai"
  },
  // === [3] Cam di nguoc chieu ===
  {
    id: "P102",
    name: "Cấm đi ngược chiều",
    code: "P.102",
    category: "cam",
    description: "Cấm tất cả các loại xe (cơ giới và thô sơ) đi vào theo chiều đặt biển, trừ xe ưu tiên.",
    imageUrl: "",
    yoloLabel: "Cam di nguoc chieu"
  },
  // === [4] Cam di thang ===
  {
    id: "CamDiThang",
    name: "Cấm đi thẳng",
    code: "P.103a",
    category: "cam",
    description: "Cấm tất cả các loại xe đi thẳng qua nút giao phía trước. Phải rẽ trái hoặc rẽ phải.",
    imageUrl: "",
    yoloLabel: "Cam di thang"
  },
  // === [5] Cam di thang va re phai ===
  {
    id: "CamDiThangRePhai",
    name: "Cấm đi thẳng và rẽ phải",
    code: "P.103c",
    category: "cam",
    description: "Cấm xe đi thẳng và rẽ phải. Chỉ được phép rẽ trái tại nút giao này.",
    imageUrl: "",
    yoloLabel: "Cam di thang va re phai"
  },
  // === [6] Cam do xe ===
  {
    id: "CamDoXe",
    name: "Cấm đỗ xe",
    code: "P.131a",
    category: "cam",
    description: "Cấm các loại xe đỗ (dừng lâu) ở phía đường có đặt biển.",
    imageUrl: "",
    yoloLabel: "Cam do xe"
  },
  // === [7] Cam dung va do xe ===
  {
    id: "P130",
    name: "Cấm dừng xe và đỗ xe",
    code: "P.130",
    category: "cam",
    description: "Cấm các loại xe cơ giới dừng và đỗ ở phía đường có đặt biển.",
    imageUrl: "",
    yoloLabel: "Cam dung va do xe"
  },
  // === [8] Cam oto ===
  {
    id: "CamOto",
    name: "Cấm ô tô",
    code: "P.103",
    category: "cam",
    description: "Cấm tất cả các loại ô tô đi vào đoạn đường có đặt biển này.",
    imageUrl: "",
    yoloLabel: "Cam oto"
  },
  // === [9] Cam oto khach va oto tai ===
  {
    id: "CamOtoKhachTai",
    name: "Cấm ô tô khách và ô tô tải",
    code: "P.106b",
    category: "cam",
    description: "Cấm ô tô khách và ô tô tải đi vào đoạn đường có đặt biển.",
    imageUrl: "",
    yoloLabel: "Cam oto khach va oto tai"
  },
  // === [10] Cam oto re phai ===
  {
    id: "CamOtoRePhai",
    name: "Cấm ô tô rẽ phải",
    code: "P.103d",
    category: "cam",
    description: "Cấm ô tô rẽ phải tại ngã ba, ngã tư phía trước.",
    imageUrl: "",
    yoloLabel: "Cam oto re phai"
  },
  // === [11] Cam oto re trai ===
  {
    id: "CamOtoReTrai",
    name: "Cấm ô tô rẽ trái",
    code: "P.103e",
    category: "cam",
    description: "Cấm ô tô rẽ trái tại ngã ba, ngã tư phía trước.",
    imageUrl: "",
    yoloLabel: "Cam oto re trai"
  },
  // === [12] Cam oto va xe may ===
  {
    id: "CamOtoXeMay",
    name: "Cấm ô tô và xe máy",
    code: "P.106a",
    category: "cam",
    description: "Cấm ô tô và xe gắn máy đi vào đoạn đường có đặt biển.",
    imageUrl: "",
    yoloLabel: "Cam oto va xe may"
  },
  // === [13] Cam quay dau ===
  {
    id: "CamQuayDau",
    name: "Cấm quay đầu xe",
    code: "P.124",
    category: "cam",
    description: "Cấm tất cả các loại xe quay đầu xe trên đoạn đường có đặt biển.",
    imageUrl: "",
    yoloLabel: "Cam quay dau"
  },
  // === [14] Cam re phai ===
  {
    id: "CamRePhai",
    name: "Cấm rẽ phải",
    code: "P.103b",
    category: "cam",
    description: "Cấm tất cả các loại xe rẽ phải tại nút giao thông phía trước.",
    imageUrl: "",
    yoloLabel: "Cam re phai"
  },
  // === [15] Cam re phai va quay dau ===
  {
    id: "CamRePhaiQuayDau",
    name: "Cấm rẽ phải và quay đầu",
    code: "P.103g",
    category: "cam",
    description: "Cấm các xe rẽ phải và quay đầu xe tại nút giao phía trước.",
    imageUrl: "",
    yoloLabel: "Cam re phai va quay dau"
  },
  // === [16] Cam re trai ===
  {
    id: "CamReTrai",
    name: "Cấm rẽ trái",
    code: "P.103c",
    category: "cam",
    description: "Cấm tất cả các loại xe rẽ trái tại nút giao phía trước.",
    imageUrl: "",
    yoloLabel: "Cam re trai"
  },
  // === [17] Cam re trai va phai ===
  {
    id: "CamReTraiPhai",
    name: "Cấm rẽ trái và rẽ phải",
    code: "P.103d",
    category: "cam",
    description: "Cấm các loại xe rẽ trái và rẽ phải. Chỉ được phép đi thẳng.",
    imageUrl: "",
    yoloLabel: "Cam re trai va phai"
  },
  // === [18] Cam re trai va quay dau ===
  {
    id: "CamReTraiQuayDau",
    name: "Cấm rẽ trái và quay đầu",
    code: "P.103f",
    category: "cam",
    description: "Cấm các xe rẽ trái và quay đầu xe tại nút giao phía trước.",
    imageUrl: "",
    yoloLabel: "Cam re trai va quay dau"
  },
  // === [19] Cam xe 2 va 3 banh ===
  {
    id: "CamXe2Va3Banh",
    name: "Cấm xe 2 và 3 bánh",
    code: "P.111",
    category: "cam",
    description: "Cấm xe mô tô 2 bánh và xe gắn máy 3 bánh đi vào đoạn đường có đặt biển.",
    imageUrl: "",
    yoloLabel: "Cam xe 2 va 3 banh"
  },
  // === [20] Cam xe so-mi ro-mooc ===
  {
    id: "CamXeSoMiRoMooc",
    name: "Cấm xe sơ mi rơ moóc",
    code: "P.107",
    category: "cam",
    description: "Cấm xe ô tô đầu kéo sơ mi rơ moóc đi vào đoạn đường này.",
    imageUrl: "",
    yoloLabel: "Cam xe so-mi ro-mooc"
  },
  // === [21] Cam xe tai ===
  {
    id: "CamXeTai",
    name: "Cấm xe tải",
    code: "P.106",
    category: "cam",
    description: "Cấm tất cả ô tô tải đi vào đoạn đường có đặt biển.",
    imageUrl: "",
    yoloLabel: "Cam xe tai"
  },
  // === [22] Chi danh cho xe tai ===
  {
    id: "ChiDanhXeTai",
    name: "Chỉ dành cho xe tải",
    code: "R.305",
    category: "hieu-lenh",
    description: "Làn đường hoặc đoạn đường chỉ dành riêng cho xe tải lưu thông.",
    imageUrl: "",
    yoloLabel: "Chi danh cho xe tai"
  },
  // === [23] Cho ngoat nguy hiem vong ben phai ===
  {
    id: "ChoNgoatPhai",
    name: "Chỗ ngoặt nguy hiểm vòng bên phải",
    code: "W.201b",
    category: "nguy-hiem",
    description: "Báo trước phía trước có chỗ ngoặt nguy hiểm vòng bên phải. Cần giảm tốc độ.",
    imageUrl: "",
    yoloLabel: "Cho ngoat nguy hiem vong ben phai"
  },
  // === [24] Cho ngoat nguy hiem vong ben trai ===
  {
    id: "ChoNgoatTrai",
    name: "Chỗ ngoặt nguy hiểm vòng bên trái",
    code: "W.201a",
    category: "nguy-hiem",
    description: "Báo trước phía trước có chỗ ngoặt nguy hiểm vòng bên trái. Cần giảm tốc độ.",
    imageUrl: "",
    yoloLabel: "Cho ngoat nguy hiem vong ben trai"
  },
  // === [25] Cho quay xe ===
  {
    id: "ChoQuayXe",
    name: "Chỗ quay xe",
    code: "I.404",
    category: "chi-dan",
    description: "Chỉ dẫn nơi được phép quay đầu xe trên đường.",
    imageUrl: "",
    yoloLabel: "Cho quay xe"
  },
  // === [26] Chu y chuong ngai vat - vong sang ben phai ===
  {
    id: "ChuYChuongNgai",
    name: "Chú ý chướng ngại vật - vòng sang bên phải",
    code: "W.221b",
    category: "nguy-hiem",
    description: "Báo trước có chướng ngại vật trên đường phía trước, các xe phải đi vòng sang bên phải.",
    imageUrl: "",
    yoloLabel: "Chu y chuong ngai vat - vong sang ben phai"
  },
  // === [27] Chuong ngai vat phia truoc ===
  {
    id: "ChuongNgaiVat",
    name: "Chướng ngại vật phía trước",
    code: "W.221a",
    category: "nguy-hiem",
    description: "Báo trước đường phía trước có chướng ngại vật nguy hiểm. Cần giảm tốc và chú ý quan sát.",
    imageUrl: "",
    yoloLabel: "Chuong ngai vat phia truoc"
  },
  // === [28] Di cham ===
  {
    id: "DiCham",
    name: "Đi chậm",
    code: "W.245",
    category: "nguy-hiem",
    description: "Báo hiệu đoạn đường cần giảm tốc độ, di chuyển chậm và quan sát kỹ.",
    imageUrl: "",
    yoloLabel: "Di cham"
  },
  // === [29] Duong 1 chieu ===
  {
    id: "Duong1Chieu",
    name: "Đường 1 chiều",
    code: "I.407a",
    category: "chi-dan",
    description: "Chỉ dẫn đường chỉ cho phép đi theo một chiều.",
    imageUrl: "",
    yoloLabel: "Duong 1 chieu"
  },
  // === [30] Duong nguoi di bo cat ngang ===
  {
    id: "NguoiDiBoCatNgang",
    name: "Đường người đi bộ cắt ngang",
    code: "W.224",
    category: "nguy-hiem",
    description: "Báo trước sắp đến đoạn đường có người đi bộ cắt ngang. Phải nhường đường.",
    imageUrl: "",
    yoloLabel: "Duong nguoi di bo cat ngang"
  },
  // === [31] Duong nguoi di bo sang ngang ===
  {
    id: "NguoiDiBoSangNgang",
    name: "Đường người đi bộ sang ngang",
    code: "I.423a",
    category: "chi-dan",
    description: "Chỉ dẫn cho người đi bộ và lái xe biết vị trí dành cho người đi bộ qua đường.",
    imageUrl: "",
    yoloLabel: "Duong nguoi di bo sang ngang"
  },
  // === [32] Giao nhau voi duong khong uu tien ===
  {
    id: "GiaoNhauKhongUuTien",
    name: "Giao nhau với đường không ưu tiên",
    code: "W.207",
    category: "nguy-hiem",
    description: "Báo trước có giao lộ với đường không ưu tiên. Cần chú ý quan sát.",
    imageUrl: "",
    yoloLabel: "Giao nhau voi duong khong uu tien"
  },
  // === [33] Giao nhau voi duong sat co rao chan ===
  {
    id: "GiaoNhauDuongSat",
    name: "Giao nhau với đường sắt có rào chắn",
    code: "W.211a",
    category: "nguy-hiem",
    description: "Báo trước phía trước có nơi giao nhau giữa đường bộ với đường sắt có rào chắn.",
    imageUrl: "",
    yoloLabel: "Giao nhau voi duong sat co rao chan"
  },
  // === [34] Gioi han chieu cao ===
  {
    id: "GioiHanChieuCao",
    name: "Giới hạn chiều cao",
    code: "P.127",
    category: "cam",
    description: "Cấm các phương tiện có chiều cao vượt quá giới hạn ghi trên biển đi vào.",
    imageUrl: "",
    yoloLabel: "Gioi han chieu cao"
  },
  // === [35] Gioi han toc do 40km-h ===
  {
    id: "P127_40",
    name: "Giới hạn tốc độ tối đa 40 km/h",
    code: "P.127 (40)",
    category: "cam",
    description: "Cấm các phương tiện di chuyển vượt quá tốc độ 40 km/h.",
    imageUrl: "",
    speedLimit: 40,
    yoloLabel: "Gioi han toc do 40km-h"
  },
  // === [36] Gioi han toc do 50km-h ===
  {
    id: "P127_50",
    name: "Giới hạn tốc độ tối đa 50 km/h",
    code: "P.127 (50)",
    category: "cam",
    description: "Cấm các phương tiện di chuyển vượt quá tốc độ 50 km/h. Thường gặp ở đường trong khu dân cư.",
    imageUrl: "",
    speedLimit: 50,
    yoloLabel: "Gioi han toc do 50km-h"
  },
  // === [37] Gioi han toc do 60km-h ===
  {
    id: "P127_60",
    name: "Giới hạn tốc độ tối đa 60 km/h",
    code: "P.127 (60)",
    category: "cam",
    description: "Cấm các phương tiện di chuyển vượt quá tốc độ 60 km/h.",
    imageUrl: "",
    speedLimit: 60,
    yoloLabel: "Gioi han toc do 60km-h"
  },
  // === [38] Gioi han toc do 80km-h ===
  {
    id: "P127_80",
    name: "Giới hạn tốc độ tối đa 80 km/h",
    code: "P.127 (80)",
    category: "cam",
    description: "Cấm các phương tiện di chuyển vượt quá tốc độ 80 km/h. Thường đặt trên quốc lộ hoặc cao tốc.",
    imageUrl: "",
    speedLimit: 80,
    yoloLabel: "Gioi han toc do 80km-h"
  },
  // === [39] Go giam toc phia truoc ===
  {
    id: "GoGiamToc",
    name: "Gờ giảm tốc phía trước",
    code: "W.222",
    category: "nguy-hiem",
    description: "Báo trước phía trước có gờ giảm tốc. Cần giảm tốc độ khi di chuyển qua.",
    imageUrl: "",
    yoloLabel: "Go giam toc phia truoc"
  },
  // === [40] Het gioi han toc do 60km-h ===
  {
    id: "HetGioiHan60",
    name: "Hết giới hạn tốc độ 60 km/h",
    code: "P.134 (60)",
    category: "cam",
    description: "Hết đoạn đường giới hạn tốc độ tối đa 60 km/h. Được phép tăng tốc theo quy định chung.",
    imageUrl: "",
    yoloLabel: "Het gioi han toc do 60km-h"
  },
  // === [41] Kiem tra ===
  {
    id: "KiemTra",
    name: "Kiểm tra",
    code: "I.434b",
    category: "chi-dan",
    description: "Phía trước có trạm kiểm tra, kiểm soát. Các phương tiện phải giảm tốc độ và dừng khi có hiệu lệnh.",
    imageUrl: "",
    yoloLabel: "Kiem tra"
  },
  // === [42] Nguoi Di Bo ===
  {
    id: "NguoiDiBo",
    name: "Người đi bộ",
    code: "W.224b",
    category: "nguy-hiem",
    description: "Cảnh báo khu vực có nhiều người đi bộ. Cần giảm tốc và quan sát.",
    imageUrl: "",
    yoloLabel: "Nguoi Di Bo"
  },
  // === [43] Phai di vong sang ben phai ===
  {
    id: "PhaiDiVongPhai",
    name: "Phải đi vòng sang bên phải",
    code: "R.302a",
    category: "hieu-lenh",
    description: "Các phương tiện phải di chuyển vòng sang hướng bên phải để tránh chướng ngại vật.",
    imageUrl: "",
    yoloLabel: "Phai di vong sang ben phai"
  },
  // === [44] Ra khoi khu dan cu ===
  {
    id: "RaKhoiKhuDanCu",
    name: "Ra khỏi khu dân cư",
    code: "I.438",
    category: "chi-dan",
    description: "Báo hiệu hết khu vực dân cư. Các phương tiện có thể tăng tốc theo quy định đường ngoài đô thị.",
    imageUrl: "",
    yoloLabel: "Ra khoi khu dan cu"
  }
];

// Bảng tra nhanh theo yoloLabel
export const YOLO_LABEL_MAP: Record<string, RoadSign> = {};
VIETNAM_ROAD_SIGNS.forEach((sign) => {
  if (sign.yoloLabel) {
    YOLO_LABEL_MAP[sign.yoloLabel] = sign;
  }
});

export const SIMULATED_ROUTES: RouteOption[] = [
  {
    id: "route-hanoi",
    name: "Trực tuyến: Đại lộ Thăng Long (Hà Nội)",
    description: "Tuyến đường cao tốc hướng vào trung tâm thủ đô Hà Nội. Có kiểm soát tốc độ nghiêm ngặt và nhiều biển hiệu chỉ dẫn.",
    weather: "Trời khô ráo, mây nhẹ",
    timeOfDay: "Ban ngày (09:30 AM)",
    scenarios: [
      {
        timestamp: 5,
        sign: VIETNAM_ROAD_SIGNS[38], // Gioi han toc do 80km-h
        distance: 120,
        violationCheck: true
      },
      {
        timestamp: 18,
        sign: VIETNAM_ROAD_SIGNS[32], // Giao nhau voi duong khong uu tien
        distance: 90
      },
      {
        timestamp: 32,
        sign: VIETNAM_ROAD_SIGNS[37], // Gioi han toc do 60km-h
        distance: 150,
        violationCheck: true
      },
      {
        timestamp: 48,
        sign: VIETNAM_ROAD_SIGNS[29], // Duong 1 chieu
        distance: 60
      },
      {
        timestamp: 60,
        sign: VIETNAM_ROAD_SIGNS[7], // Cam dung va do xe
        distance: 85
      }
    ]
  },
  {
    id: "route-hcm",
    name: "Nội đô: Quận Đống Đa - Ba Đình",
    description: "Mật độ giao thông cao, nhiều nút giao ngã tư phức tạp, có biển cấm ngược chiều và vạch kẻ ưu tiên cho người đi bộ.",
    weather: "Mưa rào nhẹ, tầm nhìn giảm",
    timeOfDay: "Chập tối (18:15 PM)",
    scenarios: [
      {
        timestamp: 6,
        sign: VIETNAM_ROAD_SIGNS[37], // Gioi han toc do 60km-h
        distance: 80,
        violationCheck: true
      },
      {
        timestamp: 15,
        sign: VIETNAM_ROAD_SIGNS[3], // Cam di nguoc chieu
        distance: 70
      },
      {
        timestamp: 28,
        sign: VIETNAM_ROAD_SIGNS[30], // Duong nguoi di bo cat ngang
        distance: 45
      },
      {
        timestamp: 40,
        sign: VIETNAM_ROAD_SIGNS[43], // Phai di vong sang ben phai
        distance: 55
      },
      {
        timestamp: 55,
        sign: VIETNAM_ROAD_SIGNS[31], // Duong nguoi di bo sang ngang
        distance: 40
      }
    ]
  },
  {
    id: "route-highway",
    name: "Cao tốc: TP.HCM - Long Thành - Dầu Giây",
    description: "Tốc độ hành trình cao, mật độ trung bình. Đòi hỏi phát hiện biển báo từ xa và phản ứng phanh giảm tốc cực nhanh.",
    weather: "Sương mù nhẹ rải rác",
    timeOfDay: "Ban đêm (23:45 PM)",
    scenarios: [
      {
        timestamp: 8,
        sign: VIETNAM_ROAD_SIGNS[38], // Gioi han toc do 80km-h
        distance: 200,
        violationCheck: true
      },
      {
        timestamp: 22,
        sign: VIETNAM_ROAD_SIGNS[7], // Cam dung va do xe
        distance: 140
      },
      {
        timestamp: 38,
        sign: VIETNAM_ROAD_SIGNS[37], // Gioi han toc do 60km-h
        distance: 180,
        violationCheck: true
      },
      {
        timestamp: 52,
        sign: VIETNAM_ROAD_SIGNS[32], // Giao nhau voi duong khong uu tien
        distance: 110
      }
    ]
  }
];

