import urllib.request
import re

url = "https://scrunchcreate.vercel.app/"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    matches = re.findall(r'src="(/assets/index-.*?\.js)"', html)
    if matches:
        js_url = "https://scrunchcreate.vercel.app" + matches[0]
        print(f"Fetching JS from {js_url}")
        req2 = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
        js = urllib.request.urlopen(req2).read().decode('utf-8')
        api_urls = set(re.findall(r'https://[a-zA-Z0-9-]+\.onrender\.com', js))
        print("Backend URLs found:", api_urls)
    else:
        print("No js asset found. HTML chunk:", html[:200])
except Exception as e:
    print("Error:", e)
