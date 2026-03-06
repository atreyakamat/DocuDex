import time
import requests
from io import BytesIO
from PIL import Image, ImageDraw

# Wait a moment for server to boot up
time.sleep(3)

# Check health
health_url = "http://localhost:8000/health"
print(f"Checking health at {health_url}...")
try:
    resp = requests.get(health_url)
    print("Health Status:", resp.json())
except Exception as e:
    print("Health check failed:", e)

# Create a dummy image
img = Image.new('RGB', (800, 600), color = (255, 255, 255))
d = ImageDraw.Draw(img)
# Draw some text that looks like a PAN card
d.text((10,10), "INCOME TAX DEPARTMENT", fill=(0,0,0))
d.text((10,50), "GOVT OF INDIA", fill=(0,0,0))
d.text((10,100), "Name: John Doe", fill=(0,0,0))
d.text((10,150), "DOB: 01/01/1990", fill=(0,0,0))
d.text((10,200), "ABCDE1234F", fill=(0,0,0))

img_byte_arr = BytesIO()
img.save(img_byte_arr, format='JPEG')
img_byte_arr.seek(0)

# Make multipart request
url = "http://localhost:8000/process"
files = {'file': ('dummy_pan.jpg', img_byte_arr, 'image/jpeg')}

print(f"\nSending dummy document to {url}...")
try:
    resp = requests.post(url, files=files)
    print(f"Status Code: {resp.status_code}")
    import json
    print("Response Body:")
    print(json.dumps(resp.json(), indent=2))
except Exception as e:
    print("Request failed:", e)
