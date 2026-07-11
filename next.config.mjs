/** @type {import('next').NextConfig} */
const nextConfig = {
  // puppeteer-core/@sparticuz/chromium ship native binaries that Next's
  // default bundler tracing can miss on serverless deploys (Vercel) —
  // keeping them external and explicitly traced avoids a broken production
  // bundle. See lib/printRender.ts.
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  },
};

export default nextConfig;
