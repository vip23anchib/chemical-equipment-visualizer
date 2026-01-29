import requests

url = "http://127.0.0.1:8000/api/upload/"

files = {
    "file": open("sample.csv", "rb")
}

response = requests.post(url, files=files)

print("Status code:", response.status_code)
print("Response JSON:", response.json())
