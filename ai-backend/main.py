from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import cv2
import numpy as np
from ultralytics import YOLO

app = FastAPI()

model = YOLO("yolov8n.pt")  # auto-downloads

class FrameInput(BaseModel):
    frameDataUri: str

@app.post("/analyze")
def analyze(frame: FrameInput):
    # 1️⃣ Validate Data URI
    if "," not in frame.frameDataUri:
        raise HTTPException(status_code=400, detail="Invalid data URI")

    header, encoded = frame.frameDataUri.split(",", 1)

    # 2️⃣ Handle empty frames (VERY IMPORTANT)
    if not encoded.strip():
        return {
            "crowdCount": 0,
            "peoplePositions": [],
            "newAlerts": []
        }

    # 3️⃣ Decode Base64 safely
    try:
        img_bytes = base64.b64decode(encoded)
    except Exception:
        raise HTTPException(status_code=400, detail="Base64 decode failed")

    # 4️⃣ Convert to OpenCV image
    np_img = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        return {
            "crowdCount": 0,
            "peoplePositions": [],
            "newAlerts": []
        }

    # 5️⃣ Run YOLO
    results = model(img)[0]

    people = []
    for box in results.boxes:
        if int(box.cls) == 0:  # person class
            x1, y1, x2, y2 = box.xyxy[0]
            people.append({
                "x": float((x1 + x2) / 2 / img.shape[1]),
                "y": float((y1 + y2) / 2 / img.shape[0]),
            })

    return {
        "crowdCount": len(people),
        "peoplePositions": people,
        "newAlerts": []
    }
