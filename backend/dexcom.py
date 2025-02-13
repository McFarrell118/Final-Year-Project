import json
from api import dexcom_api  # Ensure this is correctly imported
from datetime import datetime, timedelta

# Pretty Print JSON
def pp_json(json_data):
    return json.dumps(json_data, indent=4, sort_keys=True)

# Returns hour and minute timestamp
def get_timestamp():
    return datetime.datetime.now().strftime("%H:%M - ")

def main():
    print(get_timestamp() + "Starting Dexcom Application")
    # Call dexcom_api without explicit date parameters to fetch the last two weeks of data
    data = dexcom_api("egvs")  # "egvs" endpoint is for glucose readings, adjust as needed
    print(pp_json(data))

if __name__ == '__main__':
    main()
