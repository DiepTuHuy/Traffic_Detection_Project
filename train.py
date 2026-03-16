from ultralytics import YOLO

DATA_YAML_PATH = "data.yaml"
MODEL_OLD_WEIGHTS = r"yolo11n.pt"

NUM_EPOCHS = 70
BATCH_SIZE = 16 

def retrain_traffic_signs():
    model = YOLO(MODEL_OLD_WEIGHTS)

    results = model.train(
        data=DATA_YAML_PATH,
        epochs=NUM_EPOCHS,
        imgsz=640,
        batch=BATCH_SIZE,
        device=0,

        resume=False,          
        freeze=0,              
        lr0=0.0008,            
        lrf=0.01,              

        mosaic=1.0,            
        close_mosaic=50,      
        mixup=0.1,
        hsv_h=0.02,
        hsv_s=0.7,
        hsv_v=0.4,
        scale=0.7,

        degrees=0.0,
        shear=0.0,
        perspective=0.0,

        fliplr=0.5,           
        flipud=0.0,        

        patience=50,
    )

if __name__ == "__main__":
    retrain_traffic_signs()
