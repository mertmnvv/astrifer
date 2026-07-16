const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\mertm\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
  // Edge is also chromium based and can be used as fallback
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

async function run() {
  let executablePath = null;
  for (const p of chromePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      console.log("Found browser at:", p);
      break;
    }
  }

  if (!executablePath) {
    console.error("No Chrome or Edge installation found in standard paths!");
    process.exit(1);
  }

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    console.log("Navigating to Claude artifact page...");
    await page.goto('https://claude.ai/public/artifacts/19dc376a-ac98-424e-b048-836888833442', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log("Page loaded DOM. Waiting 15 seconds for iframe render...");
    await new Promise(r => setTimeout(r, 15000));

    console.log("Inspecting frames...");
    const frames = page.frames();
    console.log(`Found ${frames.length} frames.`);

    let found = false;
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const url = frame.url();
      console.log(`Frame ${i}: URL = ${url}`);

      try {
        const content = await frame.content();
        console.log(`Frame ${i} content length: ${content.length}`);
        
        // Let's check if this is the artifact content (it should contain our design system keywords)
        if (content.includes("Gravür") || content.includes("Design System") || content.includes("ornament") || content.includes("cartouche")) {
          console.log(`Frame ${i} looks like the artifact content! Writing to file...`);
          fs.writeFileSync('scratch/scraped_artifact.html', content);
          found = true;
          
          // Let's extract any pre or code block text if it's a code artifact
          // If it's a preview of an HTML document, we wrote the full HTML which is perfect.
        }
      } catch (err) {
        console.log(`Could not read Frame ${i}:`, err.message);
      }
    }

    if (!found) {
      console.log("Design system keywords not found in frames. Let's write all frame HTMLs for debugging.");
      for (let i = 0; i < frames.length; i++) {
        try {
          const content = await frames[i].content();
          fs.writeFileSync(`scratch/frame_${i}.html`, content);
        } catch (e) {}
      }
    } else {
      console.log("Successfully extracted artifact!");
    }

  } catch (err) {
    console.error("An error occurred during scraping:", err);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

run();
