import tensorflow as tf
from PIL import Image
import numpy as np
import torch
import torchvision.models as models
from ultralytics import YOLO
import cv2 as cv
from flask import Flask, jsonify, request, send_file
import io
import base64


app = Flask(__name__)


model_dict = torch.load('./ml-server/pt_model/yolov8_soldier_best_ep25.pt')
model = YOLO("./ml-server/pt_model/yolov8_soldier_best_ep25.pt")

#model.load_state_dict(model_dict)

'''
@app.route("/predict_image_dir/")
def predict_photo_dir():
    image = Image.open('./photoDir/photo.jpg')
    
    results = model(image)
    res_img = results[0].plot(pil = True)
    buffer = io.BytesIO()
    res_img.save(buffer, format="JPEG")
    buffer.seek(0)
    return send_file(buffer, mimetype="image/jpeg"), 200
'''

@app.route("/get_boxes/", methods=['POST'])
def get_boxes():
    img_rdata = request.data
    image_b64 = request.files.get('image', '')
    #image_bytes = base64.b64decode(image_b64)
    image = Image.open(image_b64.stream)
    results = model(image)
    return jsonify({'boxes': results[0].boxes.xyxy.tolist()}), 200

@app.route("/predict_img")
def predict_img():
    if 'image' not in request.files:
      return jsonify({"message": "no image or invalid image"}), 400
    image_file = request['image']
    image = Image.open(image_file.stream)
    
    results = model(image)
    res_img = results[0].plot(pil = True)
    buffer = io.BytesIO()
    res_img.save(buffer, format="JPEG")
    buffer.seek(0)
    return send_file(buffer, mimetype="image/jpeg"), 200

@app.route("/test")
def test():
    return jsonify({'message': 'test !!'}), 200


if __name__ == '__main__':
    app.run(port=1000)

'''
model = tf.saved_model.load('./saved_model')
image = Image.open('./known.jpg')
image_np = np.array(image)
img_tensor = tf.convert_to_tensor(image_np, dtype=tf.uint8)
img_tensor = tf.reshape(img_tensor, [1, 640, 360, 3])

prediction = model(img_tensor)
print(len(prediction))
predicted_classes = np.argmax(prediction, axis=0)
print(predicted_classes)

'''