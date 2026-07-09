export type UploadFolder = "astrifer/starmaps/photos" | "astrifer/starmaps/voice";

interface SignResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Uploads a file straight from the browser to Cloudinary using a
 * server-minted signature (see app/api/upload/sign) — the file itself never
 * passes through our server. `auto` lets Cloudinary route images/audio to
 * the right resource type on its own.
 */
export async function uploadToCloudinary(file: File | Blob, folder: UploadFolder): Promise<string> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) {
    throw new Error("Yükleme izni alınamadı.");
  }
  const { signature, timestamp, apiKey, cloudName }: SignResponse = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) {
    throw new Error("Yükleme başarısız oldu.");
  }
  const data: { secure_url: string } = await uploadRes.json();
  return data.secure_url;
}
