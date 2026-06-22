from ultralytics import YOLO
model = YOLO(r"train\Yolo12m\best.pt")
print("Number of classes:", len(model.names))
for idx, name in model.names.items():
    print(f"  [{idx}] {name}")
