import os
import json
from rauth import OAuth2Service
from datetime import datetime, timedelta


# Setup Constants
RESPONSE_FILE = 'response.json'
BASE_URL = 'https://sandbox-api.dexcom.com/'
# BASE_URL = 'https://api.dexcom.com/v3/'
CLIENT_ID = 'PE5GC1cwPwk7XKTJMTTMKe1L324UscTe'  # Replace with your actual Client ID
CLIENT_SECRET = 'sJTGDgGZ41t6AhBj'  # Replace with your actual Client Secret
PARAMS = {
    'scope': 'offline_access',
    'response_type': 'code',
    'redirect_uri': 'https://localhost:8080'
}

# Endpoint Map for Dexcom API v3
ENDPOINT_MAP = {
    "alerts": "v3/users/self/alerts",
    "calibrations": "v3/users/self/calibrations",
    "dataRange": "v3/users/self/dataRange",
    "devices": "v3/users/self/devices",
    "egvs": "v3/users/self/egvs",
    "events": "v3/users/self/events",
}

dexcom = OAuth2Service(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    name='dexcom',
    authorize_url=BASE_URL + 'oauth2/login',
    access_token_url=BASE_URL + 'oauth2/token',
    base_url=BASE_URL
)

# Function Definitions
def write_response(data):
    with open(RESPONSE_FILE, 'w') as outfile:
        json.dump(data, outfile)

def user_authorization():
    authorization_url = dexcom.get_authorize_url(**PARAMS)
    print('Visit this URL in your browser: ' + authorization_url)
    authorization_response = input('Enter the full callback URL: ')
    session = dexcom.get_auth_session(data={'code': re.search(r'\?code=([^&]*)', authorization_response).group(1),
                                            'grant_type': 'authorization_code',
                                            'redirect_uri': PARAMS['redirect_uri']},
                                      decoder=json.loads)
    write_response(session.access_token_response.json())
    return session

def read_existing_token():
    if not os.path.exists(RESPONSE_FILE):
        return user_authorization()

    with open(RESPONSE_FILE) as json_file:
        data = json.load(json_file)
    
    try:
        return dexcom.get_session(token=data['access_token'])
    except KeyError:
        return user_authorization()

def get_data(endpoint, start=None, end=None):
    session = read_existing_token()
    full_url = f"{BASE_URL}{ENDPOINT_MAP[endpoint]}"
    params = {"startDate": start, "endDate": end} if start and end else {}
    response = session.get(full_url, params=params)
    if response.status_code in [401, 403]:
        session = user_authorization()  # Reauthorize and retry
        response = session.get(full_url, params=params)
    return response.json()

def dexcom_api(endpoint="egvs"):
    # Calculate the end date as the current date and time
    end_date = datetime.now()
    # Set the start date to 14 days (2 weeks) before the end date
    start_date = end_date - timedelta(days=14)
    
    # Format dates as strings in ISO 8601 format
    end = end_date.strftime("%Y-%m-%dT%H:%M:%S")
    start = start_date.strftime("%Y-%m-%dT%H:%M:%S")
    
    # Fetch and return the data for the given endpoint and date range 
    return get_data(endpoint, start, end)

# Main Execution
if __name__ == '__main__':
    print(json.dumps(dexcom_api("egvs"), indent=4))
