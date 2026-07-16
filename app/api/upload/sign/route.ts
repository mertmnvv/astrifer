import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryEnv, isCloudinaryConfigured } from "@/lib/cloudinary/config";

const ALLOWED_FOLDERS = new Set(["astrifer/starmaps/photos", "astrifer/starmaps/voice", "astrifer/starmaps/videos"]);

/**
 * Mints a short-lived signature for a direct browser-to-Cloudinary upload.
 * The API secret never leaves the server — the client gets just enough
 * (timestamp + signature) to make one signed upload call for the folder it
 * asked for.
 */
export async function POST(request: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary yapılandırılmamış." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const folder = body?.folder;
  if (typeof folder !== "string" || !ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Geçersiz klasör." }, { status: 400 });
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
}
