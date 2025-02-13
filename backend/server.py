from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
from datetime import datetime, timedelta
from predict import predict_with_processing  

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Dexcom API credentials
CLIENT_ID = 'PE5GC1cwPwk7XKTJMTTMKe1L324UscTe'
CLIENT_SECRET = 'sJTGDgGZ41t6AhBj'
TOKEN_URL = 'https://sandbox-api.dexcom.com/v2/oauth2/token'

UPLOAD_FOLDER = 'static/uploads'
PROCESSED_FOLDER = 'static/processed'  # New

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(PROCESSED_FOLDER):  # Ensure the processed folder exists
    os.makedirs(PROCESSED_FOLDER)
    

    
def refresh_access_token(refresh_token):
    response = requests.post(TOKEN_URL, data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    })
    if response.status_code == 200:
        new_tokens = response.json()
        access_token = new_tokens["access_token"]
        refresh_token = new_tokens.get("refresh_token", refresh_token)
        with open('response.json', 'w') as token_file:
            json.dump(new_tokens, token_file)
        return access_token, refresh_token
    else:
        print(f"Failed to refresh token: {response.status_code}, {response.text}")
        return None, None

def get_saved_tokens():
    try:
        with open('response.json', 'r') as token_file:
            tokens = json.load(token_file)
            return tokens['access_token'], tokens['refresh_token']
    except (FileNotFoundError, KeyError):
        print("Token file not found or invalid format.")
        return None, None

def dexcomAPI(endpoint, start=None, end=None):
    access_token, refresh_token = get_saved_tokens()
    if not access_token or not refresh_token:
        return {"error": "Authentication required"}, 401

    headers = {'Authorization': f'Bearer {access_token}'}
    params = {}
    if start and end:
        params = {'startDate': start, 'endDate': end}

    dexcom_response = requests.get(f'https://sandbox-api.dexcom.com/v3/users/self/{endpoint}',
                                   headers=headers, params=params)

    if dexcom_response.status_code == 401:
        access_token, refresh_token = refresh_access_token(refresh_token)
        if access_token and refresh_token:
            headers = {'Authorization': f'Bearer {access_token}'}
            dexcom_response = requests.get(f'https://sandbox-api.dexcom.com/v3/users/self/{endpoint}',
                                           headers=headers, params=params)

    if dexcom_response.status_code == 200:
        return dexcom_response.json(), 200
    else:
        return {"error": "Failed to retrieve data from Dexcom"}, dexcom_response.status_code

@app.route('/api/egvs', methods=['GET'])
def api_egvs():
    # Calculate start and end dates to fetch data from the last 2 weeks
    end_date = datetime.now()
    start_date = end_date - timedelta(days=14)  # 2 weeks earlier

    # Format dates as strings in the required format
    end = end_date.strftime("%Y-%m-%dT%H:%M:%S")
    start = start_date.strftime("%Y-%m-%dT%H:%M:%S")

    data, status = dexcomAPI("egvs", start, end)
    return jsonify(data), status



@app.route('/predict', methods=['POST'])
def handle_predict():
    if 'retinaImage' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['retinaImage']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        # Save the original image in the uploads folder
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        
        # Call the prediction function which now also processes the image
        prediction, processed_filename = predict_with_processing(filepath)
        
        # Mapping the prediction to its textual representation
        results = ["No DR", "Mild", "Moderate", "Severe", "Proliferative DR"]
        prediction_text = results[prediction]
        
        # Constructing the path for the processed image to return it
        processed_image_path = os.path.join(PROCESSED_FOLDER, processed_filename)
        processed_image_url = '/static/processed/' + processed_filename  # Adjust as per your static URL configuration
        
        return jsonify({'prediction': prediction_text, 'processedImageUrl': processed_image_url})


# Keep your existing endpoints and functions

if __name__ == '__main__':
    app.run(debug=True)