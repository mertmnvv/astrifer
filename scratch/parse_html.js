const fs = require('fs');
const html = fs.readFileSync("scratch/claude_page.html", "utf-8");

console.log("HTML length:", html.length);
// Print all script src attributes
const scriptSrcs = html.match(/<script[^>]*src="([^"]+)"/g) || [];
console.log("Script SRCS:", scriptSrcs);

// Look for any links or assets
const hrefs = html.match(/href="([^"]+)"/g) || [];
console.log("Hrefs:", hrefs.slice(0, 10));

// Let's search for json blocks
const scriptBlocks = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
console.log("Found", scriptBlocks.length, "script blocks");
scriptBlocks.forEach((block, idx) => {
  console.log(`Block ${idx} (Length ${block.length}):`, block.substring(0, 100) + "...");
});
