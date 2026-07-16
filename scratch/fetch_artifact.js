const https = require('https');
const fs = require('fs');

const url = "https://claude.ai/public/artifacts/19dc376a-ac98-424e-b048-836888833442";

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

https.get(url, options, (res) => {
  console.log("Status Code:", res.statusCode);
  console.log("Headers:", res.headers);
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log("HTML Length:", data.length);
    fs.writeFileSync("scratch/claude_page.html", data);
    
    // Look for iframe
    const iframeRegex = /<iframe[^>]*src="([^"]+)"/g;
    let match;
    const iframes = [];
    while ((match = iframeRegex.exec(data)) !== null) {
      iframes.push(match[1]);
    }
    console.log("Iframes found:", iframes);

    // Look for JSON or embedded state
    // Let's check if there is an embed URL in the html or any API calls
    const jsonMatches = data.match(/\{"window\.__CF\$cv\$params[^}]+\}/g);
    console.log("CF params found:", jsonMatches);
    
    // Search for artifact id in the text
    const artifactId = "19dc376a-ac98-424e-b048-836888833442";
    console.log("Does HTML contain artifact ID?", data.includes(artifactId));
    
    // Let's search if there is a script containing window.initData or similar
    // Often Next.js apps or React apps have __NEXT_DATA__
    if (data.includes("__NEXT_DATA__")) {
      console.log("Found __NEXT_DATA__!");
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
