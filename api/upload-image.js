import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "6mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64 } = req.body || {};

  if (!base64) {
    return res.status(400).json({ error: "Missing base64 image data" });
  }

  try {
    // Extrahuj typ a data z data URL
    const match = base64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const contentType = match[1];
    const ext = contentType.split("/")[1] || "jpg";
    const buffer = Buffer.from(match[2], "base64");
    const filename = `linkedin-uploads/${Date.now()}.${ext}`;

    const blob = await put(filename, buffer, {
      access: "public",
      contentType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Upload selhal" });
  }
}
