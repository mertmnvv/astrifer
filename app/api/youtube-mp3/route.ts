import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import ytdl from "@distube/ytdl-core";
import { getCloudinaryEnv, isCloudinaryConfigured } from "@/lib/cloudinary/config";

// Configure Cloudinary server-side
if (isCloudinaryConfigured()) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function POST(request: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary yapılandırılmamış." }, { status: 503 });
  }

  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "Lütfen bir YouTube linki belirtin." }, { status: 400 });
    }

    const isValid = ytdl.validateURL(url);
    if (!isValid) {
      return NextResponse.json({ error: "Geçersiz YouTube linki." }, { status: 400 });
    }

    const videoId = ytdl.getURLVideoID(url);

    // Get video info to validate duration and existence
    const info = await ytdl.getInfo(url);
    const lengthSeconds = parseInt(info.videoDetails.lengthSeconds, 10);
    
    // Guard against excessively long videos (e.g. limit to 10 minutes to avoid timeouts)
    if (lengthSeconds > 600) {
      return NextResponse.json({ error: "Müzik süresi 10 dakikadan uzun olamaz." }, { status: 400 });
    }

    // Fetch the audio-only stream from YouTube
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    // Upload directly to Cloudinary
    const secureUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "astrifer/starmaps/music",
          resource_type: "video",
          public_id: `yt_${videoId}`,
          format: "mp3", // request mp3 conversion on upload
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error("Cloudinary upload failed."));
          }
        }
      );

      stream.on("error", (err) => {
        reject(err);
      });

      stream.pipe(uploadStream);
    });

    // Ensure the returned URL uses the mp3 extension so HTML5 audio handles it correctly
    let playUrl = secureUrl;
    const lastDot = playUrl.lastIndexOf(".");
    if (lastDot !== -1) {
      const ext = playUrl.substring(lastDot);
      if (ext.toLowerCase() !== ".mp3") {
        playUrl = playUrl.substring(0, lastDot) + ".mp3";
      }
    }

    return NextResponse.json({ url: playUrl });
  } catch (error: unknown) {
    console.error("YouTube-to-MP3 Conversion Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Dönüştürme sırasında bir hata oluştu.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
