from ultralytics import YOLO

if __name__ == "__main__":
    # load model đã train xong
    model = YOLO("runs/detect/train4-88%/weights/best.pt")

    # chạy đánh giá lại trên tập validation
    metrics = model.val()

    print(metrics)
