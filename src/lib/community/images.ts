"use server";

import sharp from "sharp";

import { cloudinary, imageUploadConfig } from "@/lib/cloudinary";

export async function uploadCommunityImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Only image uploads are allowed.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Each community photo must be 5MB or smaller.");
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are required for community image uploads.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(input)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const base64 = `data:image/webp;base64,${compressed.toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, {
    folder: `${imageUploadConfig.folder}/community`,
    resource_type: "image",
    transformation: [{ fetch_format: "auto", quality: "auto", width: 800, crop: "limit" }],
  });

  return result.secure_url;
}
