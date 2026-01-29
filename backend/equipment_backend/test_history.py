import requests

url = "http://127.0.0.1:8000/api/history/"

response = requests.get(url)

print("Status code:", response.status_code)
print("Number of records:", len(response.json()))

for i, record in enumerate(response.json(), start=1):
    print(f"\nRecord {i}:")
    for key, value in record.items():
        print(f"  {key}: {value}")
