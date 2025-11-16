from ultralytics import YOLO

DATA_YAML_PATH = "data.yaml"
MODEL_OLD_WEIGHTS = r"yolo11n.pt"

NUM_EPOCHS = 70
BATCH_SIZE = 16  # dataset lớn, batch tăng giúp ổn định hơn

def retrain_traffic_signs():
    model = YOLO(MODEL_OLD_WEIGHTS)

    results = model.train(
        data=DATA_YAML_PATH,
        epochs=NUM_EPOCHS,
        imgsz=640,
        batch=BATCH_SIZE,
        device=0,

        # ====== Cốt lõi ======
        resume=False,          # tuyệt đối không resume
        freeze=0,              # cho học toàn bộ backbone
        lr0=0.0008,            # backbone giữ, head 4 class học nhanh vừa đủ
        lrf=0.01,              # kết thúc giảm sâu LR

        # ====== Aug tối ưu cho biển báo ======
        mosaic=1.0,            # rất tốt cho biển báo vì ký tự nhỏ
        close_mosaic=50,       # tắt sau ~1/3 training
        mixup=0.1,
        hsv_h=0.02,
        hsv_s=0.7,
        hsv_v=0.4,
        scale=0.7,

        # Biển báo không nên xoay mạnh
        degrees=0.0,
        shear=0.0,
        perspective=0.0,

        fliplr=0.5,            # OK cho biển báo
        flipud=0.0,            # KHÔNG lật dọc (biển báo bị ngược)

        patience=50,
    )

if __name__ == "__main__":
    retrain_traffic_signs()
