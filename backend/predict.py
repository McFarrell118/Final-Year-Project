import tensorflow as tf
import numpy as np
import cv2
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from tensorflow.keras.applications.resnet50 import preprocess_input
import os

MODEL_PATH = 'C:/Users/micha/OneDrive/Desktop/MyFYP/backend/models/model.keras'
model = tf.keras.models.load_model(MODEL_PATH)

def apply_clahe(img):
    # Assuming img is a grayscale or RGB image
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    if img.ndim == 2:
        img = clahe.apply(img)
    elif img.ndim == 3:
        channels = cv2.split(img)
        eq_channels = [clahe.apply(ch) for ch in channels]
        img = cv2.merge(eq_channels)
    return img

def preprocess_image_for_model(image_path, target_size=(320, 320)):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = apply_clahe(img)
    img = cv2.GaussianBlur(img, (5, 5), 0)
    img = cv2.resize(img, target_size)
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

def predict_with_processing(image_path):
    img_array = preprocess_image_for_model(image_path)
    processed_image_path = image_path.replace("uploads", "processed")
    processed_dir = os.path.dirname(processed_image_path)
    if not os.path.exists(processed_dir):
        os.makedirs(processed_dir)
    cv2.imwrite(processed_image_path, (img_array[0] + 1) * 127.5)
    print(f"Processed image saved at: {processed_image_path}")
    
    predictions = model.predict(img_array)
    prediction = np.argmax(predictions[0])
    
    # Print prediction and class
    prediction_classes = ["No DR", "Mild", "Moderate", "Severe", "Proliferative DR"]
    prediction_text = prediction_classes[prediction]
    print(f"Prediction: {prediction}, Class: {prediction_text}")
    
    return prediction, os.path.basename(processed_image_path)

