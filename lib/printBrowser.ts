import "server-only";

/**
 * Launches the single headless-Chromium browser instance used by every
 * server-side print render (poster and journal alike). Shared so both
 * pipelines agree on the exact same production/dev launch strategy.
 */
export async function launchPrintBrowser() {
  const puppeteer = await import("puppeteer-core");

  if (process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    });
  }

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (!executablePath) {
    throw new Error(
      "PUPPETEER_EXECUTABLE_PATH tanımlı değil — geliştirme ortamında baskı render'ı için yerel bir Chrome/Chromium yolu gerekiyor.",
    );
  }
  return puppeteer.launch({ executablePath, headless: true });
}
