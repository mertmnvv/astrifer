import urllib.request
import re
import json

url = "https://claude.ai/public/artifacts/19dc376a-ac98-424e-b048-836888833442"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print("HTML Length:", len(html))
        
        # Look for iframe tags
        iframes = re.findall(r'<iframe[^>]*src="([^"]+)"', html)
        print("Iframes found:", iframes)
        
        # Look for script tags with JSON
        scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
        print("Number of script contents found:", len(scripts))
        
        # Look for any JSON-like data or URLs
        # Claude public artifacts usually have a JSON state containing the artifact content
        # let's write html to a file to inspect it
        with open("scratch/claude_page.html", "w", encoding="utf-8") as f:
            f.write(html)
            
except Exception as e:
    print("Error:", e)
